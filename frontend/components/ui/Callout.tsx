// A tinted box with a bold title, for something the reader shouldn't miss: a warning, a tip, a notice.
//   <Callout tone="yellow" title="Keep the harvest steady"><p>Sow a short row…</p></Callout>
// Red (the default) is for safety. A thick bar down the start edge marks it, so it doesn't rely on color.
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";
import type { Tone } from "./tone";

// Each tone: the fill, a faint border, the thick start bar, and the title's color.
const TONES: Record<Tone, { box: string; title: string }> = {
  plain: { box: "bg-surface border-line border-s-muted", title: "text-fg" },
  green: { box: "bg-green-soft border-[color-mix(in_srgb,var(--green)_22%,transparent)] border-s-green", title: "text-green-ink" },
  yellow: { box: "bg-yellow-soft border-[color-mix(in_srgb,var(--yellow)_22%,transparent)] border-s-yellow", title: "text-yellow-ink" },
  red: { box: "bg-red-soft border-[color-mix(in_srgb,var(--red)_22%,transparent)] border-s-red", title: "text-red-ink" },
  blue: { box: "bg-blue-soft border-[color-mix(in_srgb,var(--blue)_22%,transparent)] border-s-blue", title: "text-blue-ink" },
};

type CalloutProps = {
  tone?: Tone;
  title: ReactNode;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">;

export default function Callout({ tone = "red", title, children, className, ...rest }: CalloutProps) {
  const t = TONES[tone];
  return (
    <div className={cx("grid gap-1 rounded-md border border-s-4 px-6 py-4", t.box, className)} {...rest}>
      <strong className={cx("font-display font-bold", t.title)}>{title}</strong>
      {children}
    </div>
  );
}
