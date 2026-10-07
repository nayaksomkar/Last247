/**
 * Integration check for `lib/api.ts` against the documented backend contract
 * (UI_API_INTEGRATION.md). Spins up a local HTTP server implementing the
 * documented schemas exactly, then asserts that the API layer sends the right
 * requests (URLs, query params, methods, empty POST body) and parses the
 * documented responses and error shapes.
 *
 * Run: bun scripts/test-api.ts   (or: node --experimental-strip-types scripts/test-api.ts)
 */
import { createServer, type IncomingMessage, type Server } from "node:http";
import assert from "node:assert";
import type { ApiError } from "../lib/api";

// The API layer reads the base URL at import time — point it at the mock first.
process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:8901";

const { fetchHealth, fetchArticles, fetchArticleById, fetchStats, triggerIngest } =
  await import("../lib/api");

// Article exactly as documented in UI_API_INTEGRATION.md §3/§4.
const article = {
  id: "a1b2c3d4e5f6a7b8",
  title: "Breaking: Example Story",
  description: "A brief summary of the story.",
  content: "Full article body text.\n\nSecond paragraph.",
  url: "https://example.com/article-slug",
  image_url: "https://example.com/image.jpg",
  source: "BBC News",
  author: "Jane Doe",
  category: "Technology",
  published_at: "2026-09-30T10:00:00Z",
  fetched_at: "2026-09-30T12:34:56Z",
  provider: "newsapi",
};

// A second article with different category to exercise the exact-match filters.
const articles = [
  article,
  { ...article, id: "b2c3d4e5f6a7b8c9", title: "Second story", category: "Business" },
  { ...article, id: "c3d4e5f6a7b8c9d0", title: "Third story", category: "Business" },
];

type Recorded = { method: string; path: string; body: string };
const requests: Recorded[] = [];

const server: Server = createServer((req: IncomingMessage, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const url = new URL(req.url ?? "/", "http://mock");
    requests.push({ method: req.method ?? "", path: url.pathname + url.search, body });
    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    };

    if (url.pathname === "/health") {
      return json(200, { status: "ok", timestamp: "2026-10-02T06:10:22Z" });
    }

    if (url.pathname === "/api/news") {
      // Doc §3/§8: limit/offset pagination, category/source exact-match filters,
      // fixed ORDER BY published_at DESC (newest first).
      const limit = Number(url.searchParams.get("limit") ?? 50);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const category = url.searchParams.get("category");
      const source = url.searchParams.get("source");

      let list = articles;
      if (category) list = list.filter((a) => a.category === category);
      if (source) list = list.filter((a) => a.source === source);

      return json(200, {
        articles: list.slice(offset, offset + limit),
        total: list.length,
        limit,
        offset,
      });
    }

    // Mock-only path to exercise the documented 500 INTERNAL_ERROR parsing.
    if (url.pathname === "/api/news/__err500") {
      return json(500, { error: "Database query failed", code: "INTERNAL_ERROR" });
    }

    if (url.pathname.startsWith("/api/news/")) {
      const id = decodeURIComponent(url.pathname.slice("/api/news/".length));
      if (id === article.id) return json(200, article);

      // Doc §9 error shape.
      return json(404, {
        error: `article with id "${id}" not found`,
        code: "NOT_FOUND",
      });
    }

    if (url.pathname === "/api/stats") {
      return json(200, {
        total_articles: 142,
        last_ingestion: {
          provider: "newsapi",
          total: 50,
          inserted: 45,
          skipped: 5,
          deleted: 3,
          source_time: "2026-10-02T06:00:00Z",
        },
      });
    }

    if (url.pathname === "/api/ingest") {
      // Doc §3: empty body POST → { success, result }.
      return json(200, {
        success: true,
        result: {
          provider: "newsapi",
          total: 50,
          inserted: 45,
          skipped: 5,
          deleted: 3,
          source_time: "2026-10-02T06:00:00Z",
        },
      });
    }

    return json(404, { error: "not found", code: "NOT_FOUND" });
  });
});

async function listen(server: Server, port: number) {
  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
}

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`ok - ${name}`);
  } catch (e) {
    console.error(`FAIL - ${name}`);
    console.error(e);
    process.exitCode = 1;
  }
}

await listen(server, 8901);

