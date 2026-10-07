"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, RefreshCw, X } from "lucide-react";
import {
  UNKNOWN,
  cleanContent,
  formatUtc,
  readMinutes,
  timeAgo,
} from "@/lib/format";
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/65"
      />

      {/* Frosted story sheet — near full-screen on mobile, centered modal on
          desktop. The animation lives on the inner wrapper so it never fights
          the centering transform. */}
      <aside className="absolute inset-x-0 bottom-0 flex h-[93dvh] flex-col overflow-hidden rounded-t-[28px] border-2 border-ink bg-frost shadow-[0_-5px_0_0_var(--ink)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(86dvh,880px)] sm:w-[calc(100%-3rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:shadow-[8px_8px_0_0_var(--ink)]">
        <div className="flex h-full min-h-0 flex-col animate-[popIn_240ms_cubic-bezier(0.22,1,0.36,1)]">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-ink px-4 py-3 sm:px-6">
            <span className="inline-block -rotate-2 rounded-full border-2 border-ink bg-green px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-[#111]">
              Story
            </span>

            <button
              onClick={onClose}
              aria-label="Close story"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-frost-soft transition hover:-translate-y-0.5 hover:bg-yellow hover:shadow-[2px_2px_0_0_var(--ink)]"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {/* Loading — fetching GET /api/news/{id} */}
            {status === "loading" && (
              <div className="space-y-5 px-4 py-6 sm:px-7 sm:py-8">
                <div className="aspect-[16/9] w-full animate-pulse rounded-2xl border-2 border-ink/15 bg-ink/10" />
                <div className="h-4 w-28 animate-pulse rounded-full bg-ink/10" />
                <div className="h-8 w-full animate-pulse rounded-xl bg-ink/10" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-ink/10" />
                <div className="h-4 w-full animate-pulse rounded-full bg-ink/10" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-ink/10" />
              </div>
            )}

            {/* 404 NOT_FOUND */}
            {status === "notfound" && (
              <div className="px-4 py-16 text-center sm:px-8">
                <p className="font-display text-xl font-bold">
                  STORY NOT FOUND
                </p>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
                  This story isn’t in the store anymore — it may have been
                  cleaned up since it was published.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow px-4 py-2 text-xs font-bold text-[#111] shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]"
                >
                  Back to the feed
                </button>
              </div>
            )}

            {/* Network / server error */}
            {status === "error" && (
              <div className="px-4 py-16 text-center sm:px-8">
                <p className="text-lg font-bold">Couldn’t load this story</p>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
                  {error?.message ?? "Please try again in a moment."}
                </p>

                <button
                  type="button"
                  onClick={retry}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow px-4 py-2 text-xs font-bold text-[#111] shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]"
                >
                  <RefreshCw size={12} />
                  Try again
                </button>
              </div>
            )}

            {/* Article */}
            {status === "ready" && article && (
              <article className="px-4 py-5 sm:px-7 sm:py-7">
                {article.image_url && (
                  <div className="overflow-hidden rounded-2xl border-2 border-ink shadow-[4px_4px_0_0_var(--ink)]">
                    <ArticleImage
                      src={article.image_url}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </div>
                )}

                {/* Meta */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {article.category && (
                    <span className="rounded-full border-2 border-ink bg-yellow px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#111]">
                      {article.category}
                    </span>
                  )}
                  <span className="text-xs font-bold">
                    {article.source || UNKNOWN}
                  </span>
                  <span className="text-xs text-muted">
                    · {timeAgo(article.published_at)}
                  </span>
                  {readTime && (
                    <span className="text-xs text-muted">· {readTime}</span>
                  )}
                </div>

                <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-4xl sm:leading-[1.05]">
                  {article.title}
                </h1>

                {summary && (
                  <div className="mt-5 rounded-2xl border-2 border-dashed border-ink/40 bg-frost-soft p-4 sm:p-5">
                    <p className="text-[15px] font-medium leading-7">
                      {summary}
                    </p>
                  </div>
                )}

                {content ? (
                  <div className="mt-5 space-y-4 text-[15px] leading-7 text-muted">
                    {content
                      .split(/\n{2,}/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-muted">
                    Only a short summary was supplied for this story — open the
                    original article for the full report.
                  </p>
                )}

                <section className="mt-8 border-t-2 border-dashed border-ink/30 pt-5">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow px-4 py-2 text-xs font-bold text-[#111] shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]"
                  >
                    Read the original
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  </a>

                  <p className="mt-4 text-[11px] text-muted">
                    Published {formatUtc(article.published_at)} UTC
                  </p>
                </section>
              </article>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
