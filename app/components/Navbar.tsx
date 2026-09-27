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
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="flex h-16 w-full max-w-4xl items-center justify-between rounded-full border border-border/70 bg-card/65 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 dark:bg-card/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] dark:border-border/50 sm:px-6">
        
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Last 24 home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
            24
          </div>

          <div className="leading-none">
            <span className="block text-sm font-bold tracking-tight">
              Last 24
            </span>
          </div>
        </Link>

        {/* Centered Segmented Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { name: "Home", href: "#home" },
            { name: "Latest", href: "#latest" },
            { name: "Stories", href: "#latest" },
            { name: "Meet", href: "#meet" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted transition-all duration-200 hover:bg-foreground/5 hover:text-foreground active:scale-95"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background/50 text-muted transition-all duration-300 hover:border-foreground/40 hover:text-foreground active:scale-90"
            >
              {darkMode ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}