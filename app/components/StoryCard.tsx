import type { NewsStory } from "./NewsReaderAside";

type StoryCardProps = NewsStory;

const categoryStyles = {
  Business: "bg-amber/10 text-amber border-amber/15",
  Technology: "bg-blue/10 text-blue border-blue/15",
  Science: "bg-green/10 text-green border-green/15",
  World: "bg-red/10 text-red border-red/15",
};

const accentStyles = {
  blue: "from-blue/12 via-blue/3 to-transparent",
  amber: "from-amber/12 via-amber/3 to-transparent",
  green: "from-green/12 via-green/3 to-transparent",
  red: "from-red/12 via-red/3 to-transparent",
  purple: "from-purple/12 via-purple/3 to-transparent",
};

export default function StoryCard({
  category,
  title,
  summary,
  source,
  time,
  readTime,
  accent,
  image,
  ...story
}: StoryCardProps) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("last24:open-story", {
            detail: {
              category,
              title,
              summary,
              source,
              time,
              readTime,
              accent,
              image,
              ...story,
            },
          }),
        )
      }
      className="group relative isolate block w-full snap-start overflow-hidden rounded-2xl border border-border/70 bg-card/55 p-5 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-border hover:bg-card/75 hover:shadow-[0_18px_50px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_18px_50px_rgb(0,0,0,0.22)]"
    >
      {/* Accent glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b ${accentStyles[accent]} opacity-70 transition-all duration-500 group-hover:h-44 group-hover:opacity-100`}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 -z-10 h-36 w-36 rounded-full bg-foreground/2 blur-3xl transition-transform duration-700 group-hover:scale-150"
      />

      {/* Image */}
      {image && (
        <div className="mb-5 aspect-16/7 overflow-hidden rounded-xl border border-border/50 bg-card">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${categoryStyles[category]}`}
        >
          {category}
        </span>

        <span className="text-[11px] text-muted">
          {time}
        </span>
      </div>

      {/* Headline */}
      <h3 className="mt-5 text-xl font-bold leading-snug tracking-[-0.03em] text-foreground">
        {title}
      </h3>

      {/* Summary */}
      <p className="mt-3 text-sm leading-6 text-muted">
        {summary}
      </p>

      {/* Footer */}
      <div className="relative mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-semibold text-foreground">
            {source}
          </span>

          <span>•</span>

          <span>{readTime}</span>
        </div>

        <span className="-translate-x-1 text-sm text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          →
        </span>
      </div>
    </button>
  );
}