"""
Source configuration: RSS feeds, Bluesky accounts, and fetch parameters.
All sources are free and require no API keys.
Add/remove entries freely — the fetchers skip sources that fail silently.
"""

# (url, displayName, handle-slug, group)
# handle-slug is used as the @handle value in the feed — should match X handle
# if the person is also tracked on X, so posts merge cleanly under one person.
RSS_FEEDS: list[dict] = [
    # ── AI Lab official blogs ───────────────────────────────────────────────
    {
        "url": "https://openai.com/news.rss",
        "displayName": "OpenAI",
        "handle": "@OpenAI",
        "group": "Frontier",
    },
    {
        "url": "https://www.anthropic.com/news.rss",
        "displayName": "Anthropic",
        "handle": "@AnthropicAI",
        "group": "Frontier",
    },
    {
        "url": "https://deepmind.google/discover/blog/rss.xml",
        "displayName": "Google DeepMind",
        "handle": "@GoogleDeepMind",
        "group": "Frontier",
    },
    {
        "url": "https://ai.meta.com/blog/rss/",
        "displayName": "Meta AI",
        "handle": "@MetaAI",
        "group": "Frontier",
    },
    {
        "url": "https://mistral.ai/news/rss.xml",
        "displayName": "Mistral AI",
        "handle": "@MistralAI",
        "group": "Frontier",
    },
    {
        "url": "https://huggingface.co/blog/feed.xml",
        "displayName": "Hugging Face",
        "handle": "@huggingface",
        "group": "Research",
    },
    {
        "url": "https://cohere.com/blog/rss",
        "displayName": "Cohere",
        "handle": "@cohere",
        "group": "Frontier",
    },
    {
        "url": "https://stability.ai/news/rss.xml",
        "displayName": "Stability AI",
        "handle": "@StabilityAI",
        "group": "Builders",
    },
    # ── Individual researchers ──────────────────────────────────────────────
    {
        "url": "https://karpathy.github.io/feed.xml",
        "displayName": "Andrej Karpathy",
        "handle": "@karpathy",
        "group": "Research",
    },
    {
        "url": "https://lilianweng.github.io/index.xml",
        "displayName": "Lilian Weng",
        "handle": "@lilianweng",
        "group": "Research",
    },
    {
        "url": "https://sebastianraschka.com/feed.xml",
        "displayName": "Sebastian Raschka",
        "handle": "@rasbt",
        "group": "Research",
    },
    {
        "url": "https://www.fast.ai/index.xml",
        "displayName": "Jeremy Howard",
        "handle": "@jeremyphoward",
        "group": "Research",
    },
    # ── Newsletters & education ─────────────────────────────────────────────
    {
        "url": "https://www.oneusefulthing.org/feed",
        "displayName": "Ethan Mollick",
        "handle": "@emollick",
        "group": "Media",
    },
    {
        "url": "https://www.deeplearning.ai/the-batch/rss/",
        "displayName": "The Batch (DeepLearning.AI)",
        "handle": "@AndrewYNg",
        "group": "Research",
    },
    {
        "url": "https://importai.substack.com/feed",
        "displayName": "Import AI (Jack Clark)",
        "handle": "@jackclarkSF",
        "group": "Research",
    },
    # ── Research publications ───────────────────────────────────────────────
    {
        "url": "https://thegradient.pub/rss/",
        "displayName": "The Gradient",
        "handle": "@gradient_pub",
        "group": "Research",
    },
    {
        "url": "https://bair.berkeley.edu/blog/feed.xml",
        "displayName": "BAIR Blog",
        "handle": "@bair_ai",
        "group": "Research",
    },
]

# (bsky-handle, displayName, group)
# Only needs the handle — API is fully public.
BLUESKY_ACCOUNTS: list[tuple[str, str, str]] = [
    ("ylecun.bsky.social",       "Yann LeCun",          "Research"),
    ("karpathy.bsky.social",     "Andrej Karpathy",     "Research"),
    ("drfeifei.bsky.social",     "Fei-Fei Li",          "Research"),
    ("emollick.bsky.social",     "Ethan Mollick",       "Media"),
    ("rasbt.bsky.social",        "Sebastian Raschka",   "Research"),
]

# arXiv categories to monitor (cs.AI, cs.LG=ML, cs.CL=NLP, cs.CV)
ARXIV_QUERY = "cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV"
ARXIV_MAX_RESULTS = 15

# HackerNews Algolia search terms (de-duped across queries)
HN_QUERIES = [
    "GPT OR Claude OR Gemini OR LLM",
    "OpenAI OR Anthropic OR DeepMind OR Mistral",
    "artificial intelligence machine learning deep learning",
]
HN_MIN_POINTS = 50
HN_MAX_RESULTS = 20

# Reddit subreddits (public JSON API, no auth)
REDDIT_SUBREDDITS: list[dict] = [
    {"subreddit": "MachineLearning", "group": "Research"},
    {"subreddit": "LocalLLaMA",      "group": "Builders"},
    {"subreddit": "artificial",      "group": "Media"},
]
REDDIT_MIN_SCORE = 50
REDDIT_MAX_PER_SUB = 8

# YouTube channels (free RSS, channel_id required, no API key)
YOUTUBE_CHANNELS: list[dict] = [
    {"channelId": "UCbfYPyITQ-7l4upoX8nvctg", "displayName": "Two Minute Papers", "handle": "@TwoMinutePapers", "group": "Research"},
    {"channelId": "UCZHmQk67mSJgfCCTn7xBfew", "displayName": "Yannic Kilcher",     "handle": "@YannicKilcher",   "group": "Research"},
    {"channelId": "UCNJ1Ymd5yFuUPtn21xtRbbw", "displayName": "AI Explained",       "handle": "@AIExplained",     "group": "Media"},
    {"channelId": "UCSHZKyawb77ixDdsGog4iWA", "displayName": "Lex Fridman",         "handle": "@lexfridman",      "group": "Media"},
    {"channelId": "UC-7kGbyZ0DwT3SBeOuTDSLQ", "displayName": "Matt Wolfe",          "handle": "@mreflow",         "group": "Media"},
]

# Product Hunt (free RSS, no auth)
PRODUCTHUNT_MAX_RESULTS = 10

# Dev.to (free public API, no auth)
DEVTO_TAGS = ["ai", "machinelearning", "llm"]
DEVTO_PER_PAGE = 15
DEVTO_MIN_REACTIONS = 10
