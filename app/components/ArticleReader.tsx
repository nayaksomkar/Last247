"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, X } from "lucide-react";
import { UNKNOWN, cleanContent, formatUtc, readMinutes, timeAgo } from "@/lib/format";
import { useArticle } from "@/lib/hooks";
import ArticleImage from "./ArticleImage";

type Props = {
  /** 16-char hex article ID; null keeps the reader closed. */
  articleId: string | null;
  onClose: () => void;
};

export default function ArticleReader({ articleId, onClose }: Props) {
  const { article, status, error, retry } = useArticle(articleId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll lock + Escape-to-close while the reader is open.
  useEffect(() => {
    if (!articleId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [articleId, onClose]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (articleId) closeButtonRef.current?.focus();
  }, [articleId]);

  if (!articleId) return null;

  // Cleaned for display — never show internal processing markers.
  const content = article ? cleanContent(article.content ?? "") : "";
  const summary = article?.description
    ? cleanContent(article.description)
    : "";
  const readTime = article
    ? readMinutes(`${article.description ?? ""} ${article.content ?? ""}`)
    : "";

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Read story"
    >
      <button
        ref={closeButtonRef}
        aria-label="Close story"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-[3px] transition-opacity dark:bg-black/55"
      />

      <aside className="absolute right-0 top-0 flex h-dvh w-full max-w-2xl flex-col border-l border-border/70 bg-background/95 shadow-[-20px_0_80px_rgb(0,0,0,0.12)] backdrop-blur-2xl animate-[slideIn_400ms_cubic-bezier(0.22,1,0.36,1)] dark:shadow-[-20px_0_80px_rgb(0,0,0,0.35)]">
        <header className="flex shrink-0 items-center justify-between border-b border-border/70 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-blue" />
            Story reader
          </div>

          <button
            onClick={onClose}
            aria-label="Close story"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 text-muted transition hover:bg-card hover:text-foreground"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Loading — fetching GET /api/news/{id} */}
          {status === "loading" && (
            <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-9">
              <div className="aspect-16/7 w-full animate-pulse rounded-2xl border border-border/70 bg-card/50" />
              <div className="h-4 w-24 animate-pulse rounded-full bg-card/70" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-card/70" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-card/70" />
              <div className="h-4 w-full animate-pulse rounded-full bg-card/70" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-card/70" />
            </div>
          )}

          {/* 404 NOT_FOUND */}
          {status === "notfound" && (
            <div className="px-5 py-16 text-center sm:px-8">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                Article not found
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
                No article with this ID exists in the store. It may have been
                removed by the retention sweep.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
              >
                Back to stories
              </button>
            </div>
          )}

          {/* Network / server error */}
          {status === "error" && (
            <div className="px-5 py-16 text-center sm:px-8">
              <p className="text-lg font-semibold text-foreground">
                Couldn’t load this story
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
                {error?.message ?? "Please try again in a moment."}
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
              >
                <RefreshCw size={12} />
                Try again
              </button>
            </div>
          )}

          {/* Article */}
          {status === "ready" && article && (
            <>
              {article.image_url ? (
                <div className="aspect-16/8 w-full overflow-hidden bg-card">
                  <ArticleImage
                    src={article.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-16/7 overflow-hidden border-b border-border/60 bg-card">
                  <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue/10 blur-3xl" />
                  <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-purple/10 blur-3xl" />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-size-[28px_28px]" />
                </div>
              )}

              <article className="px-5 py-7 sm:px-8 sm:py-9">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue/15 bg-blue/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue">
                    {article.category || "News"}
                  </span>
                  <span className="text-xs text-muted">
                    {timeAgo(article.published_at)}
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-4xl">
                  {article.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">
                    {article.source || UNKNOWN}
                  </span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                  {readTime && (
                    <>
                      <span>•</span>
                      <span>{readTime}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>via {article.provider || UNKNOWN}</span>
                </div>

                {summary && (
                  <div className="mt-8 rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl sm:p-6">
                    <p className="text-base font-medium leading-7 text-foreground">
                      {summary}
                    </p>
                  </div>
                )}

                {content ? (
                  <div className="mt-8 space-y-5 text-sm leading-7 text-muted">
                    {content
                      .split(/\n{2,}/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                ) : (
                  <p className="mt-8 text-sm leading-7 text-muted">
                    Only a short summary was supplied for this story — open the
                    original article for the full report.
                  </p>
                )}

                <section className="mt-10 border-t border-border/70 pt-7">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                    Read the full story
                  </div>

                  <div className="mt-4 space-y-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/45 px-4 py-3 text-sm transition hover:border-blue/25 hover:bg-card"
                    >
                      <span className="min-w-0 truncate font-medium">
                        Original article
                      </span>
                      <ExternalLink
                        size={14}
                        className="ml-3 shrink-0 text-muted transition group-hover:text-blue"
                      />
                    </a>

                    <Link
                      href={`/article/${article.id}`}
                      className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/45 px-4 py-3 text-sm transition hover:border-blue/25 hover:bg-card"
                    >
                      <span className="font-medium">Open full page</span>
                      <ExternalLink
                        size={14}
                        className="ml-3 shrink-0 text-muted transition group-hover:text-blue"
                      />
                    </Link>
                  </div>

                  <p className="mt-4 text-[11px] text-muted">
                    Published {formatUtc(article.published_at)} UTC · Fetched{" "}
                    {formatUtc(article.fetched_at)} UTC
                  </p>
                </section>
              </article>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
