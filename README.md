# Last247

> A 24-hour global news wire, built as a clean scrollable feed. **Open → scroll → see news → tap a story → read → close.**

Last247 consists of **two repositories**: this one is the **frontend/UI** (Next.js); the **backend/orchestrator** is a separate Python service (`OrcaDeLast247`). The frontend is read-only — it never talks to news providers, LLMPing, or the database directly.

## Repositories

| Repo | Role |
| :--- | :--- |
| [nayaksomkar/Last247](https://github.com/nayaksomkar/Last247/tree/main) | **Frontend / UI** (this repo) — Next.js + React + TypeScript + Tailwind, consumes the backend JSON API only. |
| [nayaksomkar/OrcaDeLast247](https://github.com/nayaksomkar/OrcaDeLast247) | **Backend / Orchestrator** — Python FastAPI service: fetches from news providers, LLM-parses via LLMPing, stores in Turso, serves the JSON API. |

## Architecture

```text
News Providers
↓
OrcaDeLast247 Backend / Orchestrator (FastAPI)
↓
Turso
↓
Last247 Frontend / UI (this repo)
```

### What the frontend does

- Fetches the paginated feed via `GET /api/news` (`limit`/`offset`) and renders it as a single-column feed of story cards.
- Opens a frosted-glass story popup, which fetches the full article via `GET /api/news/{id}` (handles 404 `NOT_FOUND`).
- Handles loading, empty, validation (422), network, and server-error states with retry actions.
- Switches between light and dark themes.

### What the frontend never does

- No news-provider API keys, no calls to NewsAPI/GNews/NewsData.io/WebFetch/LLMPing/Turso.
- No direct database access — DB credentials stay in the Python backend.
- No authentication, no likes/comments/follows — it's a feed, not a social network.

---

## Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Framework | **Next.js 16.3** (App Router) | Turbopack is the default builder. |
| UI library | **React 19.2** | Client components in `app/components/`. |
| Language | **TypeScript 5** | `strict` mode. |
| Styling | **Tailwind CSS v4** | CSS-first configuration in `app/globals.css`. |
| Icons | **lucide-react** | Inline SVG icon set. |
| Fonts | `next/font/google` → Space Grotesk (body) + Silkscreen (display) | Loaded in `app/layout.tsx`. |
| Linting | **ESLint 9** + `eslint-config-next` | `npm run lint`. |
| Testing | **bun** (API contract checks) | `npm run test` → `scripts/test-api.ts`. |
| Package manager | **npm** | `package-lock.json` is the committed lockfile. |

---

## Quick Start

### 1. Start the backend (server)

Two options — the frontend works with either:

```bash
# Option A — use the deployed backend (zero backend setup)
# cp .env.example .env, then set NEXT_PUBLIC_API_BASE_URL to the deployed
# backend URL (Render). Ask the team for it — it is not committed to this repo.

# Option B — run the backend locally (in the sibling OrcaDeLast247 repo, using uv)
cd ../OrcaDeLast247
uv sync                       # install deps (creates .venv)
cp .env.example .env          # then edit .env (TURSO_DATABASE_URL, provider keys)
uv run python main.py         # API server on http://localhost:8080
```

For Option B, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` in `.env` (step 2).

### 2. Start the UI

```bash
npm install                   # install dependencies

cp .env.example .env          # skip editing if using the deployed backend (Option A)

npm run dev                   # dev server on http://localhost:3000
```

Open **http://localhost:3000**. Note: `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time — restart the dev server (or rebuild) after changing them.

### Verify it's working

```bash
curl -s "$NEXT_PUBLIC_API_BASE_URL/health"          # {"status":"ok",...}
curl -s "$NEXT_PUBLIC_API_BASE_URL/api/news?limit=3"
```

### Environment variables

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL of the Python backend. Falls back to `http://localhost:8080`. |

This is the **only** environment variable this project reads. No secrets are needed — the backend holds the database and provider credentials.

---

## Deploy to Vercel

1. **Push to GitHub** (remote `origin` is already set):

   ```bash
   git add -A
   git commit -m "Redesign the Last247 frontend"
   git push origin main
   ```

2. **Import the repo on [vercel.com](https://vercel.com/new)** — Vercel auto-detects Next.js. Build command (`next build`) and output are defaults; don't change them.

3. **Add the environment variable** in *Project → Settings → Environment Variables*:

   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_BASE_URL` | your deployed backend URL (Render) |

4. **Deploy.** `NEXT_PUBLIC_*` variables are inlined at build time — redeploy after changing them.

---

## API Reference

See **`UI_API_INTEGRATION.md`** for the complete, verified contract. What the UI uses:

| Endpoint | Used by | Notes |
| :--- | :--- | :--- |
| `GET /api/news` | Feed | `limit` (1–100, default 50; outside → 422), `offset` (≥ 0; negative → 422). Fixed newest-first ordering; empty array when nothing matches. |
| `GET /api/news/{id}` | Story popup | 404 `NOT_FOUND` → "story not found" state. |
| `GET /health` | Optional liveness probe | The UI renders news regardless of `/health`. |

Error responses: `{"error": string, "code": string}` (`NOT_FOUND`, `INTERNAL_ERROR`, …) except FastAPI 422 validation (`{"detail":[...]}`) for invalid `limit`/`offset`.

---

## Project Structure

```
.
├── app/
│   ├── components/
│   │   ├── ArticleImage.tsx      # image_url renderer with broken-image fallback
│   │   ├── ArticleReader.tsx     # Frosted story popup; fetches the article by ID
│   │   ├── Feed.tsx              # Feed orchestrator: states, pagination
│   │   ├── Footer.tsx            # Site footer with repository attribution
│   │   ├── GithubIcon.tsx        # GitHub mark SVG (inline, no icon dependency)
│   │   ├── Navbar.tsx            # Frosted floating nav: brand + theme toggle
│   │   └── StoryCard.tsx         # News feed post item
│   ├── globals.css               # Tailwind v4 styles & theme tokens
│   ├── layout.tsx                # Root layout & Google fonts
│   └── page.tsx                  # Masthead + feed + footer
├── lib/
│   ├── api.ts                    # Typed API service layer (one fn per endpoint)
│   ├── config.ts                 # API base URL from env
│   ├── format.ts                 # Timestamp/read-time formatting, marker stripping
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
| **"The wire is down" + network error** | The Python backend isn't running or `NEXT_PUBLIC_API_BASE_URL` is wrong | Start the backend (`uv run python main.py`, default port 8080) and verify the base URL in `.env`. |
| **"Nothing yet"** | Database is empty | Expected before/during ingestion; stories appear after the next run. |
| **"Story not found"** | 404 `NOT_FOUND` from `GET /api/news/{id}` | The article was removed by the retention sweep or the ID is stale. |
| **422 on feed fetch** | Invalid `limit`/`offset` (outside 1–100 / negative) | The backend rejects — not clamps — invalid pagination params. |
| **Env change not picked up** | `NEXT_PUBLIC_*` vars are inlined at build/dev-server start | Restart the dev server after editing `.env`. |
