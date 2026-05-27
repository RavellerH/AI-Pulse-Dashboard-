"""
Claude-based enrichment for raw posts.
Falls back to keyword heuristics if ANTHROPIC_API_KEY is not set.
"""

import json
import os
from typing import Any

from .accounts import TOPIC_KEYWORDS

# ---- Heuristic fallback (no API key required) ----

def tag_topics_heuristic(text: str) -> list[str]:
    text_lower = text.lower()
    found = [
        topic
        for topic, kws in TOPIC_KEYWORDS.items()
        if any(kw in text_lower for kw in kws)
    ]
    return found[:4] or ["llms"]


def guess_intent_heuristic(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["paper", "arxiv", "results", "benchmark", "experiment"]):
        return "research"
    if any(w in t for w in ["how to", "tutorial", "learn", "guide", "explain", "lesson"]):
        return "education"
    if any(w in t for w in ["demo", "built", "shipping", "launched", "here it is", "just shipped"]):
        return "demo"
    if any(w in t for w in ["revenue", "mrr", "arr", "founded", "startup", "raised"]):
        return "startup"
    if any(w in t for w in ["released", "announcing", "introducing", "now available", "launching"]):
        return "product"
    if any(w in t for w in ["prompt", "prompting", "system prompt", "chain of thought"]):
        return "prompting"
    if any(w in t for w in ["image", "art", "creative", "design", "generate"]):
        return "creative"
    if any(w in t for w in ["policy", "regulation", "safety", "alignment", "governance"]):
        return "policy"
    return "opinion"


def importance_heuristic(engagement: dict[str, int]) -> float:
    likes = engagement.get("likes", 0)
    reposts = engagement.get("reposts", 0)
    replies = engagement.get("replies", 0)
    score = likes + reposts * 3 + replies * 2
    return round(min(0.97, max(0.3, score / (score + 800))), 2)


def enrich_heuristic(post: dict[str, Any]) -> dict[str, Any]:
    text = post.get("text", "")
    return {
        **post,
        "summary": text[:180].rstrip() + ("…" if len(text) > 180 else ""),
        "topics": tag_topics_heuristic(text),
        "intent": guess_intent_heuristic(text),
        "importanceScore": importance_heuristic(post.get("engagement", {})),
    }


# ---- Claude enrichment ----

ENRICH_SYSTEM = """You enrich social media posts from AI researchers and builders for a monitoring dashboard.
Return only valid JSON with these exact keys:
- summary: one sharp sentence (≤25 words) capturing the core claim or action
- topics: array of 1-4 tags from the allowed vocabulary
- intent: one value from the allowed intents
- importanceScore: float 0.0-1.0 for someone tracking AI developments (0.9+ = landmark; 0.7-0.9 = notable; below 0.5 = routine)
- whyItMatters: one sentence context, or null

Allowed topics: llms, agents, research-papers, frontier-models, open-source, startup-ideas, monetization, prompting, images-video, developer-workflows, education, policy
Allowed intents: research, education, product, demo, opinion, startup, policy, prompting, creative"""

ENRICH_USER = """Post from {handle} (group: {group}):
{text}

JSON:"""


def enrich_batch_claude(
    posts: list[dict[str, Any]],
    api_key: str,
    batch_size: int = 20,
) -> list[dict[str, Any]]:
    """Enrich posts using the Claude API with prompt caching."""
    try:
        import anthropic
    except ImportError:
        print("  [enrich] anthropic not installed — falling back to heuristics")
        return [enrich_heuristic(p) for p in posts]

    client = anthropic.Anthropic(api_key=api_key)
    enriched: list[dict[str, Any]] = []

    for i in range(0, len(posts), batch_size):
        batch = posts[i : i + batch_size]
        for post in batch:
            try:
                resp = client.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=256,
                    system=[
                        {
                            "type": "text",
                            "text": ENRICH_SYSTEM,
                            "cache_control": {"type": "ephemeral"},
                        }
                    ],
                    messages=[
                        {
                            "role": "user",
                            "content": ENRICH_USER.format(
                                handle=post.get("handle", "unknown"),
                                group=post.get("group", "unknown"),
                                text=post.get("text", ""),
                            ),
                        }
                    ],
                )
                raw = resp.content[0].text.strip()
                data = json.loads(raw)
                enriched.append(
                    {
                        **post,
                        "summary": data.get("summary", post.get("summary", "")),
                        "topics": data.get("topics", post.get("topics", [])),
                        "intent": data.get("intent", post.get("intent", "opinion")),
                        "importanceScore": float(
                            data.get("importanceScore", post.get("importanceScore", 0.5))
                        ),
                        "whyItMatters": data.get("whyItMatters"),
                    }
                )
            except Exception as e:
                print(f"  [enrich] Claude failed for {post.get('id')}: {e} — using heuristic")
                enriched.append(enrich_heuristic(post))

    return enriched


def enrich_posts(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if api_key:
        print(f"  Using Claude enrichment for {len(posts)} posts")
        return enrich_batch_claude(posts, api_key)
    print(f"  Using heuristic enrichment for {len(posts)} posts (set ANTHROPIC_API_KEY for Claude)")
    return [enrich_heuristic(p) for p in posts]
