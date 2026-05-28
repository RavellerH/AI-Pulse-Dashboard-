#!/usr/bin/env python3
"""
AI Pulse Dashboard — X sync script.

Usage:
    python -m sync.sync                   # real fetch + enrichment
    python -m sync.sync --dry-run         # skip fetch, use existing feed.json

Required env vars (real fetch):
    X_USERNAME      your X username
    X_EMAIL         your X account email
    X_PASSWORD      your X account password

Optional env vars:
    X_EMAIL_PASSWORD    email-account password (defaults to X_PASSWORD if not set)
    ANTHROPIC_API_KEY   enables Claude enrichment (otherwise uses heuristics)
"""

import asyncio
import json
import os
import sys
import argparse
from datetime import datetime, timezone
from pathlib import Path

from .accounts import ACCOUNTS
from .enrich import enrich_posts
from .build_artifacts import build_people, build_topics, build_overview, build_briefing

DATA_DIR = Path("public/data")
TWSCRAPE_DB = Path("sync/.twscrape.db")


def _now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def normalize_tweet(tweet, handle: str, group: str) -> dict:
    text = getattr(tweet, "rawContent", None) or ""
    return {
        "id": f"x_{tweet.id}",
        "platform": "x",
        "handle": f"@{handle}",
        "displayName": tweet.user.displayname if tweet.user else handle,
        "group": group,
        "postedAt": tweet.date.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "text": text,
        "summary": text[:160],
        "topics": [],
        "intent": "opinion",
        "importanceScore": 0.5,
        "engagement": {
            "likes": getattr(tweet, "likeCount", 0) or 0,
            "reposts": getattr(tweet, "retweetCount", 0) or 0,
            "replies": getattr(tweet, "replyCount", 0) or 0,
            "quotes": getattr(tweet, "quoteCount", 0) or 0,
        },
        "url": f"https://x.com/{handle}/status/{tweet.id}",
    }


async def fetch_account(api, handle: str, group: str, count: int = 15) -> list[dict]:
    posts = []
    try:
        from twscrape import gather
        user = await api.user_by_login(handle)
        if not user:
            print(f"  [{handle}] not found")
            return []
        tweets = await gather(api.user_tweets(user.id, limit=count))
        for tweet in tweets:
            if getattr(tweet, "inReplyToTweetId", None):
                continue
            if getattr(tweet, "retweetedTweet", None):
                continue
            posts.append(normalize_tweet(tweet, handle, group))
        print(f"  [{handle}] {len(posts)} posts")
    except Exception as e:
        print(f"  [{handle}] error: {e}")
    return posts


async def fetch_all(username: str, email: str, password: str) -> list[dict]:
    try:
        from twscrape import API
    except ImportError:
        print("ERROR: twscrape not installed. Run: pip install twscrape")
        sys.exit(1)

    TWSCRAPE_DB.parent.mkdir(exist_ok=True)
    api = API(str(TWSCRAPE_DB))

    email_password = os.environ.get("X_EMAIL_PASSWORD", password)
    print(f"Adding account {username} to pool…")
    await api.pool.add_account(username, password, email, email_password)

    print("Logging in…")
    await api.pool.login_all()
    print("Pool ready")

    all_posts: list[dict] = []
    for handle, group in ACCOUNTS.items():
        posts = await fetch_account(api, handle, group)
        all_posts.extend(posts)
        await asyncio.sleep(0.8)   # polite rate limiting

    return all_posts


def write_output(posts: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    people = build_people(posts, ACCOUNTS)
    topics = build_topics(posts)
    overview = build_overview(posts, people, topics)
    new_briefing = build_briefing(posts)

    # Prepend new briefing, keep last 10
    briefings_file = DATA_DIR / "briefings.json"
    existing: list[dict] = []
    if briefings_file.exists():
        try:
            existing = json.loads(briefings_file.read_text()).get("briefings", [])[:9]
        except Exception:
            pass
    briefings_list = [new_briefing] + [
        b for b in existing if b["id"] != new_briefing["id"]
    ]

    now_str = _now_str()
    artifacts: dict[str, dict] = {
        "manifest.json": {
            "generatedAt": now_str,
            "sourcePlatform": "x",
            "sourceCount": len({p["handle"] for p in posts}),
            "postWindowHours": 168,
            "dataVersion": now_str.replace(":", "-"),
        },
        "feed.json": {"generatedAt": now_str, "posts": posts},
        "people.json": {"generatedAt": now_str, "people": people},
        "topics.json": {"generatedAt": now_str, "topics": topics},
        "briefings.json": {"generatedAt": now_str, "briefings": briefings_list},
        "overview.json": overview,
    }

    for filename, data in artifacts.items():
        path = DATA_DIR / filename
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"  Wrote {path}")


async def main(dry_run: bool = False) -> None:
    print("=== AI Pulse — X Sync ===")

    if dry_run:
        feed_path = DATA_DIR / "feed.json"
        if not feed_path.exists():
            print("ERROR: --dry-run requires existing public/data/feed.json")
            sys.exit(1)
        print("Dry-run: loading existing posts from feed.json")
        data = json.loads(feed_path.read_text())
        raw_posts: list[dict] = data.get("posts", [])
    else:
        x_user = os.environ.get("X_USERNAME", "")
        x_email = os.environ.get("X_EMAIL", "")
        x_pass = os.environ.get("X_PASSWORD", "")
        if not all([x_user, x_email, x_pass]):
            print("ERROR: X_USERNAME, X_EMAIL, X_PASSWORD must be set (or use --dry-run)")
            sys.exit(1)
        print(f"Fetching {len(ACCOUNTS)} accounts…")
        raw_posts = await fetch_all(x_user, x_email, x_pass)

    print(f"\nEnriching {len(raw_posts)} posts…")
    enriched = enrich_posts(raw_posts)
    enriched.sort(key=lambda p: p["postedAt"], reverse=True)

    print("\nWriting JSON artifacts…")
    write_output(enriched)

    print(f"\nDone — {len(enriched)} posts from {len({p['handle'] for p in enriched})} accounts.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Skip fetch; enrich existing feed.json")
    args = parser.parse_args()
    asyncio.run(main(dry_run=args.dry_run))
