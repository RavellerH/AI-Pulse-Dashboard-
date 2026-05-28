"""Fetch recent AI papers from arXiv (free Atom API, no auth)."""

import hashlib
import re
import time
from datetime import datetime, timezone

import feedparser
import httpx

_API = "http://export.arxiv.org/api/query"
_TIMEOUT = 30
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}


def _to_iso(parsed: tuple | None) -> str:
    if parsed is None:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = datetime.fromtimestamp(time.mktime(parsed), tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_arxiv(query: str, max_results: int = 15) -> list[dict]:
    posts: list[dict] = []

    try:
        with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS) as client:
            resp = client.get(
                _API,
                params={
                    "search_query": query,
                    "sortBy": "submittedDate",
                    "sortOrder": "descending",
                    "max_results": max_results,
                },
            )
            resp.raise_for_status()

        feed = feedparser.parse(resp.text)

        for entry in feed.entries:
            title = re.sub(r"\s+", " ", entry.get("title", "")).strip()
            if not title:
                continue

            authors_list = [a.get("name", "") for a in entry.get("authors", [])[:4]]
            authors_str = ", ".join(authors_list)
            if len(authors_list) == 4:
                authors_str += " et al."

            abstract = re.sub(r"\s+", " ", entry.get("summary", "")).strip()
            link = entry.get("link", "")
            arxiv_id = link.split("/abs/")[-1] if "/abs/" in link else link.split("/")[-1]

            text = f"{title}\n\nAuthors: {authors_str}\n\n{abstract[:600]}"
            published = _to_iso(entry.get("published_parsed"))
            post_id = hashlib.sha1(arxiv_id.encode()).hexdigest()[:16]

            # First author's last name as display name
            first_last = authors_list[0].split()[-1] if authors_list else "Unknown"
            display = f"{first_last} et al." if len(authors_list) > 1 else authors_list[0]

            posts.append(
                {
                    "id": f"arxiv_{post_id}",
                    "platform": "arxiv",
                    "handle": "@arxiv",
                    "displayName": display,
                    "group": "Research",
                    "postedAt": published,
                    "text": text[:1200],
                    "summary": f"[Paper] {title}",
                    "topics": ["research-papers"],
                    "intent": "research",
                    "importanceScore": 0.72,
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

        print(f"  [arxiv] {len(posts)} papers")

    except Exception as e:
        print(f"  [arxiv] skipped: {e}")

    return posts
