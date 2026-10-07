"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);

    const frame = requestAnimationFrame(() => {
      setDarkMode(isDark);
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <nav className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between rounded-full border border-ink/10 bg-frost px-3 soft-shadow backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-2 px-1"
          aria-label="Last247 home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-yellow font-display text-[10px] font-bold text-[#111]">
            24
          </span>
          <span className="font-display text-sm font-bold tracking-wider">
            LAST247
          </span>
        </Link>

        {mounted && (
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 bg-frost-soft transition hover:-translate-y-0.5 hover:bg-yellow"
          >
            {darkMode ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        )}
      </nav>
    </header>
  );
}
