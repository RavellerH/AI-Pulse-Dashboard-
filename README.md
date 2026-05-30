# AI Pulse Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?logo=github)](https://ravellerh.github.io/AI-Pulse-Dashboard-/)
[![Build](https://github.com/RavellerH/AI-Pulse-Dashboard-/actions/workflows/deploy.yml/badge.svg)](https://github.com/RavellerH/AI-Pulse-Dashboard-/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-67%25-3178C6?logo=typescript)](src/)
[![Python](https://img.shields.io/badge/Python-30%25-3776AB?logo=python)](sync/)

A real-time AI & tech news aggregator dashboard with multi-source data feeds, live USD/IDR financial tracking, and a currency threshold alert system. Built as a static site deployed on GitHub Pages with an automated Python sync pipeline.

**[Live Demo](https://ravellerh.github.io/AI-Pulse-Dashboard-/)** → `https://ravellerh.github.io/AI-Pulse-Dashboard-/`

---

## Features

### Content Aggregation
- **Multi-source feed** pulling from X/Twitter, Reddit, YouTube, Product Hunt, Dev.to, Bluesky, arXiv, HackerNews, and RSS feeds
- **AI-enriched summaries** using Claude Haiku (optional) or keyword heuristics
- **Topic filtering** to focus on AI, tech, and relevant trends

### Pages
| Page | Description |
|------|-------------|
| **Overview** | High-level summary of latest AI news and trends |
| **Feed** | Chronological multi-source content feed |
| **Briefings** | Curated digest-style summaries |
| **Topics** | Browse content by topic/category |
| **People** | Track AI figures and thought leaders |
| **Rp & AI Costs** | Live USD/IDR chart, AI service pricing, and affordability analysis |
| **About** | Project info and source list |

### Financial Monitoring
- **Live USD/IDR exchange rate chart** with historical data
- **Rp 20,000 Threshold Watch** — worst-case analysis for when 1 USD approaches Rp 20,000
- AI service cost calculator in Indonesian Rupiah

### Infrastructure
- Automated sync via **GitHub Actions** (scheduled + on-push)
- Fully **static frontend** — no server required
- Mobile-first responsive UI with bottom tab navigation

---

## Tech Stack

**Frontend**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [React Router v6](https://reactrouter.com/) — routing

**Backend / Sync**
- Python 3 with [twscrape](https://github.com/vladkens/twscrape) for X/Twitter
- RSS, Bluesky, arXiv, HackerNews, Reddit, YouTube, Product Hunt via native APIs
- Optional [Claude Haiku](https://www.anthropic.com/) enrichment via `ANTHROPIC_API_KEY`

**DevOps**
- GitHub Actions for CI/CD and scheduled sync
- GitHub Pages for hosting

---

## Project Structure

```
AI-Pulse-Dashboard-/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Build & deploy to GitHub Pages
│       └── sync-deploy.yml     # Run sync pipeline then deploy
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Route-level page components
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx
│   └── main.tsx
├── sync/
│   ├── sources/                # Per-source sync scripts
│   ├── sync.py                 # Main sync entrypoint
│   ├── enrich.py               # Claude enrichment module
│   ├── build_artifacts.py      # Builds JSON artifacts for the frontend
│   ├── accounts.py             # X/Twitter account management
│   └── requirements.txt        # Python dependencies
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- An X/Twitter account (for the X sync source)

### 1. Clone the repo

```bash
git clone https://github.com/RavellerH/AI-Pulse-Dashboard-.git
cd AI-Pulse-Dashboard-
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. (Optional) Run the sync pipeline locally

```bash
pip install -r sync/requirements.txt
```

Set environment variables:

```bash
export X_USERNAME=your_x_username
export X_EMAIL=your_x_email
export X_PASSWORD=your_x_password
export ANTHROPIC_API_KEY=your_key  # optional, enables AI enrichment
```

Then run:

```bash
python -m sync.sync
```

Use `--dry-run` to enrich existing data without fetching new posts.

### 5. Build for production

```bash
npm run build
```

---

## Deployment

This project is automatically deployed to **GitHub Pages** via GitHub Actions.

For your own deployment:

1. Fork or clone the repo
2. Go to **Settings → Pages** and set the source to GitHub Actions
3. Add the following secrets under **Settings → Secrets and variables → Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `X_USERNAME` | Yes | Your X/Twitter username |
| `X_EMAIL` | Yes | Your X/Twitter email |
| `X_PASSWORD` | Yes | Your X/Twitter password |
| `X_EMAIL_PASSWORD` | No | Email password (if 2FA) |
| `ANTHROPIC_API_KEY` | No | Enables Claude-based enrichment |

4. Push to trigger the workflow or run it manually from the **Actions** tab

---

## Data Sources

| Source | Type | Notes |
|--------|------|-------|
| X / Twitter | Social | Via `twscrape` |
| Reddit | Social | AI/tech subreddits |
| YouTube | Video | AI channels |
| Bluesky | Social | Tech community |
| HackerNews | Forum | `show`, `ask`, `best` |
| arXiv | Research | AI/ML papers |
| Product Hunt | Products | AI tool launches |
| Dev.to | Articles | Developer content |
| RSS | Various | Custom feeds |

---

## Roadmap

- [ ] User-configurable source filters
- [ ] Bookmark / save articles
- [ ] Push notification support
- [ ] More currency pairs beyond USD/IDR
- [ ] Dark/light theme toggle
- [ ] Search across all aggregated content

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- [twscrape](https://github.com/vladkens/twscrape) for X/Twitter scraping
- [Anthropic Claude](https://www.anthropic.com/) for optional content enrichment
- All open-source libraries listed in `package.json` and `sync/requirements.txt`
