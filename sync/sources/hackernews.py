"""Fetch top AI stories from Hacker News via the Algolia search API (free, no auth)."""

import hashlib
import re
from datetime import datetime, timezone

import httpx

_API = "https://hn.algolia.com/api/v1/search_by_date"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}


def _safe_iso(s: str) -> str:
    if not s:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    # Algolia returns ISO8601 already
    return s.replace("+00:00", "Z")


def fetch_hackernews(
    queries: list[str],
    min_points: int = 50,
    max_results: int = 20,
) -> list[dict]:
    seen: set[str] = set()
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS) as client:
        for query in queries:
            if len(posts) >= max_results:
                break
            try:
                resp = client.get(
                    _API,
                    params={
                        "query": query,
                        "tags": "story",
                        "hitsPerPage": 15,
                        "numericFilters": f"points>{min_points}",
                    },
                )
                resp.raise_for_status()

                for hit in resp.json().get("hits", []):
                    hn_id = hit.get("objectID", "")
                    if not hn_id or hn_id in seen:
                        continue

                    title = hit.get("title", "").strip()
                    if not title:
                        continue

                    seen.add(hn_id)
                    article_url = hit.get("url") or f"https://news.ycombinator.com/item?id={hn_id}"
                    hn_url = f"https://news.ycombinator.com/item?id={hn_id}"
                    author = hit.get("author", "unknown")
                    points = hit.get("points", 0) or 0
                    comments = hit.get("num_comments", 0) or 0
                    created_at = _safe_iso(hit.get("created_at", ""))

                    # Normalise score: 50 pts → 0.30, 500 pts → 0.85
                    importance = round(min(0.95, 0.25 + (points / 600)), 2)

                    post_id = hashlib.sha1(hn_id.encode()).hexdigest()[:16]
                    text = f"{title}\n\n{article_url}" if article_url != hn_url else title

                    posts.append(
                        {
                            "id": f"hn_{post_id}",
                            "platform": "hackernews",
                            "handle": f"@{author}",
                            "displayName": f"HN · {author}",
                            "group": "Media",
                            "postedAt": created_at,
                            "text": text,
                            "summary": title,
                            "topics": [],
                            "intent": "opinion",
                            "importanceScore": importance,
                            "engagement": {
                                "likes": points,
                                "reposts": 0,
                                "replies": comments,
                                "quotes": 0,
                            },
                            "url": hn_url,
                            "whyItMatters": None,
                        }
                    )

            except Exception as e:
                print(f"  [hn:{query[:30]}] skipped: {e}")

    posts = posts[:max_results]
    print(f"  [hackernews] {len(posts)} stories")
    return posts
