// app/api/news/db.ts

import { createClient, type Client } from "@libsql/client";
import type { ArticleRow } from "./types";

/** Feed size. The UI renders one lead story plus a scrollable column. */
export const NEWS_LIMIT = 20;

export const ARTICLES_TABLE = "articles";

/**
 * The Go ingestion service owns this table. This module only ever reads it —
 * Last247 never writes news, and never calls an external news API.
 */
const SELECT_LATEST = `
  SELECT *
  FROM ${ARTICLES_TABLE}
  ORDER BY published_at DESC
  LIMIT ?
`;

export class NewsDatabaseNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NewsDatabaseNotConfiguredError";
  }
}

export class NewsDatabaseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NewsDatabaseError";
  }
}

let client: Client | null = null;

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new NewsDatabaseNotConfiguredError(
      "TURSO_DATABASE_URL is not configured"
    );
  }

  if (!client) {
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return client;
}

export async function fetchLatestArticleRows(
  limit: number = NEWS_LIMIT
): Promise<ArticleRow[]> {
  const db = getClient();

  try {
    const result = await db.execute({
      sql: SELECT_LATEST,
      args: [limit],
    });

    return result.rows as ArticleRow[];
  } catch (error) {
    throw new NewsDatabaseError("Failed to read articles from the database", {
      cause: error,
    });
  }
}
