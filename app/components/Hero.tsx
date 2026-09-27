export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden py-24 sm:pt-24 sm:pb-28">
      {/* Dynamic Background Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
      >
        {/* Editorial ambient glows */}
        <div className="absolute left-1/2 -top-25 h-137.5 w-212.5 -translate-x-1/2 rounded-[100%] bg-linear-to-b from-blue/12 via-purple/6 to-transparent blur-3xl dark:from-blue/18 dark:via-purple/10" />
        <div className="absolute -left-40 top-1/3 h-72 w-72 rounded-full bg-blue/10 blur-[90px]" />
        <div className="absolute -right-40 top-1/4 h-80 w-80 rounded-full bg-purple/10 blur-[100px]" />

        {/* Subtle grid pattern mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4.5rem_4.5rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_10%,#000_70%,transparent_100%)] opacity-[0.45] dark:opacity-[0.25]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 shadow-sm backdrop-blur-md transition-all hover:border-border">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
            Updated Daily
          </span>
          <span className="text-muted/40">|</span>
          <span className="text-[11px] font-medium text-foreground">
            Latest stories
          </span>
        </div>

        {/* Editorial Display Heading */}
        <div className="mt-8 max-w-5xl">
          <h1 className="text-[clamp(2.8rem,7.5vw,6.5rem)] font-extrabold leading-[0.94] tracking-[-0.055em] text-foreground">
            Everything that{" "}
            <span className="inline-block bg-linear-to-r from-blue via-purple to-blue bg-size-[200%_auto] bg-clip-text text-transparent">
              mattered.
            </span>
            <br />
            In the last 24 hours.
          </h1>
        </div>

        {/* Subhead & Calls to Action */}
        <div className="mt-8 flex max-w-2xl flex-col gap-8 sm:mt-10">
          <p className="text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
            The world moves fast. You don&apos;t need to read everything.{" "}
            <span className="font-medium text-foreground">
              Last 24 turns thousands of global feeds into clear, high-signal briefings.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href="#latest"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-sm transition-all duration-300 hover:opacity-90 hover:shadow-md active:scale-95"
            >
              Start reading
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            <a
              href="#latest"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/80 bg-card/60 px-5 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:border-foreground/30 hover:bg-card/90 active:scale-95"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple" />
              Latest News
            </a>
          </div>
        </div>

        {/* Modern Floating Stat Strip with Glass Effect */}
        <div className="mt-16 sm:mt-24">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard
              value="24h"
              label="Rolling window"
              detail="Zero stale content"
              accentColor="group-hover:text-blue"
            />
            <StatCard
              value="3 min"
              label="Read time"
              detail="Executive summaries"
              accentColor="group-hover:text-green"
            />
            <StatCard
              value="50+"
              label="Sources scanned"
              detail="Verified publications"
              accentColor="group-hover:text-amber"
            />
            <StatCard
              value="AI"
              label="Distillation engine"
              detail="Neutral point of view"
              accentColor="group-hover:text-purple"
            />
          </div>
        </div>

        {/* Scroll affordance prompt */}
        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
            Scroll to inspect today&apos;s headlines
          </span>
          <a href="#latest" className="hover:text-foreground transition-colors">
            ↓ Jump to top stories
          </a>
        </div>

      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  detail,
  accentColor = "",
}: {
  value: string;
  label: string;
  detail: string;
  accentColor?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-border/70 bg-card/50 p-4.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/80 hover:shadow-[0_8px_25px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)]">
      <div className="flex items-baseline justify-between">
        <p className={`text-2xl font-bold tracking-tight text-foreground transition-colors sm:text-3xl ${accentColor}`}>
          {value}
        </p>
      </div>
      <p className="mt-1.5 text-xs font-semibold tracking-tight text-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">
        {detail}
      </p>
    </div>
  );
}