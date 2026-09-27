import { ArrowUp, Heart, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-card/30 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8 lg:px-10">
        
        {/* Left: Brand badge & crafted note */}
        <div className="flex items-center gap-2.5 text-xs text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background select-none">
            24
          </span>
          <p className="tracking-wider">
            Built <span className="font-semibold text-foreground">Last 24</span> with{" "}
            <Heart className="inline h-3 w-3 fill-red text-red transition-transform hover:scale-125" />
          </p>
        </div>

        {/* Center: Floating segmented nav pill */}
        <nav className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 p-1 shadow-xs backdrop-blur-sm text-xs">
          <a
            href="#home"
            className="rounded-full px-3 py-1 font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Home
          </a>
          <a
            href="#latest"
            className="rounded-full px-3 py-1 font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Feed
          </a>
          <a
            href="#meet"
            className="rounded-full px-3 py-1 font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Meet
          </a>
          <a
            href="https://devakashsharma.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-foreground transition-colors hover:bg-foreground/5 hover:text-blue"
          >
            <span>Akash</span>
            <ArrowUpRight className="h-3 w-3 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue" />
          </a>
        </nav>

        {/* Right: Kinetic back-to-top chip */}
        <a
          href="#home"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted shadow-xs transition-all hover:border-foreground/30 hover:bg-foreground hover:text-background active:scale-95"
        >
          <span>Top</span>
          <ArrowUp className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </a>

      </div>
    </footer>
  );
}