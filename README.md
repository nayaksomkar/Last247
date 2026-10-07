# Last247

> A 24-hour global news briefing **frontend/UI** project built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

This repository is the **frontend**. It talks to the Last247 **Python backend** (FastAPI, repo `OrcaDeLast247`) over HTTP. `UI_API_INTEGRATION.md` is the single source of truth for every endpoint, schema, and behavior the UI relies on.

---

## Overview

Last247 renders the most important stories from the last 24 hours. News is fetched, LLM-processed, and stored by the Python backend (the only component that talks to news providers, LLMPing, and the Turso database); the frontend only ever reads the final processed articles through the backend's JSON API.

### Architecture

```text
News providers
→ Python Orchestrator (OrcaDeLast247, FastAPI)
→ LLMPing (LLM parse)
→ Turso
→ HTTP API
→ Next.js UI (this repo)
```

### What the frontend does

- Checks backend liveness via `GET /health` (status pill in the navbar).
- Fetches the paginated feed via `GET /api/news` with `limit`/`offset` pagination and exact-match `category`/`source` filters.
- Opens the story reader drawer, which fetches the full article via `GET /api/news/{id}` (handles 404 `NOT_FOUND`).
- Shows database statistics and the last ingestion run via `GET /api/stats`.
- Handles loading (skeletons), empty, validation (422), network, and server-error states with retry actions.
- Switches between light and dark themes.

### What the frontend never does

- No news-provider API keys, no calls to NewsAPI/GNews/NewsData.io/LLMPing/Turso.
- No direct database access — DB credentials stay in the Python backend.
- No text search or user-configurable sorting — the backend doesn't provide them (fixed newest-first ordering).
- No authentication — the backend has none.

---

## Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Framework | **Next.js 16.3** (App Router) | Turbopack is the default builder. |
| UI library | **React 19.2** | Client components in `app/components/`. |
| Language | **TypeScript 5** | `strict` mode. |
| Styling | **Tailwind CSS v4** | CSS-first configuration in `app/globals.css`. |
| Icons | **lucide-react** | Inline SVG icon set. |
| Fonts | `next/font/google` → Plus Jakarta Sans | Loaded in `app/layout.tsx`. |
| Linting | **ESLint 9** + `eslint-config-next` | `npm run lint`. |
| Testing | **bun** (API contract checks) | `npm run test` → `scripts/test-api.ts`. |
| Package manager | **npm** | `package-lock.json` is the committed lockfile. |

---

## Quick Start

### 1. Start the backend (server)

Two options — the frontend works with either:

```bash
# Option A — use the deployed backend (default, zero setup)
# .env.local already points to https://orcadelast247.onrender.com — skip to step 2.

# Option B — run the backend locally (in the sibling OrcaDeLast247 repo, using uv)
cd ../OrcaDeLast247
uv sync                       # install deps (creates .venv)
cp .env.example .env          # then edit .env (TURSO_DATABASE_URL, provider keys)
uv run python main.py         # API server on http://localhost:8080
```

For Option B, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` in `.env.local` (step 2).

### 2. Start the UI

```bash
npm install                   # install dependencies

cp .env.example .env.local    # skip editing if using the deployed backend (Option A)

npm run dev                   # dev server on http://localhost:3000
```

Open **http://localhost:3000**. Note: `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time — restart the dev server (or rebuild) after changing them.

### Verify it's working

```bash
curl -s https://orcadelast247.onrender.com/health          # {"status":"ok",...}
curl -s "https://orcadelast247.onrender.com/api/news?limit=3"
```

### Environment variables

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL of the Python backend. Falls back to `http://localhost:8080`. |

This is the **only** environment variable this project reads. No secrets are needed — the backend holds the database and provider credentials.

---

## Python Backend (OrcaDeLast247)

The backend is a separate FastAPI service that fetches news (NewsAPI → GNews → NewsData.io → WebFetch fallback), parses each article via the LLMPing LLM Brain, stores the result in Turso, and serves this API. It ingests automatically at startup and every 8 hours — the UI never triggers ingestion for normal operation.

### Backend quick start (in the `OrcaDeLast247` repo, using uv)

```bash
cd ../OrcaDeLast247

# 1. Install dependencies (creates .venv, respects uv.lock)
uv sync

# 2. Configure environment
cp .env.example .env
# then edit .env: TURSO_DATABASE_URL, provider key(s), CORS_ALLOW_ORIGINS

# 3. Run the API server (default port 8080)
uv run python main.py
```

### Backend testing

```bash
uv run pytest   # self-contained: no network, no real API keys required
```

### Backend env vars (summary)

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `TURSO_DATABASE_URL` | — (required) | Turso URL (`libsql://…`) or local file (`file:./news.db`). |
| `MAX_ARTICLES` | `7` | Articles fetched + LLM-parsed per run. |
| `INGEST_INTERVAL` | `8h` | Background ingestion cadence (3 runs/day). |
| `RETENTION_DAYS` | `7` | Rolling article window; older rows deleted. |
| `CORS_ALLOW_ORIGINS` | `*` | Allowed origins for this frontend. |
| `SAMPLE_DATA` | `false` | `true`: feed bundled sample data through the same pipeline (testing). |

