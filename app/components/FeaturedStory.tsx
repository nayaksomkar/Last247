import type { NewsStory } from "./NewsReaderAside";

export default function FeaturedStory({
  story,
}: {
  story: NewsStory;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("last24:open-story", {
            detail: story,
          }),
        )
      }
      className="group relative isolate min-h-[460px] w-full overflow-hidden rounded-3xl border border-border/70 bg-card/55 p-6 text-left shadow-[0_20px_70px_rgb(0,0,0,0.05)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue/30 hover:shadow-[0_25px_80px_rgb(40,100,215,0.10)] dark:shadow-[0_20px_70px_rgb(0,0,0,0.25)]"
    >
      {/* News image */}
      {story.image && (
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <img
            src={story.image}
            alt=""
            className="h-full w-full object-cover opacity-30 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40"
          />

          <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/20" />
        </div>
      )}

      {/* Decorative atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-blue/10 blur-3xl transition-transform duration-700 group-hover:scale-125"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-64 w-64 rounded-full bg-purple/8 blur-3xl transition-transform duration-700 group-hover:scale-110"
      />

      <div className="flex h-full flex-col">
        {/* Top */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-red/15 bg-red/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-red" />
            </span>

            Breaking
          </span>

          <span className="text-[11px] font-medium text-muted">
            {story.time}
          </span>
        </div>

        {/* Content */}
        <div className="mt-auto pt-24">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue">
            <span>{story.category}</span>

            <span className="h-px w-5 bg-blue/40" />

            <span>Top story</span>
          </div>

          <h3 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl">
            {story.title}
          </h3>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            {story.summary}
          </p>

          {/* Footer */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-foreground">
                {story.source}
              </span>

              <span>•</span>

              <span>{story.readTime}</span>

              {story.sources?.length ? (
                <>
                  <span>•</span>

                  <span>
                    {story.sources.length} source
                    {story.sources.length !== 1 ? "s" : ""}
                  </span>
                </>
              ) : null}
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all group-hover:border-blue/25 group-hover:bg-card">
              Read briefing

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}