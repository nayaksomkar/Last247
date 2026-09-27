"use client";

import { useEffect } from "react";
import { X, ExternalLink, Clock3, Layers3 } from "lucide-react";

export type NewsStory = {
  category: "World" | "Business" | "Technology" | "Science";
  title: string;
  summary: string;
  source: string;
  time: string;
  readTime: string;
  accent: "blue" | "amber" | "green" | "red" | "purple";
  image?: string;
  body?: string[];
  sources?: { name: string; url: string }[];
};

type Props = {
  story: NewsStory | null;
  onClose: () => void;
};

const accentStyles = {
  blue: "bg-blue/10 text-blue border-blue/15",
  amber: "bg-amber/10 text-amber border-amber/15",
  green: "bg-green/10 text-green border-green/15",
  red: "bg-red/10 text-red border-red/15",
  purple: "bg-purple/10 text-purple border-purple/15",
};

export default function NewsReaderAside({ story, onClose }: Props) {
  useEffect(() => {
    if (!story) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Read story">
      <button
        aria-label="Close story"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-[3px] transition-opacity dark:bg-black/55"
      />

      <aside className="absolute right-0 top-0 flex h-dvh w-full max-w-2xl flex-col border-l border-border/70 bg-background/95 shadow-[-20px_0_80px_rgb(0,0,0,0.12)] backdrop-blur-2xl animate-[slideIn_400ms_cubic-bezier(0.22,1,0.36,1)] dark:shadow-[-20px_0_80px_rgb(0,0,0,0.35)]">
        <header className="flex shrink-0 items-center justify-between border-b border-border/70 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-blue" />
            Story reader
          </div>

          <button
            onClick={onClose}
            aria-label="Close story"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 text-muted transition hover:bg-card hover:text-foreground"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {story.image ? (
            <div className="aspect-16/8 w-full overflow-hidden bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={story.image} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="relative aspect-16/7 overflow-hidden border-b border-border/60 bg-card">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-purple/10 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-size-[28px_28px]" />
            </div>
          )}

          <article className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${accentStyles[story.accent]}`}>
                {story.category}
              </span>
              <span className="text-xs text-muted">{story.time}</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-4xl">
              {story.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <span className="font-semibold text-foreground">{story.source}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{story.readTime}</span>
              {story.sources?.length ? (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5"><Layers3 size={13} />{story.sources.length} sources</span>
                </>
              ) : null}
            </div>

            <div className="mt-8 rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl sm:p-6">
              <p className="text-base font-medium leading-7 text-foreground">{story.summary}</p>
            </div>

            <div className="mt-8 space-y-5 text-sm leading-7 text-muted">
              {(story.body ?? [
                "This story is part of the latest 24-hour briefing. The full article summary will be generated from the strongest available reporting and presented here without sending you to another page.",
                "As additional reporting emerges, the briefing can be updated to reflect what changed, why it matters, and what to watch next.",
              ]).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {story.sources?.length ? (
              <section className="mt-10 border-t border-border/70 pt-7">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                  Sources
                </div>

                <div className="mt-4 space-y-2">
                  {story.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/45 px-4 py-3 text-sm transition hover:border-blue/25 hover:bg-card"
                    >
                      <span className="font-medium">{source.name}</span>
                      <ExternalLink size={14} className="text-muted transition group-hover:text-blue" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </aside>
    </div>
  );
}
