// app/api/news/route.ts

import { NextResponse } from "next/server";
import {
  NEWS_LIMIT,
  NewsDatabaseNotConfiguredError,
  fetchLatestArticleRows,
} from "./db";
import { mapRowsToArticles } from "./normalize";

/**
 * Database-first feed.
 *
 * A read-only projection of the Turso `articles` table. News is collected
 * continuously by a separate ingestion service; Last247 never calls a news
 * provider, never chooses one, and never reaches for an external API when the
 * database is empty.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await fetchLatestArticleRows(NEWS_LIMIT);
    const { articles, skipped } = mapRowsToArticles(rows);

    return NextResponse.json(
      {
        status: "ok" as const,
        totalResults: articles.length,
        articles,
        meta: {
          counts: {
            returned: articles.length,
            skipped,
          },
        },
      },
      {
        // Short shared cache: the feed changes on an ingestion schedule, so a
        // minute of freshness is plenty.
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    if (error instanceof NewsDatabaseNotConfiguredError) {
      console.error("News database is not configured:", error.message);

      return NextResponse.json(
        { error: "news_not_configured" },
        { status: 500 }
      );
    }

    console.error("News database read failed:", error);

    return NextResponse.json({ error: "news_unavailable" }, { status: 503 });
  }
}
