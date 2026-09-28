// app/api/news/types.ts

/**
 * Normalized article returned by `GET /api/news`.
 *
 * This is the whole contract between the backend and the UI: a read-only
 * projection of a stored database record. The UI never learns how a story was
 * collected, and never performs any collection itself.
 */
export type NewsArticle = {
  source: {
    id: string | null;
    name: string;
  };
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  author: string | null;
};

export type NewsFeedMeta = {
  /** `skipped` counts stored rows that could not be rendered. */
  counts: {
    returned: number;
    skipped: number;
  };
};

export type NewsFeed = {
  status: "ok";
  totalResults: number;
  articles: NewsArticle[];
  meta: NewsFeedMeta;
};

export type ArticleRow = Record<string, unknown>;
