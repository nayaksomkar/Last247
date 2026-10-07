import Footer from "./components/Footer";
import Feed from "./components/Feed";
import Navbar from "./components/Navbar";

function Masthead() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="relative mx-auto w-full max-w-2xl px-4 pb-10 pt-8 sm:px-5 sm:pt-12">
      <span className="inline-block -rotate-2 rounded-full border-2 border-ink bg-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#111] shadow-[2px_2px_0_0_var(--ink)]">
        Fresh every 24h
      </span>

      <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
        LAST<span className="text-blue">247</span>
      </h1>

      <p className="mt-4 max-w-md text-sm leading-6 text-muted sm:text-base">
        The news that stuck from the last 24 hours, in one feed. Scroll, tap a
        story, read, get on with your day.
      </p>

      <p className="mt-3 font-display text-[10px] uppercase tracking-[0.2em] text-muted">
        Today’s edition — {today}
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-dvh">
      {/* Backdrop decoration — clipped, non-interactive, desktop only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        <div className="absolute -left-10 top-64 h-44 w-44 animate-[drift_7s_ease-in-out_infinite_alternate] rounded-[2.5rem] border-2 border-ink bg-yellow/50 shadow-[6px_6px_0_0_var(--ink)] [--drift-rot:8deg]" />
        <div className="absolute right-6 top-44 h-10 w-10 rounded-full border-2 border-ink bg-pink shadow-[3px_3px_0_0_var(--ink)]" />
        <div className="absolute bottom-44 right-16 h-24 w-24 rounded-full border-2 border-ink bg-lavender/50 shadow-[4px_4px_0_0_var(--ink)]" />
      </div>

      <div className="relative">
        <Navbar />
        <Masthead />
        <Feed />
        <Footer />
      </div>
    </main>
  );
}
