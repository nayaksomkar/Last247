"use client";

import { useState, useMemo } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useNewsFeed } from "@/lib/hooks";
import StoryCard from "./StoryCard";
import ArticleReader from "./ArticleReader";

export default function Feed() {
  const feed = useNewsFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isLoading = feed.status === "loading";

  // Collect unique categories from currently loaded articles
  const categories = useMemo(() => {
    const cats = new Set<string>();
    feed.articles.forEach((article) => {
      if (article.category) cats.add(article.category);
    });
    return Array.from(cats).sort();
  }, [feed.articles]);

  return (
    <>
      <section className="mx-auto w-full max-w-2xl px-3 sm:px-4">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3 px-1">
          <span className="h-3 w-3 shrink-0 rounded-full bg-pink" />
          <h2 className="shrink-0 font-display text-sm font-bold tracking-wider">
            THE FEED
          </h2>
          <div className="h-px flex-1 bg-ink/15" />
        </div>

        {/* Category filter */}
        <div className="mb-5 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max">
            <button
              type="button"
              onClick={() => feed.setCategory(null)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                feed.category === null
                  ? "bg-ink text-paper border-ink"
                  : "bg-frost text-muted border-ink/10 hover:bg-ink/5"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => feed.setCategory(cat)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  feed.category === cat
                    ? "bg-ink text-paper border-ink"
                    : "bg-frost text-muted border-ink/10 hover:bg-ink/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-ink/10 bg-frost p-4 sm:p-5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-ink/10" />
                  <div className="h-3.5 w-32 rounded-full bg-ink/10" />
                </div>
                <div className="mt-3 h-5 w-full rounded-full bg-ink/10" />
                <div className="mt-2 h-5 w-3/4 rounded-full bg-ink/10" />
                <div className="mt-4 h-40 w-full rounded-2xl bg-ink/10" />
              </div>
            ))}
          </div>
        )}

        {/* Unavailable — network or server error */}
        {feed.status === "unavailable" && (
          <div className="rounded-3xl border border-ink/10 bg-frost p-8 text-center soft-shadow backdrop-blur-xl">
            <p className="font-display text-lg font-bold">THE WIRE IS DOWN</p>

            <p className="mx-auto mt-3 max-w-sm text-sm text-muted" role="alert">
              {feed.error?.message ??
                "We couldn't reach the news store. Please try again in a moment."}
            </p>

            <button
              type="button"
              onClick={feed.refresh}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-xs font-bold text-[#111] transition hover:-translate-y-0.5 hover:soft-shadow-lg"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        )}

        {/* Empty — the API returned zero articles */}
        {feed.status === "empty" && (
          <div className="rounded-3xl border border-ink/10 bg-frost p-8 text-center soft-shadow backdrop-blur-xl">
            <p className="font-display text-lg font-bold">NOTHING YET</p>

            <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
              Stories land here as soon as the next collection run finishes.
            </p>
          </div>
        )}

        {/* Feed — rendered from articles fetched via GET /api/news */}
        {feed.status === "ready" && (
          <>
            <div className="space-y-5">
              {feed.articles.map((article) => (
                <StoryCard
                  key={article.id}
                  article={article}
                  onOpen={() => setSelectedId(article.id)}
                />
              ))}
            </div>

            {/* Load more — offset pagination via GET /api/news */}
            <div className="py-8">
              {feed.loadMoreError && (
                <p
                  role="alert"
                  className="mb-3 text-center text-xs font-medium text-muted"
                >
                  {feed.loadMoreError.message}{" "}
                  <button
                    type="button"
                    onClick={feed.loadMore}
                    className="font-bold text-ink underline underline-offset-2"
                  >
                    Retry
                  </button>
                </p>
              )}

              {feed.hasMore ? (
                <button
                  type="button"
                  onClick={feed.loadMore}
                  disabled={feed.loadingMore}
                  className="mx-auto flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-paper soft-shadow transition hover:-translate-y-0.5 hover:soft-shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {feed.loadingMore ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more stories
                      <ChevronDown size={15} />
                    </>
                  )}
                </button>
              ) : (
                <p className="text-center font-display text-[10px] uppercase tracking-widest text-muted">
                  That&apos;s the whole wire
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {/* Story reader — fetches GET /api/news/{id}. Remounts per article. */}
      <ArticleReader
        key={selectedId ?? "closed"}
        articleId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