See `OrcaDeLast247/README.md` for the full list.

---

## Deploy to Vercel

The frontend is a standard Next.js (App Router) app — no special config needed.

1. **Push to GitHub** (remote `origin` is already set):

   ```bash
   git add -A
   git commit -m "Wire UI to the Python backend API"
   git push origin main
   ```

2. **Import the repo on [vercel.com](https://vercel.com/new)** — Vercel auto-detects Next.js. Build command (`next build`) and output are defaults; don't change them.

3. **Add the environment variable** in *Project → Settings → Environment Variables*:

   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_BASE_URL` | `https://orcadelast247.onrender.com` |

   This is the **only** variable the project needs. No secrets — the backend holds all credentials.

4. **Deploy.** `NEXT_PUBLIC_*` variables are inlined at build time — redeploy after changing them.

### GitHub-readiness checklist

- `.gitignore` excludes `.env*` (secrets never committed) — `.env.example` is the committed template.
- `.env.example` contains no real keys — only the public backend URL.
- `npm run lint` (ESLint) and `npm run test` (API contract checks via bun) are documented and runnable.
- Single env var, no build-time secrets, no server-side config needed.

---

## API Reference

See **`UI_API_INTEGRATION.md`** for the complete, verified contract. Summary:

| Endpoint | Used by | Notes |
| :--- | :--- | :--- |
| `GET /health` | Navbar status pill; feed gates its first fetch on it | Does not depend on the database. |
| `GET /api/news` | `TopStories` (feed) | `limit` (1–100, default 50; outside → 422), `offset` (≥ 0; negative → 422), exact-match `category`/`source`. Always 200 for valid params; empty array when nothing matches. Fixed newest-first ordering. |
| `GET /api/news/{id}` | `ArticleReader` drawer, `/article/[id]` page | 404 `NOT_FOUND` → "Article not found" state. |
| `GET /api/stats` | `StatsBar` | `last_ingestion` absent until the first run completes. |
| `POST /api/ingest` | Admin/internal only | Synchronous, quota-consuming. The UI does not need it. |

Error responses: `{"error": string, "code": string}` (`NOT_FOUND`, `INTERNAL_ERROR`, `INGEST_ERROR`, `INGEST_TIMEOUT`) except FastAPI 422 validation (`{"detail":[...]}`) for invalid `limit`/`offset`.

---

## Project Structure

```
.
├── app/
│   ├── article/[id]/page.tsx     # Article detail page (GET /api/news/{id}, 404 handling)
│   ├── components/
│   │   ├── ArticleImage.tsx      # image_url renderer with broken-image fallback
│   │   ├── ArticleReader.tsx     # Slide-over reader; fetches the article by ID
│   │   ├── FeaturedStory.tsx     # Lead story card
│   │   ├── Footer.tsx            # Site footer & back-to-top link
│   │   ├── Hero.tsx              # Page headline
│   │   ├── Navbar.tsx            # Navigation, theme toggle, /health status pill
│   │   ├── StatsBar.tsx          # GET /api/stats controls
│   │   ├── StoryCard.tsx         # News feed card item
│   │   └── TopStories.tsx        # Feed orchestrator: filters, pagination, states
│   ├── globals.css               # Tailwind v4 styles & theme tokens
│   ├── layout.tsx                # Root layout & Google fonts
│   └── page.tsx                  # Main page composition
├── lib/
│   ├── api.ts                    # Typed API service layer (one fn per endpoint)
│   ├── config.ts                 # API base URL from env
│   ├── events.ts                 # Cross-component UI events
│   ├── format.ts                 # Timestamp/read-time formatting
│   ├── hooks.ts                  # State management hooks
│   └── types.ts                  # Documented response schemas
├── scripts/test-api.ts           # Integration checks against the documented contract
├── UI_API_INTEGRATION.md         # Single source of truth for the API
└── .env.example                  # Environment variable template
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
| :--- | :--- | :--- |
| **"Feed unavailable" + network error** | The Python backend isn't running or `NEXT_PUBLIC_API_BASE_URL` is wrong | Start the backend (`uv run python main.py`, default port 8080) and verify the base URL in `.env.local`. |
| **"Live" pill shows "Offline"** | `/health` unreachable | The pill reflects `GET /health` only; check the backend service. |
| **"No stories have been collected yet"** | Database is empty | Expected before/during ingestion; stories appear after the next run. |
| **"Article not found"** | 404 `NOT_FOUND` from `GET /api/news/{id}` | The article was removed by the retention sweep or the ID is stale. |
| **422 on feed fetch** | Invalid `limit`/`offset` (outside 1–100 / negative) | The backend rejects — not clamps — invalid pagination params. |
| **Env change not picked up** | `NEXT_PUBLIC_*` vars are inlined at build/dev-server start | Restart the dev server after editing `.env.local`. |

Inspect the backend directly:

```bash
curl -s http://localhost:8080/health
curl -s "http://localhost:8080/api/news?limit=20&offset=0"
```
