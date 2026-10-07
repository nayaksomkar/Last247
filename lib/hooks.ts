"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  fetchArticleById,
  fetchArticles,
  fetchHealth,
  fetchStats,
} from "./api";
import type { Article, StatsResponse } from "./types";

/** Feed page size. The API accepts up to 100 (UI_API_INTEGRATION.md §3). */
export const PAGE_SIZE = 20;

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError("Something went wrong. Please try again.", 0, "UNKNOWN");
}

function distinct(articles: Article[], field: "category" | "source") {
  return [
    ...new Set(
      articles.map((a) => a[field]).filter((v): v is string => Boolean(v)),
    ),
  ].sort();
}

// ---------------------------------------------------------------------------
// News feed (GET /api/news)
// ---------------------------------------------------------------------------

export type FeedStatus = "loading" | "ready" | "empty" | "unavailable";

export type FilterOptions = {
  categories: string[];
  sources: string[];
};

/**
 * Feed state: paginated articles plus exact-match category/source filters.
 *
 * The backend sorts fixed (published_at DESC, id ASC) and has no text search,
 * so there is deliberately no sorting or search control here.
 */
export function useNewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<ApiError | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const nextOffset = useRef(0);

  // Reset to the loading state and refetch page 1. Called from user actions
  // (refresh) — never in an effect body.
  const beginLoad = useCallback(() => {
    setStatus("loading");
    setError(null);
    setLoadMoreError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const refresh = beginLoad;

  // Filtering is client-side over the fetched articles (§19) — no API call.
  const changeCategory = useCallback((value: string) => setCategory(value), []);
  const changeSource = useCallback((value: string) => setSource(value), []);
  const clearFilters = useCallback(() => {
    setCategory("");
    setSource("");
  }, []);

  useEffect(() => {
    let cancelled = false;
    nextOffset.current = 0;

    (async () => {
      try {
        // The feed depends ONLY on GET /api/news — never gated on /health
        // (which can fail independently of the article API). No filter
        // params: filtering happens client-side over the fetched pages.
        const page = await fetchArticles({ limit: PAGE_SIZE, offset: 0 });

        if (cancelled) return;

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Last247] /api/news -> ${page.total} total, ${page.articles.length} on page`,
          );
        }

        setArticles(page.articles);
        setTotal(page.total);
        setHasMore(page.hasMore);
        nextOffset.current = page.offset + page.articles.length;
        setStatus(page.articles.length === 0 ? "empty" : "ready");
      } catch (e) {
        if (!cancelled) {
          setError(toApiError(e));
          setStatus("unavailable");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await fetchArticles({
        limit: PAGE_SIZE,
        offset: nextOffset.current,
      });

      setArticles((prev) => {
        // Offset pagination is stable, but dedupe by id anyway so a
        // concurrent refresh can't duplicate rows.
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...page.articles.filter((a) => !seen.has(a.id))];
      });
      setTotal(page.total);
      setHasMore(page.hasMore);
      nextOffset.current = page.offset + page.articles.length;
    } catch (e) {
      // Keep the loaded list; surface the failure with a retry action.
      setLoadMoreError(toApiError(e));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  // Client-side filter over the fetched articles — no extra API requests.
  const visible = useMemo(
    () =>
      articles.filter(
        (a) =>
          (!category || a.category === category) &&
          (!source || a.source === source),
      ),
    [articles, category, source],
  );

  // Filter dropdown options derived from the fetched articles.
  const filterOptions = useMemo<FilterOptions>(
    () => ({
      categories: distinct(articles, "category"),
      sources: distinct(articles, "source"),
    }),
    [articles],
  );

  return {
    articles,
    visible,
    total,
    hasMore,
    status,
    error,
    loadingMore,
    loadMore,
    loadMoreError,
    category,
    source,
    changeCategory,
    changeSource,
    clearFilters,
    filterOptions,
    refresh,
  };
}

// ---------------------------------------------------------------------------
// Single article (GET /api/news/{id})
// ---------------------------------------------------------------------------

export type ArticleStatus = "idle" | "loading" | "ready" | "notfound" | "error";

export function useArticle(id: string | null) {
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<ArticleStatus>(id ? "loading" : "idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Refetch the same article. Call sites remount per article (via `key`), so
  // id changes never need a reset inside the effect body.
  const retry = useCallback(() => {
    setReloadKey((k) => k + 1);
    setStatus("loading");
    setError(null);
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchArticleById(id);
        if (!cancelled) {
          setArticle(data);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          const err = toApiError(e);
          setError(err);
          setStatus(err.status === 404 ? "notfound" : "error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return { article, status, error, retry };
}

// ---------------------------------------------------------------------------
// Stats (GET /api/stats)
// ---------------------------------------------------------------------------

export type StatsStatus = "loading" | "ready" | "unavailable";

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [status, setStatus] = useState<StatsStatus>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchStats();
        if (!cancelled) {
          setStats(data);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(toApiError(e));
          setStatus("unavailable");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { stats, status, error, refresh };
}

// ---------------------------------------------------------------------------
// Health (GET /health)
// ---------------------------------------------------------------------------

export type HealthStatus = "checking" | "up" | "down";

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setStatus("checking");
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchHealth();
        if (!cancelled) setStatus(data.status === "ok" ? "up" : "down");
      } catch {
        // /health can fail independently of the article API — probe the
        // actual endpoint the app uses before showing "Offline".
        try {
          await fetchArticles({ limit: 1 });
          if (!cancelled) setStatus("up");
        } catch {
          if (!cancelled) setStatus("down");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { status, refresh };
}
