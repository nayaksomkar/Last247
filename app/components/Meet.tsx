import type { ComponentType, SVGProps } from "react";
import { Globe, Mail, ArrowUpRight, Sparkles } from "lucide-react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface ChannelItem {
  id: string;
  name: string;
  detail: string;
  label: string;
  href: string;
  icon: IconComponent;
  tint: string;
  glowColor: string;
}

const channels: ChannelItem[] = [
  {
    id: "01",
    name: "GitHub",
    detail: "github.com/labsbyakash",
    label: "Open Source",
    href: "https://github.com/labsbyakash",
    icon: GithubIcon,
    tint: "group-hover:text-foreground",
    glowColor: "group-hover:bg-foreground/5",
  },
  {
    id: "02",
    name: "LinkedIn",
    detail: "linkedin.com/in/labsbyakash",
    label: "Professional",
    href: "https://linkedin.com/in/labsbyakash",
    icon: LinkedinIcon,
    tint: "group-hover:text-blue",
    glowColor: "group-hover:bg-blue/5",
  },
  {
    id: "03",
    name: "Portfolio",
    detail: "devakashsharma.netlify.app",
    label: "Selected Works",
    href: "https://devakashsharma.netlify.app/",
    icon: Globe,
    tint: "group-hover:text-purple",
    glowColor: "group-hover:bg-purple/5",
  },
  {
    id: "04",
    name: "Instagram",
    detail: "@justakash_02",
    label: "Creative Diary",
    href: "https://www.instagram.com/justakash_02/",
    icon: InstagramIcon,
    tint: "group-hover:text-red",
    glowColor: "group-hover:bg-red/5",
  },
  {
    id: "05",
    name: "Direct Email",
    detail: "devakashsharma@outlook.com",
    label: "Priority Inbox",
    href: "mailto:devakashsharma@outlook.com",
    icon: Mail,
    tint: "group-hover:text-amber",
    glowColor: "group-hover:bg-amber/5",
  },
];

export default function MeetSection() {
  return (
    <section id="contact" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        {/* Minimal Editorial Header */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              <span>Available for 2026</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Meet the creator<span className="text-blue">.</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
            </span>
            <span className="text-xs font-medium text-muted">Response time ~ 2h</span>
          </div>
        </div>

        {/* Fancy Interactive List Rows */}
        <div className="divide-y divide-border/70 border-b border-border/70">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.id}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex items-center justify-between py-5 px-3 transition-all duration-300 ${ch.glowColor} rounded-2xl hover:px-5`}
              >
                {/* Left: Index & Identity */}
                <div className="flex items-center gap-5">
                  <span className="font-mono text-xs text-muted/60 transition-colors group-hover:text-muted">
                    {ch.id}
                  </span>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/90 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:border-transparent group-hover:shadow-md">
                    <Icon className={`h-4.5 w-4.5 text-muted transition-colors duration-300 ${ch.tint}`} />
                  </div>

                  <div>
                    <p className={`text-base font-bold tracking-tight text-foreground transition-colors duration-300 ${ch.tint}`}>
                      {ch.name}
                    </p>
                    <p className="hidden text-xs text-muted/80 sm:block">
                      {ch.label}
                    </p>
                  </div>
                </div>

                {/* Right: URL & Kinetic Trigger */}
                <div className="flex items-center gap-4">
                  <span className="hidden font-mono text-xs text-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-foreground md:inline-block">
                    {ch.detail}
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted transition-all duration-300 group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Minimal Bottom Outro */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <span>Feel free to reach out!</span>
          <a
            href="mailto:devakashsharma@outlook.com"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-blue"
          >
            Or mail me directly
          </a>
        </div>
      </div>
    </section>
  );
}