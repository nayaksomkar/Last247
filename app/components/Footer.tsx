import GithubIcon from "./GithubIcon";

const REPOS = [
  {
    name: "Last247",
    role: "Frontend / UI",
    href: "https://github.com/nayaksomkar/Last247/tree/main",
  },
  {
    name: "OrcaDeLast247",
    role: "Backend / Orchestrator",
    href: "https://github.com/nayaksomkar/OrcaDeLast247",
  },
];

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-3 pb-10 sm:px-4">
      <div className="rounded-3xl border-2 border-ink bg-frost p-5 shadow-[5px_5px_0_0_var(--ink)] backdrop-blur-xl sm:p-7">
        <p className="font-display text-sm font-bold tracking-wider">
          OPEN SOURCE, OBVIOUSLY
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {REPOS.map((repo) => (
            <a
              key={repo.name}
              href={repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border-2 border-ink bg-frost-soft p-3.5 shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-ink text-paper">
                <GithubIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {repo.name}
                </span>
                <span className="block text-[11px] text-muted">
                  {repo.role}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-ink/25 pt-4 text-[11px] text-muted">
          <p>© {new Date().getFullYear()} Last247 — a 24-hour news wire.</p>
          <a
            href="https://nayaksomkar.github.io/portfolio/pages/about.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-colors hover:text-ink"
          >
            @nayaksomkar
          </a>
        </div>
      </div>
    </footer>
  );
}
