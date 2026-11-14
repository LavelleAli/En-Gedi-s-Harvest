"use client";

// Light/dark switch pinned to the top-right corner (modeled on the portfolio's toggle): moon, sliding knob, sun.
// Until someone flips it, the site follows the OS setting; flipping it saves an explicit choice.
// The knob's position comes from its `dark:` class (data-theme + prefers-color-scheme), so it is right on first paint;
// JS only keeps aria-checked in sync for screen readers.
import { useSyncExternalStore } from "react";
import { THEME_EVENT, THEME_KEY } from "@/frontend/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function savedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: "light" | "dark" | null) {
  const root = document.documentElement;
  if (theme) root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
}

// The theme actually showing: the saved choice, or the OS setting when nothing is saved.
function readTheme() {
  return savedTheme() || (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");
}

function subscribe(callback: () => void) {
  // Another tab changed the theme: apply it here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== THEME_KEY) return;
    applyTheme(savedTheme());
    callback();
  };
  const media = window.matchMedia(DARK_QUERY);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, callback);
    media.removeEventListener("change", callback);
  };
}

export default function ThemeToggle() {
  // The server can't know the theme; the knob is placed by CSS, so only aria-checked waits for hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light");
  const dark = theme === "dark";

  const toggle = () => {
    const next = dark ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      data-tour="theme"
      onClick={toggle}
      className={[
        // A small pill: moon on the left, sun on the right, and a knob that slides over one of them.
        "noprint absolute z-20 w-[5.5rem] min-h-9 gap-1 rounded-full border-line-strong bg-panel p-0 text-star shadow-card",
        "hover:border-star hover:bg-panel active:transform-none",
        // Focus: the site's standard ring (base styles), with a page-colored gap so it stands off the pill.
        "focus-visible:shadow-[0_0_0_2px_var(--bg)]",
        // Phones: in the masthead's top-right corner, level with the zone row; it scrolls away with the page.
        "end-[max(1rem,env(safe-area-inset-right,0px))] top-[calc(env(safe-area-inset-top,0px)+1.5rem)]",
        // Wider screens: fixed to the window's top-right corner.
        "md:fixed md:end-[max(1.5rem,env(safe-area-inset-right,0px))] md:top-[calc(env(safe-area-inset-top,0px)+1rem)] md:shadow-raised",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" className="size-3.5 flex-none" fill="currentColor" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      {/* The knob covers the current mode's icon: over the sun in light mode, over the moon in dark mode.
          `dark:` follows the site's theme setting, so it's in the right place before the page finishes loading. */}
      <span
        className="size-4 flex-none translate-x-[1.125rem] rounded-full bg-fg transition-transform duration-300 ease-out forced-color-adjust-none forced-colors:bg-[CanvasText] dark:-translate-x-[1.125rem]"
        aria-hidden="true"
      />
      <svg viewBox="0 0 24 24" className="size-3.5 flex-none" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
