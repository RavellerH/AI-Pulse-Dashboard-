# Sync Pipeline

Fetches posts from tracked X accounts and outputs JSON for the dashboard.

## Local setup

```bash
pip install -r sync/requirements.txt
```

Set env vars:

```bash
export X_USERNAME="your_x_username"
export X_EMAIL="your_x_email@example.com"
export X_PASSWORD="your_x_password"

# Optional — enables Claude enrichment instead of keyword heuristics
export ANTHROPIC_API_KEY="sk-ant-..."
```

Run sync:

```bash
# Full sync (fetches live X data)
python -m sync.sync

# Dry-run (enriches existing public/data/feed.json without fetching)
python -m sync.sync --dry-run
```

## GitHub Actions secrets to set

In your repo → Settings → Secrets and variables → Actions:

| Secret | Required | Purpose |
|---|---|---|
| `X_USERNAME` | Yes | Your X username |
| `X_EMAIL` | Yes | Your X account email |
| `X_PASSWORD` | Yes | Your X account password |
| `X_EMAIL_PASSWORD` | No | Email-account password (defaults to `X_PASSWORD` if not set) |
| `ANTHROPIC_API_KEY` | No | Claude enrichment (uses heuristics if absent) |

## How it works

1. `sync.py` logs into X via `twscrape` (unofficial, no API key needed)
2. Fetches last 15 tweets from each of the 28 tracked accounts
3. Enriches each post: topics, intent, importance score, summary
   - With `ANTHROPIC_API_KEY`: uses Claude Haiku (cheap, fast)
   - Without: uses keyword heuristics (free, less accurate)
4. Writes updated `public/data/*.json`
5. Vite builds the static app including the fresh data
6. Deploys to GitHub Pages

## Migration to official API

When you're ready for a public launch, swap `fetch_all()` in `sync.py` for
calls to the X v2 API (`GET /2/users/:id/tweets`). The rest of the pipeline
(enrichment, artifact building, deploy) stays the same.
