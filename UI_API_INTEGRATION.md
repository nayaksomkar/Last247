# Last247 — UI / API Integration Guide

Single reference for the frontend/UI team. Everything here is verified against
the actual backend implementation (OrcaDeLast247: `main.py`, `models.py`,
`database.py`, `ingest.py`, `config.py`).

**The UI talks only to this backend.** It never calls NewsAPI, GNews,
NewsData.io, LLMPing, or Turso directly — those are backend/internal services.

---

## 1. Overview

The Last247 backend is a **Python (FastAPI) HTTP service** (repo:
`OrcaDeLast247`) that:

1. **Fetches** news from provider APIs (NewsAPI → GNews → NewsData.io →
   WebFetch, sequential fallback — first success wins).
2. **Normalizes** the provider response and selects up to `MAX_ARTICLES` (7)
   articles per run.
3. **Parses** each stored article via the external **LLMPing** LLM Brain
   (`POST /chat`) and stores the parsed answer on the article row.
4. **Stores** everything in the Turso `news` database.
5. **Serves** the final processed articles via a JSON HTTP API.

```text
News providers
    ↓
OrcaDeLast247 Python Orchestrator
    ↓
Fetch/normalize news
    ↓
Select configured articles (MAX_ARTICLES=7)
    ↓
LLMPing /chat
    ↓
LLM parses/structures article
    ↓
Turso `news` database
    ↓
Last247 Backend API
    ↓
Next.js UI
```

The frontend talks to the backend via HTTP. The backend never calls the
frontend.

---

## 2. Base URL

The service binds to `0.0.0.0` on the `PORT` env var (default `8080`).

| Environment | Base URL |
|-------------|----------|
| Local dev   | `http://localhost:8080` |
| Deployed    | `https://<your-service>.onrender.com` (Render sets PORT/URL) |

The frontend reads the base URL from `NEXT_PUBLIC_API_BASE_URL`
(see `lib/config.ts` — falls back to `http://localhost:8080`).

**Authentication: none.** No API keys, tokens, or headers are required.

---

## 3. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/health` | Liveness probe. |
| `GET`  | `/api/news` | Paginated list of processed articles. |
| `GET`  | `/api/news/{id}` | Single article by ID. |
| `GET`  | `/api/stats` | Total count + last ingestion summary. |
| `POST` | `/api/ingest` | Manual/internal ingestion trigger. |

---

### `GET /health` — Liveness Check

**Parameters:** None. Does **not** touch the database — a 200 means the HTTP
process is up, not that the DB is reachable (use `GET /api/stats` for that).

**Response — 200 OK**

```json
{
  "status": "ok",
  "timestamp": "2026-10-06T22:38:01Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"ok"` when the service is running. |
| `timestamp` | string | Current UTC time, RFC 3339 (`Z` suffix). |

**Error responses:** None under normal operation.

---

### `GET /api/news` — List Processed Articles (most important)

Returns the **processed articles stored in the Turso `news` database** — the
final records after normalization, LLM parsing, and deduplication. Paginated,
newest first.

**Query Parameters**

| Parameter | Type | Required | Default | Limits | Behavior |
|-----------|------|----------|---------|--------|----------|
| `limit` | int | No | 50 | 1–100 | Page size. Outside 1–100 (or non-numeric) → `422`. |
| `offset` | int | No | 0 | ≥ 0 | Rows to skip for pagination. Negative → `422`. |
| `category` | string | No | (none) | — | Exact match; empty/omitted → no filter. |
| `source` | string | No | (none) | — | Exact match (AND-combined with `category`). |

- **Sorting is fixed**: newest first (`published_at DESC`), with `id ASC` as a
  stable tiebreaker. No user-configurable sorting and no text search.
- `total` = count of matching rows **before** pagination → use it for
  has-more/paging math.
- **Valid params always return 200**, even when nothing matches
  (`articles: []`).
- Invalid `limit`/`offset` are **rejected with `422`** (FastAPI validation) —
  they are not silently clamped.

**Response — 200 OK**

