"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, fetchArticleById, fetchArticles } from "./api";
import type { Article } from "./types";

/** Feed page size. The API accepts up to 100 (UI_API_INTEGRATION.md §3). */
export const PAGE_SIZE = 20;

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError("Something went wrong. Please try again.", 0, "UNKNOWN");
}

// ---------------------------------------------------------------------------
// News feed (GET /api/news)
// ---------------------------------------------------------------------------

export type FeedStatus = "loading" | "ready" | "empty" | "unavailable";

/**
 * Feed state: paginated articles, newest first (fixed backend ordering —
 * deliberately no sorting or search control here).
 */
export function useNewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<ApiError | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const nextOffset = useRef(0);

  // Reset to the loading state and refetch page 1. Called from user actions
  // (retry) — never in an effect body.
  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setLoadMoreError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    nextOffset.current = 0;

    (async () => {
      try {
        // The feed depends ONLY on GET /api/news — never gated on /health
        // (which can fail independently of the article API).
        const page = await fetchArticles({ limit: PAGE_SIZE, offset: 0 });

        if (cancelled) return;

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

  return {
    articles,
    total,
    hasMore,
    status,
    error,
    loadingMore,
    loadMore,
    loadMoreError,
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
