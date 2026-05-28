"""Fetch posts from RSS/Atom feeds."""

import hashlib
import re
import time
from datetime import datetime, timezone

import feedparser
import httpx

_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0 (RSS reader; +https://github.com)"}
_TIMEOUT = 15
_MAX_PER_FEED = 10


def _to_iso(parsed: tuple | None) -> str:
    if parsed is None:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = datetime.fromtimestamp(time.mktime(parsed), tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html).strip()


def fetch_rss(feeds: list[dict]) -> list[dict]:
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        for cfg in feeds:
            url = cfg["url"]
            display_name = cfg["displayName"]
            handle = cfg["handle"]
            group = cfg.get("group", "Builders")

            try:
                resp = client.get(url)
                resp.raise_for_status()
                feed = feedparser.parse(resp.text)

                if not feed.entries:
                    print(f"  [rss:{handle}] no entries")
                    continue

                count = 0
                for entry in feed.entries[:_MAX_PER_FEED]:
                    title = entry.get("title", "").strip()
                    link = entry.get("link", "").strip()
                    if not title or not link:
                        continue

                    # Try content > summary > description for body text
                    raw_body = ""
                    if entry.get("content"):
                        raw_body = entry["content"][0].get("value", "")
                    elif entry.get("summary"):
                        raw_body = entry["summary"]
                    elif entry.get("description"):
                        raw_body = entry["description"]

                    body = _strip_html(raw_body)[:600]
                    text = f"{title}\n\n{body}".strip() if body else title
                    published = _to_iso(
                        entry.get("published_parsed") or entry.get("updated_parsed")
                    )
                    post_id = hashlib.sha1(link.encode()).hexdigest()[:16]

                    posts.append(
                        {
                            "id": f"rss_{post_id}",
                            "platform": "rss",
                            "handle": handle,
                            "displayName": display_name,
                            "group": group,
                            "postedAt": published,
                            "text": text[:1000],
                            "summary": body[:200] or title,
                            "topics": [],
                            "intent": "opinion",
                            "importanceScore": 0.5,
                            "engagement": {
                                "likes": 0,
                                "reposts": 0,
                                "replies": 0,
                                "quotes": 0,
                            },
                            "url": link,
                            "whyItMatters": None,
                        }
                    )
                    count += 1

                print(f"  [rss:{handle}] {count} posts")

            except Exception as e:
                print(f"  [rss:{handle}] skipped: {e}")

    return posts
