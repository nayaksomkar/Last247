"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock3, Database, RefreshCw, SearchX } from "lucide-react";
import { OPEN_ARTICLE_EVENT } from "@/lib/events";
import { useNewsFeed } from "@/lib/hooks";
import FeaturedStory from "./FeaturedStory";
import StoryCard from "./StoryCard";
import ArticleReader from "./ArticleReader";

const selectClasses =
  "rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/50 disabled:cursor-not-allowed disabled:opacity-50";

export default function TopStories() {
  const feed = useNewsFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Story cards ask the reader to open by ID.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      if (detail?.id) setSelectedId(detail.id);
    };

    window.addEventListener(OPEN_ARTICLE_EVENT, onOpen);

    return () => {
      window.removeEventListener(OPEN_ARTICLE_EVENT, onOpen);
    };
    // The listener is registered once; OPEN_ARTICLE_EVENT is a stable global.
  }, []);

  const isLoading = feed.status === "loading";

  return (
    <>
      <section id="latest" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Section heading */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                The briefing
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
                Top stories
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                The most important stories from the last 24 hours,
                collected continuously and kept up to date.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div
                className="flex items-center gap-3 text-xs text-muted"
                aria-live="polite"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    feed.status === "ready" ? "animate-pulse bg-green" : "bg-muted"
                  }`}
                />

                <span>
                  {isLoading
                    ? "Loading news..."
                    : feed.status === "ready"
                      ? `Showing ${feed.visible.length} of ${feed.total} stories`
                      : feed.status === "empty"
                        ? "No stories yet"
                        : "Feed unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Filters — category and source are the only filters the API supports */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <div>
              <label className="sr-only" htmlFor="filter-category">
                Filter by category
              </label>
              <select
                id="filter-category"
                value={feed.category}
                onChange={(event) => feed.changeCategory(event.target.value)}
                disabled={isLoading && feed.filterOptions.categories.length === 0}
                className={selectClasses}
              >
                <option value="">All categories</option>
                {feed.filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="sr-only" htmlFor="filter-source">
                Filter by source
              </label>
              <select
                id="filter-source"
                value={feed.source}
                onChange={(event) => feed.changeSource(event.target.value)}
                disabled={isLoading && feed.filterOptions.sources.length === 0}
                className={selectClasses}
              >
                <option value="">All sources</option>
                {feed.filterOptions.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={feed.refresh}
              disabled={isLoading}
              aria-label="Refresh stories"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-blue/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-9 grid gap-4 lg:grid-cols-12">
              <div className="min-h-115 animate-pulse rounded-3xl border border-border/70 bg-card/50 lg:col-span-7" />

              <div className="space-y-4 lg:col-span-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-52 animate-pulse rounded-2xl border border-border/70 bg-card/50"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unavailable — network, health, or server error */}
          {feed.status === "unavailable" && (
            <div className="mt-9 rounded-2xl border border-border/70 bg-card/50 p-8 text-center">
              <Database size={20} className="mx-auto text-muted" />

              <p className="mt-4 font-semibold text-foreground">
                The news feed is temporarily unavailable
              </p>

              <p
                className="mx-auto mt-2 max-w-md text-sm text-muted"
                role="alert"
              >
                {feed.error?.message ??
                  "We couldn't reach the news store. Please try again in a moment."}
              </p>

              <button
                type="button"
                onClick={feed.refresh}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
              >
                <RefreshCw size={12} />
                Try again
              </button>
            </div>
          )}

          {/* Empty — the API returned zero articles */}
          {feed.status === "empty" && (
            <div className="mt-9 rounded-2xl border border-border/70 bg-card/50 p-8 text-center">
              <Clock3 size={20} className="mx-auto text-muted" />

              <p className="mt-4 font-semibold text-foreground">
                No stories available.
              </p>

              <p className="mt-2 text-sm text-muted">
                The feed is empty for now. Stories appear here as soon as
                the next collection cycle finishes.
              </p>
            </div>
          )}

          {/* Stories — rendered from the articles fetched from GET /api/news */}
          {feed.status === "ready" && feed.articles.length > 0 && (
            <div className="mt-9 grid gap-4 lg:grid-cols-12 lg:items-stretch">
              {feed.visible.length > 0 ? (
                <>
                  {/* Featured story — first article returned by the backend */}
                  <div className="lg:col-span-7">
                    <FeaturedStory article={feed.visible[0]} />
                  </div>

                  {/* Scrollable stories */}
                  <div className="relative min-h-0 lg:col-span-5">
                    {/* Top fade */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 rounded-t-2xl bg-linear-to-b from-background to-transparent"
                    />

                    {/* Bottom fade */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 rounded-b-2xl bg-linear-to-t from-background to-transparent"
                    />

                    <div className="stories-scroll relative h-115 space-y-4 overflow-y-auto overscroll-contain pr-2 snap-y snap-mandatory scroll-py-2">
                      {feed.visible.slice(1).map((article) => (
                        <div key={article.id} className="snap-start">
                          <StoryCard article={article} />
                        </div>
                      ))}
                    </div>

                    {/* Scroll indicator */}
                    {feed.visible.length > 3 && (
                      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted backdrop-blur-md sm:flex">
                        <span className="h-1 w-1 rounded-full bg-muted" />
                        Scroll for more
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Client-side filter matched nothing in the fetched articles */
                <div className="lg:col-span-12">
                  <div className="rounded-2xl border border-border/70 bg-card/50 p-8 text-center">
                    <SearchX size={20} className="mx-auto text-muted" />

                    <p className="mt-4 font-semibold text-foreground">
                      No stories match the selected filters
                    </p>

                    <p className="mt-2 text-sm text-muted">
                      Try a different category or source.
                    </p>

                    <button
                      type="button"
                      onClick={feed.clearFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}

              {/* Load more — offset pagination via GET /api/news */}
              <div className="lg:col-span-12">
                {feed.loadMoreError && (
                  <p
                    role="alert"
                    className="mb-3 text-center text-xs font-medium text-red"
                  >
                    {feed.loadMoreError.message}{" "}
                    <button
                      type="button"
                      onClick={feed.loadMore}
                      className="font-bold underline underline-offset-2 hover:text-foreground"
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
                    className="mx-auto flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-6 text-sm font-semibold text-foreground transition hover:border-foreground/30 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {feed.loadingMore ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load more
                        <ChevronDown size={14} />
                        <span className="text-muted">
                          ({feed.total - feed.articles.length} remaining)
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-center text-xs text-muted">
                    You’ve reached the end — all {feed.total} stories are
                    shown.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
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
