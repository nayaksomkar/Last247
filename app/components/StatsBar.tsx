"use client";

import { RefreshCw } from "lucide-react";
import { UNKNOWN, formatUtc } from "@/lib/format";
import { useStats } from "@/lib/hooks";

export default function StatsBar() {
  const { stats, status, error, refresh } = useStats();

  const ingestion = stats?.last_ingestion;

  return (
    <section id="pulse" className="relative scroll-mt-24" aria-label="Database status">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-border/70 bg-card/50 p-4.5 backdrop-blur-md sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-purple" />
              Database status
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={status === "loading"}
                aria-label="Refresh stats"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={status === "loading" ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl border border-border/60 bg-background/40"
                />
              ))}
            </div>
          )}

          {/* Unavailable */}
          {status === "unavailable" && (
            <div className="mt-4 flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted" role="alert">
                Stats unavailable —{" "}
                {error?.message ?? "please try again in a moment."}
              </p>

              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-blue/30"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          {/* Ready */}
          {status === "ready" && stats && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCell
                value={String(stats.total_articles)}
                label="Articles stored"
                detail="Rolling retention window"
              />
              <StatCell
                value={ingestion ? ingestion.provider || UNKNOWN : "—"}
                label="Last provider"
                detail={
                  ingestion
                    ? `${ingestion.total} returned by provider`
                    : "No ingestion has run yet"
                }
              />
              <StatCell
                value={ingestion ? `+${ingestion.inserted}` : "—"}
                label="Inserted / skipped"
                detail={
                  ingestion
                    ? `${ingestion.skipped} skipped · ${ingestion.deleted} deleted`
                    : "Awaiting the first run"
                }
              />
              <StatCell
                value={ingestion ? formatUtc(ingestion.source_time) : "—"}
                label="Last run (UTC)"
                detail={ingestion ? "Provider query time" : "—"}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCell({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
      <p className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted">{detail}</p>
    </div>
  );
}
