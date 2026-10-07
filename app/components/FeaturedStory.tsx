import type { Article } from "@/lib/types";
import { UNKNOWN, readMinutes, timeAgo } from "@/lib/format";
import { openArticle } from "@/lib/events";
import ArticleImage from "./ArticleImage";

export default function FeaturedStory({ article }: { article: Article }) {
  const category = article.category || "News";

  return (
    <button
      type="button"
      onClick={() => openArticle(article.id)}
      className="group relative isolate min-h-[460px] w-full overflow-hidden rounded-3xl border border-border/70 bg-card/55 p-6 text-left shadow-[0_20px_70px_rgb(0,0,0,0.05)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue/30 hover:shadow-[0_25px_80px_rgb(40,100,215,0.10)] dark:shadow-[0_20px_70px_rgb(0,0,0,0.25)]"
    >
      {/* News image */}
      {article.image_url && (
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <ArticleImage
            src={article.image_url}
            className="h-full w-full object-cover opacity-30 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40"
          />

          <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/20" />
        </div>
      )}

      {/* Decorative atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-blue/10 blur-3xl transition-transform duration-700 group-hover:scale-125"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-64 w-64 rounded-full bg-purple/8 blur-3xl transition-transform duration-700 group-hover:scale-110"
      />

      <div className="flex h-full flex-col">
        {/* Top */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue/15 bg-blue/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-blue" />
            </span>

            Latest
          </span>

          <span className="text-[11px] font-medium text-muted">
            {timeAgo(article.published_at)}
          </span>
        </div>

        {/* Content */}
        <div className="mt-auto pt-24">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue">
            <span>{category}</span>

            <span className="h-px w-5 bg-blue/40" />

            <span>Top story</span>
          </div>

          <h3 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl">
            {article.title}
          </h3>

          {article.description && (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              {article.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-foreground">
                {article.source || UNKNOWN}
              </span>

              <span>•</span>

              <span>
                {readMinutes(
                  `${article.description ?? ""} ${article.content ?? ""}`,
                )}
              </span>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all group-hover:border-blue/25 group-hover:bg-card">
              Read briefing

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
