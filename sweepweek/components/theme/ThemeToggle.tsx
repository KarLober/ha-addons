"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("sweepweek-theme", theme);
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem("sweepweek-theme") as Theme | null;
  return stored ?? systemTheme();
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("sweepweek-theme-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("sweepweek-theme-change", onStoreChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => null);

  if (theme === null) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={
        theme === "dark" ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"
      }
      onClick={() => {
        applyTheme(next);
        window.dispatchEvent(new Event("sweepweek-theme-change"));
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-chip"
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
            <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
            <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
          </g>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
