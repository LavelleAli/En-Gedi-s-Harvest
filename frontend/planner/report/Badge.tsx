// A small tinted label in the garden report: a bed's light ("Full sun · 7.2 h") or how well a crop's
// sun needs fit the bed ("Good light"). Its words carry the meaning; the color backs them up.
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";

export type BadgeTone = "green" | "yellow" | "red" | "blue" | "quiet";

const TONES: Record<BadgeTone, string> = {
  green: "bg-green-soft text-green-ink",
  yellow: "bg-yellow-soft text-yellow-ink",
  red: "bg-red-soft text-red-ink",
  blue: "bg-blue-soft text-blue-ink",
  quiet: "border border-line bg-surface text-muted",
};

export default function Badge({ tone, title, children }: { tone: BadgeTone; title?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap", TONES[tone])} title={title}>
      {children}
    </span>
  );
}
