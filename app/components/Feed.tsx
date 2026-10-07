"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, RefreshCw, X } from "lucide-react";
import { useNewsFeed } from "@/lib/hooks";
import StoryCard from "./StoryCard";
import ArticleReader from "./ArticleReader";

export default function Feed() {
  const feed = useNewsFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isLoading = feed.status === "loading";

  // Determine visible categories: "All" + first 2 from the list
  const visibleCategories = feed.categories.slice(0, 2);
  const hasMoreCategories = feed.categories.length > 2;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  // Close popover on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [moreOpen]);

  const handleCategorySelect = (category: string | null) => {
    feed.setCategory(category);
    setMoreOpen(false);
  };

  const isCategorySelected = (cat: string | null) => feed.category === cat;

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
        {feed.categories.length > 0 && (
          <div className="mb-5 flex items-center gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isCategorySelected(null)
                    ? "bg-ink text-paper border-ink"
                    : "bg-frost text-muted border-ink/10 hover:bg-ink/5"
                }`}
              >
                All
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isCategorySelected(cat)
                      ? "bg-ink text-paper border-ink"
                      : "bg-frost text-muted border-ink/10 hover:bg-ink/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {hasMoreCategories && (
              <div className="relative ml-1" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="shrink-0 rounded-full border bg-frost px-3 py-1.5 text-sm font-medium text-muted border-ink/10 hover:bg-ink/5 transition flex items-center gap-1"
                  aria-expanded={moreOpen}
                  aria-haspopup="listbox"
                >
                  More
                  <ChevronDown size={12} className={moreOpen ? "rotate-180" : ""} />
                </button>
                {moreOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 z-50 w-48 sm:w-56 origin-top-right animate-popIn"
                    role="listbox"
                    aria-label="All categories"
                  >
                    <div className="rounded-2xl border border-ink/10 bg-frost/95 backdrop-blur-xl p-2 soft-shadow-lg">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isCategorySelected(null)}
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isCategorySelected(null)
                            ? "bg-ink/10 text-ink"
                            : "text-muted hover:bg-ink/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>All</span>
                          {isCategorySelected(null) && (
                            <X size={14} className="text-ink/60 shrink-0" />
                          )}
                        </div>
                      </button>
                      <div className="mt-1 pt-1 border-t border-ink/10" />
                      {feed.categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          role="option"
                          aria-selected={isCategorySelected(cat)}
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isCategorySelected(cat)
                              ? "bg-ink/10 text-ink"
                              : "text-muted hover:bg-ink/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{cat}</span>
                            {isCategorySelected(cat) && (
                              <X size={14} className="text-ink/60 shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Categories loading indicator */}
        {feed.categoriesLoading && feed.categories.length === 0 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              <div className="shrink-0 rounded-full border bg-frost px-3 py-1.5 animate-pulse" />
              <div className="shrink-0 rounded-full border bg-frost px-6 py-1.5 animate-pulse" />
              <div className="shrink-0 rounded-full border bg-frost px-6 py-1.5 animate-pulse" />
            </div>
          </div>
        )}

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
