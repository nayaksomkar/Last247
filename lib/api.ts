import { API_BASE_URL } from "./config";
import type {
  Article,
  ArticlePage,
  CategoriesResponse,
  HealthResponse,
  IngestionResult,
  ListArticlesParams,
  NewsListResponse,
  StatsResponse,
} from "./types";

/**
 * API-layer error. For HTTP error responses it carries the documented
 * `{error, code}` body (§9); for client-side failures (network, JSON) it
 * carries a synthetic code so the UI can tell them apart.
 */
export class ApiError extends Error {
  /** HTTP status, or 0 for client-side (network) failures. */
  status: number;
  /** Backend error code, or NETWORK / UNKNOWN. */
  code: string;

  constructor(message: string, status: number, code = "UNKNOWN") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Render free tier cold-starts the backend — the first connect can be
// refused/reset while the service boots. Retry network failures only;
// HTTP error responses are never retried.
const NETWORK_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response | null = null;

  for (let attempt = 0; attempt <= NETWORK_RETRIES; attempt++) {
    try {
      res = await fetch(`${API_BASE_URL}${path}`, init);
      break;
    } catch {
      if (attempt < NETWORK_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  if (!res) {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
      "NETWORK",
    );
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    let code = "UNKNOWN";

    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object") {
        const fields = body as Record<string, unknown>;
        if (typeof fields.error === "string") message = fields.error;
        if (typeof fields.code === "string") code = fields.code;
      }
    } catch {
      // Non-JSON error body — keep the HTTP status text.
    }

    throw new ApiError(message, res.status, code);
  }

  return (await res.json()) as T;
}

/** `GET /health` — liveness probe. Does not depend on the database. */
export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

/** `GET /api/news` — paginated list, newest first, optional exact-match filters. */
export async function fetchArticles(
  params: ListArticlesParams = {},
): Promise<ArticlePage> {
  const { limit = 20, offset = 0, category, source } = params;

  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (category) query.set("category", category);
  if (source) query.set("source", source);

  const data = await request<NewsListResponse>(`/api/news?${query.toString()}`);

  return {
    ...data,
    hasMore: data.offset + data.articles.length < data.total,
  };
}

/** `GET /api/news/{id}` — single article by its 16-char hex ID. */
export async function fetchArticleById(id: string): Promise<Article> {
  return request<Article>(`/api/news/${encodeURIComponent(id)}`);
}

/** `GET /api/stats` — total article count and last ingestion metadata. */
export async function fetchStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/api/stats");
}

/** `POST /api/ingest` — trigger a manual ingestion run (empty body). */
export async function triggerIngest(): Promise<IngestionResult> {
  const data = await request<{ success: boolean; result: IngestionResult }>(
    "/api/ingest",
    { method: "POST" },
  );

  return data.result;
}

/** `GET /api/news/categories` — list of available categories. */
export async function fetchCategories(): Promise<string[]> {
  const data = await request<CategoriesResponse>("/api/news/categories");
  return data.categories;
}

export type { ListArticlesParams, ArticlePage };
