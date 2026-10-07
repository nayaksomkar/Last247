import Footer from "./components/Footer";
import Feed from "./components/Feed";
import Navbar from "./components/Navbar";

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5l2.6 8.1 8.4 2.4-8.4 2.4-2.6 8.1-2.6-8.1L1 12l8.4-2.4z" />
    </svg>
  );
}

function Masthead() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="relative mx-auto w-full max-w-2xl px-4 pb-10 pt-8 sm:px-5 sm:pt-12">
      <span className="inline-block -rotate-2 rounded-full bg-yellow px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#111]">
        Fresh every 24h
      </span>

      <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
        LAST247
        <Star className="ml-3 inline-block h-7 w-7 text-peach sm:h-10 sm:w-10" />
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
      {/* Soft pastel washes + floating geometry — clipped, non-interactive,
          desktop only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-pink/40 blur-3xl" />
        <div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-lavender/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-mint/30 blur-3xl" />

        {/* Floating geometric accents */}
        <div className="absolute -left-8 top-64 h-32 w-32 animate-[drift_8s_ease-in-out_infinite_alternate] rounded-[2rem] bg-lavender soft-shadow [--drift-rot:6deg]" />
        <div className="absolute right-10 top-48 h-10 w-10 rounded-full bg-yellow soft-shadow" />
        <div className="absolute bottom-48 right-20">
          <Star className="h-9 w-9 rotate-12 text-peach drop-shadow-sm" />
        </div>
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