```json
{
  "articles": [
    {
      "id": "cec160263817dd2b",
      "title": "Doc check article",
      "description": "A short summary",
      "content": "Body text",
      "url": "https://example.com/doc-check/article-1",
      "image_url": "https://example.com/image.jpg",
      "source": "The Tech Chronicle",
      "author": "Maya Okafor",
      "category": "technology",
      "published_at": "2026-10-06T09:30:00+00:00",
      "fetched_at": "2026-10-06T11:00:05+00:00",
      "provider": "newsapi",
      "llm_answer": "{\"title\": \"...\", \"summary\": \"...\", \"key_points\": [\"...\"]}",
      "llm_provider": "openai",
      "llm_model": "gpt-4o-mini",
      "llm_processed_at": "2026-10-06T11:00:07Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

| Field | Type | Description |
|-------|------|-------------|
| `articles` | array | Article objects (see §4). Empty array `[]` when nothing matches. Optional fields are **omitted** from each object when empty — keys vary per article. |
| `total` | int | Total matching articles (before pagination). |
| `limit` | int | The limit value used (echoed back). |
| `offset` | int | The offset value used (echoed back). |

**Error responses**

| Status | When | Body |
|--------|------|------|
| 422 | `limit` outside 1–100 / non-numeric, or `offset` negative | `{"detail":[{"loc":["query","limit"],"msg":"...","type":"..."}]}` (FastAPI validation shape) |
| 500 | Database query failed | `{"error": "failed to fetch articles", "code": "INTERNAL_ERROR"}` |

**Examples:**

```
GET /api/news
GET /api/news?limit=20&offset=40
GET /api/news?category=technology&limit=10
GET /api/news?source=BBC+News&limit=10
```

---

### `GET /api/news/{id}` — Get Article by ID

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | 16-char lowercase hex — first 16 chars of `SHA-256(article URL)`. Deterministic: the same URL always yields the same ID, so links stay stable across re-ingestion. |

**Response — 200 OK**: one Article object (shape in §4).

**Error responses**

| Status | Code | Body |
|--------|------|------|
| 404 | `NOT_FOUND` | `{"error": "article with id \"xyz\" not found", "code": "NOT_FOUND"}` — article never existed or aged out of the 7-day retention window. |
| 500 | `INTERNAL_ERROR` | `{"error": "failed to fetch article", "code": "INTERNAL_ERROR"}` |

---

### `GET /api/stats` — Database Statistics

**Parameters:** None

**Response — 200 OK**

```json
{
  "total_articles": 6,
  "last_ingestion": {
    "provider": "newsapi",
    "total": 6,
    "inserted": 6,
    "skipped": 0,
    "deleted": 0,
    "parsed": 6,
    "parse_failed": 0,
    "source_time": "2026-10-06T22:45:19Z"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `total_articles` | int | Total articles currently in the `news` table. |
| `last_ingestion` | object \| absent | Result of the most recent run. **Absent** (key not present) until at least one ingestion run has completed — before that the response is only `{"total_articles": N}`. |

**`last_ingestion` sub-fields**

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | Provider that won the fallback chain: `"newsapi"`, `"gnews"`, `"newsdata"`, `"webfetch"`, `"sample"` (sample mode), or `""` if all failed/unconfigured. |
| `total` | int | Articles returned by the provider before the cap/dedup. |
| `inserted` | int | Rows upserted into the database. |
| `skipped` | int | Articles dropped (no title/URL, in-run duplicate URL, or DB error). |
| `deleted` | int | Stale articles removed by the retention sweep. |
| `parsed` | int | Articles successfully processed by the LLMPing LLM Brain this run. |
| `parse_failed` | int | Articles whose LLM parse failed — the row stays stored with no `llm_*` fields. |
| `source_time` | string | When the provider was queried (RFC 3339 UTC, `Z` suffix). |

**Error responses:** 500 `INTERNAL_ERROR` (DB count failed).

---

### `POST /api/ingest` — Trigger Ingestion (manual/internal)

Triggers one full ingestion cycle **synchronously** (fetch → normalize →
`MAX_ARTICLES` cap → dedup → Turso upsert → per-article LLMPing parse →
retention sweep) and returns its result.

- **Parameters:** None. **Request body:** None (empty body).
- Blocks until the run finishes or `INGEST_TIMEOUT` (default 900 s) elapses —
  can take minutes because it runs up to 7 sequential LLMPing calls.
- **Not for normal frontend usage.** The backend ingests automatically at
  startup and every `INGEST_INTERVAL` (8 h) — the UI only needs to poll
  `GET /api/news`. This endpoint is unauthenticated and consumes real provider
  quota; surface it only in an admin tool, if at all.

**Response — 200 OK**

```json
{
  "success": true,
  "result": {
    "provider": "newsapi",
    "total": 6,
    "inserted": 6,
    "skipped": 0,
    "deleted": 0,
    "parsed": 6,
    "parse_failed": 0,
    "source_time": "2026-10-06T22:45:19Z"
  }
}
```

**Error responses**

| Status | Code | When |
|--------|------|------|
| 500 | `INGEST_TIMEOUT` | Run exceeded `INGEST_TIMEOUT`. |
| 500 | `INGEST_ERROR` | Run failed (e.g., database unreachable). |

---

## 4. Article Data Model

The `Article` Pydantic model (`models.py`) is the canonical data shape. It
matches the `news` table columns exactly. Optional fields are serialized with
`exclude_none=True` — **they are omitted from the JSON when empty; there is no
`null`**.

```typescript
interface Article {
  id: string;            // 16-char hex, SHA-256(URL)[:16], deterministic
  title: string;         // ALWAYS PRESENT — required, non-empty
  url: string;           // ALWAYS PRESENT — required, dedup key
  published_at: string;  // ALWAYS PRESENT — ISO 8601 UTC (+00:00 form)
  fetched_at: string;    // ALWAYS PRESENT — ISO 8601 UTC (+00:00 form)
  provider: string;      // ALWAYS PRESENT — "newsapi" | "gnews" | "newsdata" | "webfetch"

  description?: string;  // optional — ABSENT when empty
  content?: string;      // optional — ABSENT when empty
  image_url?: string;    // optional — ABSENT when empty
  source?: string;       // optional — ABSENT when empty
  author?: string;       // optional — ABSENT when empty
  category?: string;     // optional — ABSENT when empty

  llm_answer?: string;       // LLM Brain parse result — ABSENT until parsed
  llm_provider?: string;     // LLMPing-reported provider used for the parse
  llm_model?: string;        // LLMPing-reported model used for the parse
  llm_processed_at?: string; // ISO 8601 UTC — when the parse was stored
}
```

### Field rules (verified against the implementation)

| Field | Rule |
|-------|------|
| `id` | 16-char lowercase hex, `SHA-256(URL)[:16]`. Deterministic — same URL → same ID across runs/restarts. |
| `title` | Never null/absent/empty. Articles without titles are dropped before storage. |
| `url` | Never null/absent/empty. The uniqueness/dedup key. |
| `published_at` | Never missing. ISO 8601 UTC in **`+00:00` form** (e.g. `"2026-10-06T09:30:00+00:00"`, microseconds only when non-zero). Unparseable source timestamps fall back to "now". |
| `fetched_at` | Never missing. Same format as `published_at`. |
| `provider` | Never missing. One of `"newsapi"`, `"gnews"`, `"newsdata"`, `"webfetch"`. |
| `description`, `content`, `image_url`, `source`, `author`, `category`, `llm_*` | Optional — **omitted from the JSON when empty** (not `null`). Check for `undefined`/`"key" in article` before rendering. |

### `llm_answer` handling

`llm_answer` is stored exactly as received from the LLM Brain. With the
deployment's editorial system prompt it is a single strict JSON object
(verified live on 6/6 sample articles):

```json
{
  "title": "...",        // echoed from the article
  "url": "...",          // echoed, matches the row's url
  "source": "...",
  "author": "...",
  "category": "...",
  "published_at": "...", // echoed
  "summary": "2-3 sentence summary based only on the article",
  "key_points": ["up to 3 short factual strings"]
}
```

Treat it as best-effort (a different deployment prompt may change the shape):
try `JSON.parse` and fall back to rendering the raw text.

### Optional-field handling in the UI

```typescript
const image = article.image_url || "/placeholder.png";
const source = article.source || "Unknown";
const author = article.author || "Unknown";
// description/content may be undefined — check before rendering
const summary = article.llm_answer ? tryParse(article.llm_answer)?.summary : undefined;
```

Do **not** add fallbacks for `id`, `title`, `url`, `published_at`,
`fetched_at`, `provider` — the backend guarantees them.

---

## 5. UI Data Flow

```text
User opens Last247
        ↓
Next.js UI
        ↓
GET /api/news
        ↓
Last247 Python Backend
        ↓
Turso
        ↓
Processed articles
        ↓
JSON
        ↓
UI renders cards/feed
```

The UI should **NOT** call any of these directly — they are backend/internal
services:

- NewsAPI
- GNews
- NewsData.io
- LLMPing
- Turso

Credentials (provider keys, Turso token, LLMPing token) live only in backend
env vars and never appear in API responses.

---

## 6. How News Gets Into the Database (internal workflow)

```text
NewsAPI / GNews / NewsData.io / WebFetch   (sequential fallback, first success wins)
        ↓
OrcaDeLast247
        ↓
Normalize
        ↓
Select up to MAX_ARTICLES (7) articles
        ↓
Turso upsert (dedup by URL: ON CONFLICT(url) DO UPDATE)
        ↓
LLMPing /chat  (system prompt + article data, per article, sequential)
        ↓
Parse article → validate → store parsed answer on the row (llm_* columns)
        ↓
Retention sweep (delete articles older than RETENTION_DAYS = 7)
        ↓
GET /api/news
        ↓
UI
```

- The `url` column is `UNIQUE` — re-fetching the same story refreshes the row
  instead of duplicating it. `llm_*` fields are never overwritten by re-ingest.
- A failed LLM parse is logged and skipped — the article stays stored without
  `llm_*` fields; the run continues.

---

## 7. Sample-Data Mode (testing)

`SAMPLE_DATA=true` (backend env var, default `false`) switches ingestion to
the bundled sample dataset instead of the real news APIs:

```text
data/sample_news.json
        ↓
normalization (same code as real providers)
        ↓
LLMPing
        ↓
Turso
        ↓
API
        ↓
UI
```

- The sample dataset (`data/sample_news.json`) contains **6 articles: 2
  NewsAPI + 2 GNews + 2 NewsData.io** sample entries, no API keys inside.
- Every step (cap, dedup, upsert, LLMPing parse, retention) is the **same
  code path** as real data — it tests the actual application flow without
  consuming news-API quota.
- Articles carry their own provider tag (`newsapi`/`gnews`/`newsdata`), so the
  UI sees realistic `provider` values.
- `SAMPLE_DATA=false` (default) uses the real configured providers.

---

## 8. Automatic Ingestion

- `INGEST_INTERVAL=8h` — ingestion runs at startup, then every 8 hours
  (3 runs/day).
- `MAX_ARTICLES=7` — each run processes **up to** 7 articles (the provider may
  return fewer).
- The backend periodically fetches news, processes it through the LLM, and
  stores the final article data in Turso. **The UI does not need to trigger
  this for normal operation** — polling `GET /api/news` is enough.
- `POST /api/ingest` exists as a **manual/internal trigger** (synchronous,
  quota-consuming, unauthenticated — see §3).

---

## 9. CORS

Configured via FastAPI's `CORSMiddleware`, driven by the
`CORS_ALLOW_ORIGINS` env var.

| Env var | Default | Description |
|---------|---------|-------------|
| `CORS_ALLOW_ORIGINS` | `*` | Comma-separated list of allowed origins. `*` allows all (credentials not allowed). Specify exact origins for production. |

- Allowed methods: `GET`, `POST`, `OPTIONS`.
- Allowed headers: `Content-Type`.
- Credentials: **not allowed** (`allow_credentials=False`).
- Pre-flight (`OPTIONS`) replies `HTTP 200` with the standard
  `access-control-allow-*` headers.

```
# Production example
CORS_ALLOW_ORIGINS=https://last247.vercel.app,https://app.last247.dev
# Local development
CORS_ALLOW_ORIGINS=*
```

---

## 10. Frontend Fetch Examples

Base URL comes from `NEXT_PUBLIC_API_BASE_URL` (this repo's only env var,
default `http://localhost:8080`).

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news`
);

const data = await response.json();
// data.articles — Article[] (see §4); data.total / data.offset for pagination
data.articles.forEach((article) => {
  const title = article.title;                        // always present
  const image = article.image_url || "/placeholder.png";
  const source = article.source || "Unknown";
  const when = new Date(article.published_at);        // parses +00:00 form directly
  const link = article.url;                           // open the article
});
```

### Paginated list with filters

```typescript
async function fetchArticles(limit = 20, offset = 0, category?: string, source?: string) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (category) params.set("category", category);
  if (source) params.set("source", source);

  const res = await fetch(`${BASE_URL}/api/news?${params}`);
  if (res.status === 422) throw new Error("Invalid limit/offset");   // FastAPI validation
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);      // 500 INTERNAL_ERROR

  const data: { articles: Article[]; total: number; limit: number; offset: number } =
    await res.json();
  return {
    articles: data.articles,
    total: data.total,
    hasMore: data.offset + data.articles.length < data.total,
  };
}
```

### Single article by ID

```typescript
async function fetchArticle(id: string): Promise<Article> {
  const res = await fetch(`${BASE_URL}/api/news/${id}`);
  if (res.status === 404) throw new Error("Article not found");      // NOT_FOUND
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);      // 500 INTERNAL_ERROR
  return res.json();
}
```

### Health / stats

```typescript
const health = await (await fetch(`${BASE_URL}/health`)).json();      // {status, timestamp}
const stats  = await (await fetch(`${BASE_URL}/api/stats`)).json();   // {total_articles, last_ingestion?}
```

---

## 11. Responsibilities

### UI responsibilities

- Fetch articles from the backend (`GET /api/news`, `GET /api/news/{id}`)
- Display title, description, image, source, category, published time
- Open the article (`article.url`, or detail view via `GET /api/news/{id}`)
- Handle loading
- Handle empty results (`articles: []`)
- Handle API errors (422 validation, 500, 404 `NOT_FOUND`, network failures)

### Backend responsibilities (never the UI's job)

- Fetch news from providers (sequential fallback)
- Normalize providers
- LLM processing (LLMPing)
- Deduplication (URL `UNIQUE` + in-run dedup)
- Store in Turso
- Retention (delete articles older than `RETENTION_DAYS` = 7)
- Serve the JSON API

---

## 12. Error Handling Summary

All backend errors use a consistent JSON shape — except FastAPI validation
(422), which uses `{"detail": [...]}`:

| Status | Code | When |
|--------|------|------|
| 422 | *(FastAPI shape: `{"detail":[{"loc","msg","type"}]}`)* | Invalid `limit`/`offset` on `GET /api/news`. |
| 404 | `NOT_FOUND` | Article ID not found on `GET /api/news/{id}`. |
| 500 | `INTERNAL_ERROR` | Database query failure (`/api/news`, `/api/news/{id}`, `/api/stats`). |
| 500 | `INGEST_TIMEOUT` | Manual run exceeded `INGEST_TIMEOUT` (`POST /api/ingest`). |
| 500 | `INGEST_ERROR` | Ingestion run failed (`POST /api/ingest`). |

```json
{ "error": "human-readable description", "code": "ERROR_CODE" }
```

---

*Generated from the Python backend source (OrcaDeLast247). Verified against:*
- `main.py` — FastAPI app, routes, CORS middleware, background ingestion loop
- `models.py` — Article (Pydantic) and IngestionResult shapes
- `database.py` — `news` table schema, list/get/count queries, llm_* columns
- `ingest.py` — provider fallback, cap, dedup, upsert, LLM parse phase, retention
- `config.py` — env vars and defaults
- `data/sample_news.json` — 6 sample articles (2 per provider)
