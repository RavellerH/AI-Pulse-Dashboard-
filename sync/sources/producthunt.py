"""Fetch top products from Product Hunt (free RSS feed, no auth required)."""

import hashlib
import re
import time
from datetime import datetime, timezone

import feedparser
import httpx

_FEED_URL = "https://www.producthunt.com/feed"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}


def _strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html).strip()


def _to_iso(parsed: tuple | None) -> str:
    if parsed is None:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = datetime.fromtimestamp(time.mktime(parsed), tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_producthunt(max_results: int = 10) -> list[dict]:
    posts: list[dict] = []
    try:
        with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
            resp = client.get(_FEED_URL)
            resp.raise_for_status()

        feed = feedparser.parse(resp.text)

        for entry in feed.entries[:max_results]:
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            if not title or not link:
                continue

            raw_summary = entry.get("summary", "")
            body = _strip_html(raw_summary)[:400]
            published = _to_iso(entry.get("published_parsed"))
            post_id = hashlib.sha1(link.encode()).hexdigest()[:16]
            text = f"{title}\n\n{body}".strip() if body else title

            posts.append(
                {
                    "id": f"ph_{post_id}",
                    "platform": "producthunt",
                    "handle": "@ProductHunt",
                    "displayName": "Product Hunt",
                    "group": "Builders",
                    "postedAt": published,
                    "text": text[:1000],
                    "summary": title,
                    "topics": ["startups", "developer-workflows"],
                    "intent": "product",
                    "importanceScore": 0.65,
                    "whyItMatters": None,
                    "engagement": {"likes": 0, "reposts": 0, "replies": 0, "quotes": 0},
                    "url": link,
                }
            )

        print(f"  [producthunt] {len(posts)} products")

    except Exception as e:
        print(f"  [producthunt] skipped: {e}")

    return posts
