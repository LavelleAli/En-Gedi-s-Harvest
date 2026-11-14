// The small spaced-out capitals above a heading ("WHAT TO DO NOW"), or in the masthead's location line.
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";

export type KickerTone = "green" | "yellow" | "red" | "blue" | "masthead";

const TONES: Record<KickerTone, string> = {
  green: "text-green",
  yellow: "text-yellow-ink", // the darker yellow: plain yellow is too light for small text
  red: "text-red",
  blue: "text-blue",
  masthead: "text-mast-accent print:text-black",
};

type KickerProps = {
  tone?: KickerTone; // the section's job color; green by default
  as?: "p" | "span";
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export default function Kicker({ tone = "green", as: Tag = "p", className, children, ...rest }: KickerProps) {
  return (
    <Tag className={cx("font-mono text-xs font-medium tracking-[0.14em] uppercase", TONES[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}
