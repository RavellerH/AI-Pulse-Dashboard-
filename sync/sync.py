#!/usr/bin/env python3
"""
AI Pulse Dashboard — multi-source sync script.

Usage:
    python -m sync.sync                   # full fetch from all sources
    python -m sync.sync --dry-run         # skip fetch, enrich existing feed.json
    python -m sync.sync --no-x            # skip X; use RSS/Bluesky/arXiv/HN only

Sources (all free, no API keys):
  • X / Twitter via twscrape (optional — env vars required)
  • RSS / Atom feeds (AI lab blogs, researcher blogs, newsletters)
  • Bluesky AT Protocol public API
  • arXiv cs.AI / cs.LG / cs.CL / cs.CV
  • Hacker News (Algolia search API)

Required env vars (X sync only):
    X_USERNAME, X_EMAIL, X_PASSWORD

Optional env vars:
    X_EMAIL_PASSWORD    (email-account password; defaults to X_PASSWORD)
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
from .sources.config import (
    RSS_FEEDS,
    BLUESKY_ACCOUNTS,
    ARXIV_QUERY,
    ARXIV_MAX_RESULTS,
    HN_QUERIES,
    HN_MIN_POINTS,
    HN_MAX_RESULTS,
)

DATA_DIR = Path("public/data")
TWSCRAPE_DB = Path("sync/.twscrape.db")


def _now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ── X fetch via twscrape ───────────────────────────────────────────────────

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


async def fetch_account_x(api, handle: str, group: str, count: int = 15) -> list[dict]:
    posts = []
    try:
        from twscrape import gather
        user = await api.user_by_login(handle)
        if not user:
            print(f"  [@{handle}] not found on X")
            return []
        tweets = await gather(api.user_tweets(user.id, limit=count))
        for tweet in tweets:
            if getattr(tweet, "inReplyToTweetId", None):
                continue
            if getattr(tweet, "retweetedTweet", None):
                continue
            posts.append(normalize_tweet(tweet, handle, group))
        print(f"  [@{handle}] {len(posts)} X posts")
    except Exception as e:
        print(f"  [@{handle}] error: {e}")
    return posts


async def fetch_x(username: str, email: str, password: str) -> list[dict]:
    try:
        from twscrape import API
    except ImportError:
        print("  twscrape not installed — skipping X")
        return []

    TWSCRAPE_DB.parent.mkdir(exist_ok=True)
    api = API(str(TWSCRAPE_DB))

    email_password = os.environ.get("X_EMAIL_PASSWORD", password)
    await api.pool.add_account(username, password, email, email_password)
    await api.pool.login_all()

    all_posts: list[dict] = []
    for handle, group in ACCOUNTS.items():
        posts = await fetch_account_x(api, handle, group)
        all_posts.extend(posts)
        await asyncio.sleep(0.8)

    return all_posts


# ── Other sources (sync, not async) ───────────────────────────────────────

def fetch_all_other() -> list[dict]:
    from .sources.rss import fetch_rss
    from .sources.bluesky import fetch_bluesky
    from .sources.arxiv import fetch_arxiv
    from .sources.hackernews import fetch_hackernews

    posts: list[dict] = []

    print("\nRSS feeds…")
    posts.extend(fetch_rss(RSS_FEEDS))

    print("\nBluesky…")
    posts.extend(fetch_bluesky(BLUESKY_ACCOUNTS))

    print("\narXiv…")
    posts.extend(fetch_arxiv(ARXIV_QUERY, ARXIV_MAX_RESULTS))

    print("\nHacker News…")
    posts.extend(fetch_hackernews(HN_QUERIES, HN_MIN_POINTS, HN_MAX_RESULTS))

    return posts


# ── Output ─────────────────────────────────────────────────────────────────

def write_output(posts: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    people = build_people(posts, ACCOUNTS)
    topics = build_topics(posts)
    overview = build_overview(posts, people, topics)
    new_briefing = build_briefing(posts)

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
    platforms = list({p["platform"] for p in posts})
    artifacts: dict[str, dict] = {
        "manifest.json": {
            "generatedAt": now_str,
            "sourcePlatforms": platforms,
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


# ── Deduplication ──────────────────────────────────────────────────────────

def dedup(posts: list[dict]) -> list[dict]:
    """Remove duplicate posts by URL (same article from different sources)."""
    seen_urls: set[str] = set()
    seen_ids: set[str] = set()
    result: list[dict] = []
    for p in posts:
        url = p.get("url", "")
        pid = p.get("id", "")
        if (url and url in seen_urls) or (pid and pid in seen_ids):
            continue
        seen_urls.add(url)
        seen_ids.add(pid)
        result.append(p)
    return result


# ── Main ───────────────────────────────────────────────────────────────────

async def main(dry_run: bool = False, no_x: bool = False) -> None:
    print("=== AI Pulse — Multi-Source Sync ===")

    if dry_run:
        feed_path = DATA_DIR / "feed.json"
        if not feed_path.exists():
            print("ERROR: --dry-run requires existing public/data/feed.json")
            sys.exit(1)
        print("Dry-run: loading existing posts from feed.json")
        raw_posts: list[dict] = json.loads(feed_path.read_text()).get("posts", [])
    else:
        raw_posts = []

        # 1. X (optional)
        x_user = os.environ.get("X_USERNAME", "")
        x_email = os.environ.get("X_EMAIL", "")
        x_pass = os.environ.get("X_PASSWORD", "")

        if not no_x and all([x_user, x_email, x_pass]):
            print(f"\nX — fetching {len(ACCOUNTS)} accounts…")
            try:
                x_posts = await fetch_x(x_user, x_email, x_pass)
                raw_posts.extend(x_posts)
                print(f"  X total: {len(x_posts)} posts")
            except Exception as e:
                print(f"  X sync failed: {e} — continuing with other sources")
        else:
            print("\nX — skipped (no credentials or --no-x flag)")

        # 2. RSS / Bluesky / arXiv / HN
        other_posts = fetch_all_other()
        raw_posts.extend(other_posts)

        raw_posts = dedup(raw_posts)
        print(f"\nTotal before enrichment: {len(raw_posts)} posts from {len({p['handle'] for p in raw_posts})} sources")

    print(f"\nEnriching {len(raw_posts)} posts…")
    enriched = enrich_posts(raw_posts)
    enriched.sort(key=lambda p: p["postedAt"], reverse=True)

    print("\nWriting JSON artifacts…")
    write_output(enriched)

    platforms = list({p["platform"] for p in enriched})
    print(f"\nDone — {len(enriched)} posts · {len({p['handle'] for p in enriched})} sources · platforms: {', '.join(platforms)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Skip fetch; enrich existing feed.json")
    parser.add_argument("--no-x", action="store_true", help="Skip X sync; use RSS/Bluesky/arXiv/HN only")
    args = parser.parse_args()
    asyncio.run(main(dry_run=args.dry_run, no_x=args.no_x))
