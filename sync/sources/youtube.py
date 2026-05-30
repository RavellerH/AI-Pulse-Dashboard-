"""Fetch recent videos from YouTube channels via RSS (free, no auth, no API key)."""

import hashlib
import time
from datetime import datetime, timezone

import feedparser
import httpx

_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
_TIMEOUT = 15
_HEADERS = {"User-Agent": "AI-Pulse-Dashboard/1.0"}
_MAX_PER_CHANNEL = 5


def fetch_youtube(channels: list[dict]) -> list[dict]:
    posts: list[dict] = []

    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        for cfg in channels:
            channel_id = cfg["channelId"]
            display_name = cfg["displayName"]
            handle = cfg["handle"]
            group = cfg.get("group", "Media")
            try:
                resp = client.get(_FEED_URL.format(channel_id=channel_id))
                resp.raise_for_status()
                feed = feedparser.parse(resp.text)

                count = 0
                for entry in feed.entries[:_MAX_PER_CHANNEL]:
                    title = entry.get("title", "").strip()
                    link = entry.get("link", "").strip()
                    if not title or not link:
                        continue

                    # YouTube RSS includes the video description in media:description or summary
                    summary = ""
                    for m in entry.get("media_group", [{}]):
                        summary = m.get("media_description", "") if isinstance(m, dict) else ""
                        if summary:
                            break
                    if not summary:
                        summary = entry.get("summary", "")
                    summary = summary.strip()[:400]

                    published = entry.get("published_parsed")
                    if published:
                        dt = datetime.fromtimestamp(time.mktime(published), tz=timezone.utc)
                        posted_at = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    else:
                        posted_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                    text = f"{title}\n\n{summary}".strip() if summary else title
                    post_id = hashlib.sha1(link.encode()).hexdigest()[:16]

                    posts.append(
                        {
                            "id": f"youtube_{post_id}",
                            "platform": "youtube",
                            "handle": handle,
                            "displayName": display_name,
                            "group": group,
                            "postedAt": posted_at,
                            "text": text[:1000],
                            "summary": f"[Video] {title}",
                            "topics": [],
                            "intent": "research",
                            "importanceScore": 0.70,
                            "whyItMatters": None,
                            "engagement": {
                                "likes": 0,
                                "reposts": 0,
                                "replies": 0,
                                "quotes": 0,
                            },
                            "url": link,
                        }
                    )
                    count += 1

                print(f"  [youtube:{handle}] {count} videos")

            except Exception as e:
                print(f"  [youtube:{handle}] skipped: {e}")

    return posts
