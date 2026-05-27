"""Curated account list with group assignments."""

ACCOUNTS: dict[str, str] = {
    # Research
    "karpathy": "Research",
    "demishassabis": "Research",
    "ylecun": "Research",
    "AndrewYNg": "Research",
    "drfeifei": "Research",
    "jeremyphoward": "Research",
    "rasbt": "Research",
    "dair_ai": "Research",
    # Frontier / Product
    "sama": "Frontier",
    "gdb": "Frontier",
    "OfficialLoganK": "Frontier",
    # Media
    "lexfridman": "Media",
    # Business / Operators
    "alliekmiller": "Business",
    "gregisenberg": "Business",
    "levelsio": "Business",
    "marclou": "Business",
    "eptwts": "Business",
    # Builders / Agents / Tools
    "mattshumer_": "Builders",
    "steipete": "Builders",
    "rileybrown": "Builders",
    "jackfriks": "Builders",
    "EXM7777": "Builders",
    "vasuman": "Builders",
    "godofprompt": "Builders",
    "MengTo": "Builders",
    "AmirMushich": "Builders",
    "0xROAS": "Builders",
    "egeberkina": "Builders",
}

TOPIC_KEYWORDS: dict[str, list[str]] = {
    "llms": [
        "llm", "gpt", "claude", "gemini", "transformer", "language model",
        "context window", "tokenizer", "attention", "fine-tun", "rlhf",
    ],
    "agents": [
        "agent", "agentic", "autonomous", "multi-agent", "orchestration",
        "tool use", "function calling", "mcp", "computer use",
    ],
    "research-papers": [
        "paper", "arxiv", "benchmark", "dataset", "research", "study",
        "experiment", "ablation", "preprint",
    ],
    "frontier-models": [
        "gpt-5", "o3", "o4", "gemini 2", "claude 4", "frontier",
        "state of the art", "sota", "model release",
    ],
    "open-source": [
        "open source", "open-source", "llama", "mistral", "qwen", "weights",
        "hugging face", "open weights", "oss",
    ],
    "startup-ideas": [
        "startup", "mrr", "arr", "saas", "founder", "product market fit",
        "launch", "indie hacker", "bootstrapped",
    ],
    "monetization": [
        "revenue", "money", "business model", "pricing", "subscription",
        "profit", "income", "roi", "monetize",
    ],
    "prompting": [
        "prompt", "chain of thought", "few-shot", "zero-shot",
        "system prompt", "prompt engineering", "cot",
    ],
    "images-video": [
        "image", "video", "diffusion", "midjourney", "dall-e", "sora",
        "stable diffusion", "flux", "generate image",
    ],
    "developer-workflows": [
        "coding", "code", "vscode", "cursor", "copilot", "ide",
        "workflow", "productivity", "ship", "deploy",
    ],
    "education": [
        "learn", "tutorial", "course", "teach", "explain", "guide",
        "notebook", "lesson", "walkthrough",
    ],
    "policy": [
        "regulation", "policy", "law", "safety", "alignment",
        "governance", "congress", "eu ai", "risk",
    ],
}
