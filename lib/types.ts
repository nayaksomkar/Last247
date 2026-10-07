// Canonical schemas from UI_API_INTEGRATION.md §3–4.

/**
 * The Article struct is the canonical shape for articles returned by all
 * endpoints. Optional fields are omitted from the JSON response when they
 * are empty — check for `undefined` before rendering.
 */
export interface Article {
  id: string; // 16-char hex, SHA-256(URL)[:16], deterministic
  title: string; // always present, non-empty
  description?: string; // may be absent
  content?: string; // may be absent
  url: string; // always present, non-empty, unique
  image_url?: string; // may be absent
  source?: string; // publisher name, may be absent
  author?: string; // may be absent
  category?: string; // single category, may be absent
  published_at: string; // ISO 8601 UTC ("+00:00" form) — always present
  fetched_at: string; // ISO 8601 UTC ("+00:00" form) — always present
  provider: string; // "newsapi" | "gnews" | "newsdata" | "webfetch"
  // LLM Brain parse result (LLMPing) — absent until the article is processed.
  llm_answer?: string; // parsed answer as received; JSON string with the editorial prompt
  llm_provider?: string; // provider LLMPing reported using
  llm_model?: string; // model LLMPing reported using
  llm_processed_at?: string; // ISO 8601 UTC — when the parse was stored
}

/** Response of `GET /api/news`. Always 200 for valid params, even with zero results. */
export interface NewsListResponse {
  articles: Article[];
  /** Total count of matching articles (before pagination). */
  total: number;
  /** The limit value used (echoed back). */
  limit: number;
  /** The offset value used (echoed back). */
  offset: number;
}

/** Last-ingestion summary from the backend (UI_API_INTEGRATION.md §3). */
export interface IngestionResult {
  /** Provider that won the fallback chain, or "" if all failed/unconfigured. */
  provider: string;
  total: number;
  inserted: number;
  skipped: number;
  deleted: number;
  /** Articles successfully processed by the LLMPing LLM Brain this run. */
  parsed: number;
  /** Articles whose LLM parse failed — rows stay stored without llm_* fields. */
  parse_failed: number;
  /** When the provider was queried (RFC 3339 UTC). */
  source_time: string;
}

/** Response of `GET /api/stats`. `last_ingestion` is absent if none ran yet. */
export interface StatsResponse {
  total_articles: number;
  last_ingestion?: IngestionResult;
}

/** Response of `GET /health`. */
export interface HealthResponse {
  status: string;
  timestamp: string;
}

/** Consistent error shape of all backend error responses (§9). */
export interface ApiErrorBody {
  error: string;
  code: string;
}
