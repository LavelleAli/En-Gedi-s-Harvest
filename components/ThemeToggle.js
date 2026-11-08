"use client";

import { useEffect, useSyncExternalStore } from "react";
import { THEME_EVENT, THEME_KEY } from "@/lib/theme";

const OPTIONS = [
  {
    value: "system",
    label: "Auto",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  },
];

function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

// Also fires when another tab changes the theme (the "storage" event).
function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  // The static build renders "system"; the browser swaps in the saved choice after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");

  useEffect(() => applyTheme(theme), [theme]);

  const choose = (value) => {
    try {
      if (value === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, value);
    } catch {}
    applyTheme(value);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <div className="theme" role="group" aria-label="Color theme">
      {OPTIONS.map((o) => (
        <button key={o.value} type="button" aria-pressed={theme === o.value} onClick={() => choose(o.value)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {o.icon}
          </svg>
          {o.label}
        </button>
      ))}
    </div>
  );
}
