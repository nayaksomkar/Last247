import type { Article } from "@/lib/types";
import { UNKNOWN, readMinutes, timeAgo } from "@/lib/format";
import ArticleImage from "./ArticleImage";

// Small sticker-style accent rotation, keyed off the stable article id.
const ACCENTS = [
  "bg-yellow",
  "bg-blue",
  "bg-pink",
  "bg-green",
  "bg-orange",
  "bg-lavender",
] as const;

function accentFor(id: string): string {
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

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block w-full rounded-3xl border-2 border-ink bg-frost p-4 text-left shadow-[4px_4px_0_0_var(--ink)] backdrop-blur-xl transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)] sm:p-5"
    >
      {article.category && (
        <span className="absolute -top-3 right-4 rotate-2 rounded-full border-2 border-ink bg-yellow px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#111] shadow-[2px_2px_0_0_var(--ink)]">
          {article.category}
        </span>
      )}

      {/* Source + time */}
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-ink text-[11px] font-bold text-[#111] ${accentFor(article.id)}`}
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
        <div className="mt-3.5 overflow-hidden rounded-2xl border-2 border-ink shadow-[3px_3px_0_0_var(--ink)]">
          <ArticleImage
            src={article.image_url}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      {readTime && (
        <p className="mt-3 font-display text-[10px] uppercase tracking-widest text-muted">
          {readTime}
        </p>
      )}
    </button>
  );
}
