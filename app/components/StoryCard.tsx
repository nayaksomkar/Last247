import type { Article } from "@/lib/types";
import { UNKNOWN, readMinutes, timeAgo } from "@/lib/format";
import { openArticle } from "@/lib/events";
import ArticleImage from "./ArticleImage";

export default function StoryCard({ article }: { article: Article }) {
  const category = article.category || "News";
  const readTime = readMinutes(
    `${article.description ?? ""} ${article.content ?? ""}`,
  );

  return (
    <button
      type="button"
      onClick={() => openArticle(article.id)}
      className="group relative isolate block w-full snap-start overflow-hidden rounded-2xl border border-border/70 bg-card/55 p-5 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-border hover:bg-card/75 hover:shadow-[0_18px_50px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_18px_50px_rgb(0,0,0,0.22)]"
    >
      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-blue/12 via-blue/3 to-transparent opacity-70 transition-all duration-500 group-hover:h-44 group-hover:opacity-100"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 -z-10 h-36 w-36 rounded-full bg-foreground/2 blur-3xl transition-transform duration-700 group-hover:scale-150"
      />

      {/* Image */}
      {article.image_url && (
        <div className="mb-5 aspect-16/7 overflow-hidden rounded-xl border border-border/50 bg-card">
          <ArticleImage
            src={article.image_url}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-blue/15 bg-blue/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue">
          {category}
        </span>

        <span className="text-[11px] text-muted">
          {timeAgo(article.published_at)}
        </span>
      </div>

      {/* Headline */}
      <h3 className="mt-5 text-xl font-bold leading-snug tracking-[-0.03em] text-foreground">
        {article.title}
      </h3>

      {/* Summary */}
      {article.description && (
        <p className="mt-3 text-sm leading-6 text-muted">
          {article.description}
        </p>
      )}

      {/* Footer */}
      <div className="relative mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-semibold text-foreground">
            {article.source || UNKNOWN}
          </span>

          {readTime && (
            <>
              <span>•</span>
              <span>{readTime}</span>
            </>
          )}
        </div>

        <span className="-translate-x-1 text-sm text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          →
        </span>
      </div>
    </button>
  );
}
