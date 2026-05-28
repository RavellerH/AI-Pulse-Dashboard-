"""
Compute derived JSON artifacts (overview, people, topics, briefings)
from a flat list of enriched posts.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_str() -> str:
    return _now().strftime("%Y-%m-%dT%H:%M:%SZ")


def build_people(posts: list[dict[str, Any]], group_map: dict[str, str]) -> list[dict[str, Any]]:
    by_handle: dict[str, list[dict]] = defaultdict(list)
    for p in posts:
        by_handle[p["handle"]].append(p)

    people = []
    for handle_at, handle_posts in by_handle.items():
        handle = handle_at.lstrip("@")
        topic_counter: Counter = Counter()
        for p in handle_posts:
            for t in p.get("topics", []):
                topic_counter[t] += 1
        top_topics = [t for t, _ in topic_counter.most_common(4)]
        last_posted = max(p["postedAt"] for p in handle_posts)
        display_name = handle_posts[0].get("displayName", handle)
        group = group_map.get(handle) or handle_posts[0].get("group", "Builders")

        focus_topics = ", ".join(top_topics[:2]) if top_topics else "general AI"
        people.append(
            {
                "handle": handle_at,
                "displayName": display_name,
                "group": group,
                "lastPostedAt": last_posted,
                "posts7d": len(handle_posts),
                "topTopics": top_topics,
                "currentFocus": f"Posting mostly about {focus_topics} this week.",
            }
        )

    return sorted(people, key=lambda x: x["lastPostedAt"], reverse=True)


def build_topics(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cutoff_24h = (_now() - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")

    topic_posts: dict[str, list[dict]] = defaultdict(list)
    for p in posts:
        for t in p.get("topics", []):
            topic_posts[t].append(p)

    topics = []
    for slug, tposts in topic_posts.items():
        posts_24h = [p for p in tposts if p["postedAt"] >= cutoff_24h]
        top_handles = list(
            {
                p["handle"]
                for p in sorted(tposts, key=lambda x: x["importanceScore"], reverse=True)[:6]
            }
        )[:5]
        label = slug.replace("-", " ").title()
        topics.append(
            {
                "slug": slug,
                "label": label,
                "postCount24h": len(posts_24h),
                "summary": (
                    f"Active discussion on {label.lower()} across "
                    f"{len({p['handle'] for p in tposts})} tracked accounts."
                ),
                "topHandles": top_handles,
                "posts": sorted(tposts, key=lambda x: x["importanceScore"], reverse=True)[:5],
            }
        )

    return sorted(topics, key=lambda x: x["postCount24h"], reverse=True)


def build_overview(
    posts: list[dict[str, Any]],
    people: list[dict[str, Any]],
    topics: list[dict[str, Any]],
) -> dict[str, Any]:
    now = _now()
    cutoff_1h = (now - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    cutoff_24h = (now - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")

    posts_24h = [p for p in posts if p["postedAt"] >= cutoff_24h]
    posts_1h = [p for p in posts if p["postedAt"] >= cutoff_1h]
    important_1h = [p for p in posts_1h if p.get("importanceScore", 0) >= 0.7]

    top_signals = sorted(posts, key=lambda x: x.get("importanceScore", 0), reverse=True)[:5]
    active_people = sorted(people, key=lambda x: x["posts7d"], reverse=True)[:6]
    latest_feed = sorted(posts, key=lambda x: x["postedAt"], reverse=True)[:8]
    topic_leaders = [
        {
            "slug": t["slug"],
            "label": t["label"],
            "postCount24h": t["postCount24h"],
            "topHandles": t["topHandles"],
        }
        for t in topics[:10]
    ]

    return {
        "generatedAt": _now_str(),
        "stats": {
            "trackedAccounts": len({p["handle"] for p in posts}),
            "posts24h": len(posts_24h),
            "importantPosts1h": len(important_1h),
            "activeTopics": len({t for p in posts_24h for t in p.get("topics", [])}),
        },
        "topSignals": top_signals,
        "topicLeaders": topic_leaders,
        "activePeople": active_people,
        "latestFeed": latest_feed,
    }


def build_briefing(posts: list[dict[str, Any]]) -> dict[str, Any]:
    now = _now()
    cutoff_1h = (now - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    recent = [p for p in posts if p["postedAt"] >= cutoff_1h]
    top = sorted(recent, key=lambda x: x.get("importanceScore", 0), reverse=True)[:6]

    highlights = [f"{p['displayName']}: {p['summary']}" for p in top]
    entities = list(
        dict.fromkeys(
            name
            for p in top
            for name in [p["displayName"].split()[0]]
        )
    )

    lead = top[0]["summary"] if top else "No high-signal posts in the last hour."
    return {
        "id": f"hourly-{now.strftime('%Y-%m-%dT%H')}",
        "window": "1h",
        "title": f"Hourly Pulse — {now.strftime('%H:00')} UTC",
        "generatedAt": _now_str(),
        "summary": (
            f"{len(recent)} post{'s' if len(recent) != 1 else ''} in the last hour. "
            f"Top signal: {lead}"
        ),
        "highlights": highlights,
        "topEntities": entities,
        "debates": [],
        "recommendedPostIds": [p["id"] for p in top],
    }