try {
  await check("GET /health returns the documented shape", async () => {
    const health = await fetchHealth();
    assert.deepStrictEqual(health, {
      status: "ok",
      timestamp: "2026-10-02T06:10:22Z",
    });
    assert.strictEqual(requests.at(-1)?.method, "GET");
    assert.strictEqual(requests.at(-1)?.path, "/health");
  });

  await check("GET /api/news sends limit/offset and parses the page", async () => {
    const page = await fetchArticles({ limit: 20, offset: 0 });
    assert.strictEqual(requests.at(-1)?.path, "/api/news?limit=20&offset=0");
    assert.strictEqual(page.articles.length, 3);
    assert.strictEqual(page.total, 3);
    assert.strictEqual(page.limit, 20);
    assert.strictEqual(page.offset, 0);
    assert.strictEqual(page.hasMore, false);
  });

  await check("hasMore is offset + length < total", async () => {
    const page = await fetchArticles({ limit: 1, offset: 0 });
    assert.strictEqual(requests.at(-1)?.path, "/api/news?limit=1&offset=0");
    assert.strictEqual(page.total, 3);
    assert.strictEqual(page.hasMore, true);
    const last = await fetchArticles({ limit: 1, offset: 2 });
    assert.strictEqual(last.hasMore, false);
  });

  await check(
    "category and source filters are sent as exact-match query params",
    async () => {
      const page = await fetchArticles({
        limit: 10,
        offset: 0,
        category: "Technology",
        source: "BBC News",
      });
      assert.strictEqual(
        requests.at(-1)?.path,
        "/api/news?limit=10&offset=0&category=Technology&source=BBC+News",
      );
      assert.strictEqual(page.articles.length, 1);
      assert.strictEqual(page.articles[0].category, "Technology");
    },
  );

  await check("empty result parses as [] with total 0", async () => {
    const page = await fetchArticles({ category: "Nope" });
    assert.deepStrictEqual(page.articles, []);
    assert.strictEqual(page.total, 0);
    assert.strictEqual(page.hasMore, false);
  });

  await check("GET /api/news/{id} returns the article", async () => {
    const data = await fetchArticleById(article.id);
    assert.deepStrictEqual(data, article);
    assert.strictEqual(requests.at(-1)?.path, `/api/news/${article.id}`);
  });

  await check("404 NOT_FOUND surfaces the documented error body", async () => {
    await assert.rejects(
      () => fetchArticleById("nonexistent"),
      (err: ApiError) => {
        assert.strictEqual(err.status, 404);
        assert.strictEqual(err.code, "NOT_FOUND");
        assert.strictEqual(err.message, 'article with id "nonexistent" not found');
        return true;
      },
    );
  });

  await check("500 INTERNAL_ERROR surfaces the documented error body", async () => {
    await assert.rejects(
      () => fetchArticleById("__err500"),
      (err: ApiError) => {
        assert.strictEqual(err.status, 500);
        assert.strictEqual(err.code, "INTERNAL_ERROR");
        assert.strictEqual(err.message, "Database query failed");
        return true;
      },
    );
  });

  await check("GET /api/stats parses total_articles and last_ingestion", async () => {
    const stats = await fetchStats();
    assert.strictEqual(requests.at(-1)?.path, "/api/stats");
    assert.strictEqual(stats.total_articles, 142);
    assert.deepStrictEqual(stats.last_ingestion, {
      provider: "newsapi",
      total: 50,
      inserted: 45,
      skipped: 5,
      deleted: 3,
      source_time: "2026-10-02T06:00:00Z",
    });
  });

  await check("POST /api/ingest sends an empty body and returns the result", async () => {
    const result = await triggerIngest();
    assert.strictEqual(requests.at(-1)?.method, "POST");
    assert.strictEqual(requests.at(-1)?.path, "/api/ingest");
    assert.strictEqual(requests.at(-1)?.body, "");
    assert.deepStrictEqual(result, {
      provider: "newsapi",
      total: 50,
      inserted: 45,
      skipped: 5,
      deleted: 3,
      source_time: "2026-10-02T06:00:00Z",
    });
  });
} finally {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  server.closeAllConnections?.();
}

await check("connection failure maps to a NETWORK ApiError", async () => {
  await assert.rejects(
    () => fetchArticles(),
    (err: ApiError) => {
      assert.strictEqual(err.status, 0);
      assert.strictEqual(err.code, "NETWORK");
      return true;
    },
  );
});

if (process.exitCode === 1) {
  console.error("\nSome checks failed.");
} else {
  console.log(`\nAll ${passed} checks passed.`);
}
