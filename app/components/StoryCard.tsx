import type { Article } from "@/lib/types";
import { UNKNOWN, readMinutes, timeAgo } from "@/lib/format";
import ArticleImage from "./ArticleImage";

// One soft pastel accent per card, keyed off the stable article id.
const ACCENTS = [
  "bg-pink",
  "bg-blue",
  "bg-mint",
  "bg-yellow",
  "bg-peach",
  "bg-lavender",
] as const;

export function accentFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

export default function StoryCard({
  article,
  onOpen,
}: {
  article: Article;
  onOpen: () => void;
}) {
  const readTime = readMinutes(
    `${article.description ?? ""} ${article.content ?? ""}`,
  );
  const accent = accentFor(article.id);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block w-full rounded-3xl border border-ink/10 bg-frost p-4 text-left soft-shadow backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:soft-shadow-lg sm:p-5"
    >
      {article.category && (
        <span
          className={`absolute -top-3 right-4 rotate-2 rounded-full border border-ink/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#111] ${accent}`}
        >
          {article.category}
        </span>
      )}

      {/* Source + time */}
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-ink/10 text-[11px] font-bold text-[#111] ${accent}`}
        >
          {(article.source || UNKNOWN).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 truncate text-xs font-bold">
          {article.source || UNKNOWN}
        </span>
        <span className="shrink-0 text-xs text-muted">
          · {timeAgo(article.published_at)}
        </span>
      </div>

      {/* Headline */}
      <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight sm:text-xl">
        {article.title}
      </h3>

      {/* Summary */}
      {article.description && (
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted">
          {article.description}
        </p>
      )}

      {/* Image */}
      {article.image_url && (
        <div className="mt-3.5 overflow-hidden rounded-2xl border border-ink/10 soft-shadow">
          <ArticleImage
            src={article.image_url}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      {readTime && (
        <p className="mt-3 text-[11px] font-medium text-muted">{readTime}</p>
      )}
    </button>
  );
}
