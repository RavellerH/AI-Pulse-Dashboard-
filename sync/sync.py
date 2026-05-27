#!/usr/bin/env python3
"""
AI Pulse Dashboard — X sync script.

Usage:
    python -m sync.sync                   # real fetch + enrichment
    python -m sync.sync --dry-run         # skip fetch, use existing feed.json

Required env vars (real fetch):
    X_USERNAME      your X username or email
    X_EMAIL         your X email (for 2-step auth)
    X_PASSWORD      your X password

Optional env vars:
    ANTHROPIC_API_KEY   enables Claude enrichment (otherwise uses heuristics)
"""

import asyncio
import json
import os
import sys
import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

from .accounts import ACCOUNTS
from .enrich import enrich_posts
from .build_artifacts import build_people, build_topics, build_overview, build_briefing

DATA_DIR = Path("public/data")
COOKIES_PATH = Path("sync/.cookies.json")


def _now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_time(created_at: str | datetime) -> str:
    if isinstance(created_at, datetime):
        return created_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = parsedate_to_datetime(created_at)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return _now_str()


def normalize_tweet(tweet, handle: str, group: str) -> dict:
    text = getattr(tweet, "full_text", None) or getattr(tweet, "text", "") or ""
    return {
        "id": f"x_{tweet.id}",
        "platform": "x",
        "handle": f"@{handle}",
        "displayName": getattr(tweet.user, "name", handle) if tweet.user else handle,
        "group": group,
        "postedAt": _parse_time(tweet.created_at),
        "text": text,
        "summary": text[:160],
        "topics": [],
        "intent": "opinion",
        "importanceScore": 0.5,
        "engagement": {
            "likes": getattr(tweet, "favorite_count", 0) or 0,
            "reposts": getattr(tweet, "retweet_count", 0) or 0,
            "replies": getattr(tweet, "reply_count", 0) or 0,
            "quotes": getattr(tweet, "quote_count", 0) or 0,
        },
        "url": f"https://x.com/{handle}/status/{tweet.id}",
    }


async def fetch_account(client, handle: str, group: str, count: int = 15) -> list[dict]:
    posts = []
    try:
        user = await client.get_user_by_screen_name(handle)
        if not user:
            print(f"  [{handle}] not found")
            return []
        tweets = await client.get_user_tweets(user.id, "Tweets", count=count)
        for tweet in tweets:
            # Skip replies and native retweets
            if getattr(tweet, "in_reply_to", None):
                continue
            if getattr(tweet, "retweeted_tweet", None):
                continue
            posts.append(normalize_tweet(tweet, handle, group))
        print(f"  [{handle}] {len(posts)} posts")
    except Exception as e:
        print(f"  [{handle}] error: {e}")
    return posts


async def fetch_all(username: str, email: str, password: str) -> list[dict]:
    try:
        from twikit import Client
    except ImportError:
        print("ERROR: twikit not installed. Run: pip install twikit")
        sys.exit(1)

    client = Client("en-US")

    if COOKIES_PATH.exists():
        print(f"Loading cookies from {COOKIES_PATH}")
        client.load_cookies(str(COOKIES_PATH))
    else:
        print(f"Logging in as {username}…")
        await client.login(
            auth_info_1=username,
            auth_info_2=email,
            password=password,
        )
        COOKIES_PATH.parent.mkdir(exist_ok=True)
        client.save_cookies(str(COOKIES_PATH))
        print(f"Saved cookies to {COOKIES_PATH}")

    all_posts: list[dict] = []
    for handle, group in ACCOUNTS.items():
        posts = await fetch_account(client, handle, group)
        all_posts.extend(posts)
        await asyncio.sleep(1.2)   # polite rate limiting

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
