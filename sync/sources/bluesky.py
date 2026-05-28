"""Fetch posts from Bluesky via the public AT Protocol API (no auth required)."""

import hashlib
from datetime import datetime, timezone

import httpx

_API = "https://public.api.bsky.app/xrpc"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}


def _safe_iso(s: str) -> str:
    if not s:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    # Bluesky already returns ISO 8601; normalise trailing Z
    return s.replace("+00:00", "Z")


def fetch_bluesky(accounts: list[tuple[str, str, str]]) -> list[dict]:
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS) as client:
        for handle, display_name, group in accounts:
            try:
                resp = client.get(
                    f"{_API}/app.bsky.feed.getAuthorFeed",
                    params={
                        "actor": handle,
                        "limit": 15,
                        "filter": "posts_no_replies",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                count = 0
                for item in data.get("feed", []):
                    # Skip reposts
                    if item.get("reason"):
                        continue

                    post = item.get("post", {})
                    record = post.get("record", {})

                    text = record.get("text", "").strip()
                    if not text:
                        continue

                    created_at = _safe_iso(record.get("createdAt", ""))
                    uri = post.get("uri", "")
                    rkey = uri.split("/")[-1] if "/" in uri else uri
                    url = f"https://bsky.app/profile/{handle}/post/{rkey}"

                    post_id = hashlib.sha1(uri.encode()).hexdigest()[:16]

                    posts.append(
                        {
                            "id": f"bsky_{post_id}",
                            "platform": "bluesky",
                            "handle": f"@{handle}",
                            "displayName": display_name,
                            "group": group,
                            "postedAt": created_at,
                            "text": text,
                            "summary": text[:200],
                            "topics": [],
                            "intent": "opinion",
                            "importanceScore": 0.5,
                            "engagement": {
                                "likes": post.get("likeCount", 0) or 0,
                                "reposts": post.get("repostCount", 0) or 0,
                                "replies": post.get("replyCount", 0) or 0,
                                "quotes": post.get("quoteCount", 0) or 0,
                            },
                            "url": url,
                            "whyItMatters": None,
                        }
                    )
                    count += 1

                print(f"  [bsky:{handle}] {count} posts")

            except Exception as e:
                print(f"  [bsky:{handle}] skipped: {e}")

    return posts
