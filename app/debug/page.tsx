"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

// ponytail: dev-only diagnostic — runs the ACTUAL browser fetch (same
// code path as lib/api.ts) and prints URL/status/error. Delete once the
// connection issue is resolved.

export default function DebugPage() {
  const [lines, setLines] = useState<string[]>([]);
  const log = (s: string) => setLines((prev) => [...prev, s]);

  useEffect(() => {
    (async () => {
      log(`API_BASE_URL: ${API_BASE_URL}`);
      log(`user agent: ${navigator.userAgent}`);

      for (const path of ["/health", "/api/news?limit=1", "/api/stats"]) {
        const t0 = Date.now();
        try {
          const res = await fetch(`${API_BASE_URL}${path}`);
          const text = await res.text();
          log(
            `GET ${path} -> ${res.status} in ${Date.now() - t0}ms  CORS: ${res.headers.get("access-control-allow-origin") ?? "none"}`,
          );
          log(`  body: ${text.slice(0, 150)}`);
        } catch (e) {
          const err = e as Error;
          log(
            `GET ${path} -> FETCH FAILED in ${Date.now() - t0}ms  ${err.name}: ${err.message}`,
          );
        }
      }
      log("done");
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background p-6 font-mono text-sm text-foreground">
      <h1 className="text-lg font-bold">Backend fetch diagnostic (browser)</h1>
      <pre className="mt-4 whitespace-pre-wrap">{lines.join("\n")}</pre>
    </main>
  );
}
