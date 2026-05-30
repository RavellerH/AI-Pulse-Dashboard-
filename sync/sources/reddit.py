"""Fetch top AI posts from Reddit subreddits (free public JSON API, no auth required)."""

import hashlib
from datetime import datetime, timezone

import httpx

_API = "https://www.reddit.com/r/{subreddit}/top.json"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0 (open source AI monitor; github.com)"}


def fetch_reddit(
    subreddits: list[dict],
    min_score: int = 50,
    max_per_sub: int = 10,
) -> list[dict]:
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        for cfg in subreddits:
            subreddit = cfg["subreddit"]
            group = cfg.get("group", "Media")
            try:
                resp = client.get(
                    _API.format(subreddit=subreddit),
                    params={"t": "day", "limit": 25},
                )
                resp.raise_for_status()
                data = resp.json()

                count = 0
                for child in data["data"]["children"]:
                    if count >= max_per_sub:
                        break
                    item = child["data"]

                    score = item.get("score", 0) or 0
                    if score < min_score:
                        continue

                    title = item.get("title", "").strip()
                    if not title:
                        continue

                    selftext = (item.get("selftext") or "").strip()[:400]
                    article_url = item.get("url", "")
                    permalink = "https://www.reddit.com" + item.get("permalink", "")
                    author = item.get("author", "unknown")
                    created_utc = item.get("created_utc", 0)
                    dt = datetime.fromtimestamp(created_utc, tz=timezone.utc)
                    posted_at = dt.strftime("%Y-%m-%dT%H:%M:%SZ")

                    if selftext:
                        text = f"{title}\n\n{selftext}"
                    elif article_url and article_url != permalink:
                        text = f"{title}\n\n{article_url}"
                    else:
                        text = title

                    importance = round(min(0.95, 0.25 + (score / 1000)), 2)
                    post_id = hashlib.sha1(item.get("id", title).encode()).hexdigest()[:16]

                    posts.append(
                        {
                            "id": f"reddit_{post_id}",
                            "platform": "reddit",
                            "handle": f"@r/{subreddit}",
                            "displayName": f"r/{subreddit}",
                            "group": group,
                            "postedAt": posted_at,
                            "text": text[:1000],
                            "summary": title,
                            "topics": [],
                            "intent": "opinion",
                            "importanceScore": importance,
                            "whyItMatters": None,
                            "engagement": {
                                "likes": score,
                                "reposts": 0,
                                "replies": item.get("num_comments", 0) or 0,
                                "quotes": 0,
                            },
                            "url": permalink,
                        }
                    )
                    count += 1

                print(f"  [reddit:r/{subreddit}] {count} posts")

            except Exception as e:
                print(f"  [reddit:r/{subreddit}] skipped: {e}")

    return posts
