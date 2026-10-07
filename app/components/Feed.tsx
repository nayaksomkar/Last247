"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, RefreshCw, X, Check, ChevronDown } from "lucide-react";
import { useNewsFeed } from "@/lib/hooks";
import StoryCard from "./StoryCard";
import ArticleReader from "./ArticleReader";

export default function Feed() {
  const feed = useNewsFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const isLoading = feed.status === "loading";

  // Determine visible categories: "All" + first 2 from the list
  const visibleCategories = feed.categories.slice(0, 2);
  const hasMoreCategories = feed.categories.length > 2;

  // Close modal when clicking outside (on overlay)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalContentRef.current?.contains(event.target as Node)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    }
    if (modalOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [modalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const handleCategorySelect = useCallback((category: string | null) => {
    feed.setCategory(category);
    setModalOpen(false);
  }, [feed]);

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
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="shrink-0 rounded-full border bg-frost px-3 py-1.5 text-sm font-medium text-muted border-ink/10 hover:bg-ink/5 transition flex items-center gap-1"
              >
                More
                <Plus size={12} />
              </button>
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

      {/* Category Modal — centered, ~75% viewport */}
      {modalOpen && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center animate-popIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="categories-heading"
        >
          {/* Dark backdrop — dims the page without washing it out */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          {/* Modal content — dark frosted surface */}
          <div
            ref={modalContentRef}
            className="relative w-[75vw] max-w-[600px] h-[75vh] max-h-[500px] rounded-3xl border border-ink/10 bg-frost/95 backdrop-blur-xl soft-shadow-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-ink/10">
              <h2 id="categories-heading" className="font-display text-lg font-bold tracking-wider">
                CATEGORIES
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="shrink-0 rounded-xl p-1.5 text-muted hover:text-ink hover:bg-ink/5 transition"
                aria-label="Close categories"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Unified grid: All + categories in responsive 2-col layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* All category */}
                <button
                  type="button"
                  role="option"
                  aria-selected={isCategorySelected(null)}
                  onClick={() => handleCategorySelect(null)}
                  className={`rounded-2xl px-4 py-3 text-left font-medium transition ${
                    isCategorySelected(null)
                      ? "bg-lavender/20 text-ink border border-lavender/40"
                      : "bg-frost/50 text-muted hover:bg-ink/5 border border-ink/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All</span>
                    {isCategorySelected(null) && <Check size={16} className="text-lavender shrink-0" />}
                  </div>
                </button>

                {/* Categories from backend */}
                {feed.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="option"
                    aria-selected={isCategorySelected(cat)}
                    onClick={() => handleCategorySelect(cat)}
                    className={`rounded-2xl px-4 py-3 text-left font-medium transition ${
                      isCategorySelected(cat)
                        ? "bg-lavender/20 text-ink border border-lavender/40"
                        : "bg-frost/50 text-muted hover:bg-ink/5 border border-ink/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat}</span>
                      {isCategorySelected(cat) && <Check size={16} className="text-lavender shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
