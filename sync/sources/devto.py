"""Fetch AI articles from Dev.to (free public API, no auth required)."""

import hashlib
from datetime import datetime, timezone

import httpx

_API = "https://dev.to/api/articles"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}


def fetch_devto(
    tags: list[str],
    per_page: int = 15,
    min_reactions: int = 10,
) -> list[dict]:
    seen: set[str] = set()
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS) as client:
        for tag in tags:
            try:
                resp = client.get(
                    _API,
                    params={"tag": tag, "per_page": per_page, "top": 1},
                )
                resp.raise_for_status()

                for article in resp.json():
                    article_id = str(article.get("id", ""))
                    if not article_id or article_id in seen:
                        continue

                    reactions = article.get("public_reactions_count", 0) or 0
                    if reactions < min_reactions:
                        continue

                    title = article.get("title", "").strip()
                    url = article.get("url", "").strip()
                    if not title or not url:
                        continue

                    seen.add(article_id)
                    description = (article.get("description") or "").strip()
                    user = article.get("user", {})
                    author_name = user.get("name", "unknown")
                    author_handle = user.get("username", "unknown")

                    raw_published = article.get("published_at") or ""
                    published = raw_published.replace("+00:00", "Z")
                    if not published:
                        published = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                    post_id = hashlib.sha1(article_id.encode()).hexdigest()[:16]
                    text = f"{title}\n\n{description}".strip() if description else title
                    importance = round(min(0.90, 0.40 + (reactions / 500)), 2)

                    posts.append(
                        {
                            "id": f"devto_{post_id}",
                            "platform": "devto",
                            "handle": f"@{author_handle}",
                            "displayName": f"{author_name} · dev.to",
                            "group": "Builders",
                            "postedAt": published,
                            "text": text[:1000],
                            "summary": title,
                            "topics": [],
                            "intent": "research",
                            "importanceScore": importance,
                            "whyItMatters": None,
                            "engagement": {
                                "likes": reactions,
                                "reposts": 0,
                                "replies": article.get("comments_count", 0) or 0,
                                "quotes": 0,
                            },
                            "url": url,
                        }
                    )

            except Exception as e:
                print(f"  [devto:{tag}] skipped: {e}")

    posts = posts[:per_page]
    print(f"  [devto] {len(posts)} articles")
    return posts
