"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { UNKNOWN, formatUtc, readMinutes, timeAgo } from "@/lib/format";
import { useArticle } from "@/lib/hooks";
import ArticleImage from "@/app/components/ArticleImage";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { article, status, error, retry } = useArticle(id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <Link
          href="/#latest"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Back to stories
        </Link>

        {/* Loading */}
        {status === "loading" && (
          <div className="mt-10 space-y-5" aria-live="polite">
            <div className="aspect-16/7 w-full animate-pulse rounded-2xl border border-border/70 bg-card/50" />
            <div className="h-4 w-28 animate-pulse rounded-full bg-card/70" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-card/70" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-card/70" />
            <div className="h-4 w-full animate-pulse rounded-full bg-card/70" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-card/70" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-card/70" />
          </div>
        )}

        {/* 404 NOT_FOUND */}
        {status === "notfound" && (
          <div className="mt-16 rounded-2xl border border-border/70 bg-card/50 p-8 text-center">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              Article not found
            </p>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
              No article with this ID exists in the store. It may have been
              removed by the retention sweep.
            </p>

            <Link
              href="/#latest"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
            >
              Back to stories
            </Link>
          </div>
        )}

        {/* Network / server error */}
        {status === "error" && (
          <div className="mt-16 rounded-2xl border border-border/70 bg-card/50 p-8 text-center">
            <p className="text-lg font-semibold text-foreground">
              Couldn’t load this article
            </p>

            <p
              className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted"
              role="alert"
            >
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
          <article className="mt-10">
            {article.image_url && (
              <div className="aspect-16/8 w-full overflow-hidden rounded-2xl border border-border/60 bg-card">
                <ArticleImage
                  src={article.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-2">
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
              <span>•</span>
              <span>
                {readMinutes(
                  `${article.description ?? ""} ${article.content ?? ""}`,
                )}
              </span>
              <span>•</span>
              <span>via {article.provider || UNKNOWN}</span>
            </div>

            {article.description && (
              <div className="mt-8 rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6">
                <p className="text-base font-medium leading-7 text-foreground">
                  {article.description}
                </p>
              </div>
            )}

            {article.content ? (
              <div className="mt-8 space-y-5 text-sm leading-7 text-muted">
                {article.content
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
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-blue/30"
              >
                Read the original article
                <ExternalLink
                  size={13}
                  className="text-muted transition group-hover:text-blue"
                />
              </a>

              <p className="mt-5 text-[11px] text-muted">
                Published {formatUtc(article.published_at)} UTC · Fetched{" "}
                {formatUtc(article.fetched_at)} UTC
              </p>
            </section>
          </article>
        )}
      </div>
    </main>
  );
}
