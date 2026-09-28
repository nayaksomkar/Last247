// app/api/news/normalize.ts

import type { ArticleRow, NewsArticle } from "./types";

const PLACEHOLDER_TITLES = new Set([
  "[removed]",
  "-",
  "untitled",
  "untitled story",
]);

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return null;
}

/** Accepts the timestamp shapes libSQL can return and normalizes to ISO. */
function readTimestamp(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  const raw = readString(value);

  if (!raw) return null;

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Maps one database row to a normalized article.
 *
 * Returns `null` for rows that cannot be rendered. An article needs a real
 * title, a link, and a usable timestamp — without the timestamp the UI cannot
 * place it in the 24-hour window it is built around.
 */
export function mapRowToArticle(row: ArticleRow): NewsArticle | null {
  const title = readString(row.title);

  if (!title || PLACEHOLDER_TITLES.has(title.toLowerCase())) {
    return null;
  }

  const url = readString(row.url);

  if (!url) {
    return null;
  }

  const publishedAt =
    readTimestamp(row.published_at) ?? readTimestamp(row.ingested_at);

  if (!publishedAt) {
    return null;
  }

  return {
    source: {
      id: readString(row.source_id),
      name: readString(row.source_name) ?? "Unknown source",
    },
    title,
    description: readString(row.description),
    url,
    urlToImage: readString(row.url_to_image),
    publishedAt,
    content: readString(row.content),
    author: readString(row.author),
  };
}

export function mapRowsToArticles(rows: ArticleRow[]): {
  articles: NewsArticle[];
  skipped: number;
} {
  const articles: NewsArticle[] = [];
  let skipped = 0;

  for (const row of rows) {
    const article = mapRowToArticle(row);

    if (article) {
      articles.push(article);
    } else {
      skipped += 1;
    }
  }

  return { articles, skipped };
}
