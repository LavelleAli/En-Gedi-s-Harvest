// The sidebar's line icons: drawn on a 24×24 grid in the current text color, hidden from screen
// readers (each item's text label names it).
import type { ReactNode } from "react";

export type IconName = "account" | "profile" | "tools" | "shop";

const PATHS: Record<IconName, ReactNode> = {
  account: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  profile: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="11" r="2.5" /><path d="M5.5 17c.8-1.8 2-2.7 3.5-2.7s2.7.9 3.5 2.7M14.5 10h4M14.5 14h4" /></>,
  tools: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  shop: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
};

export default function SidebarIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
