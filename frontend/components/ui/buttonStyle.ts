// The classes behind Button and ButtonLink, so a <button> and a link styled as a button match exactly.
import { cx } from "@/frontend/lib/cx";

//   default        outlined, on any panel
//   primary        filled with the accent: the main action in a form or card
//   danger         filled red: a destructive action that asks first
//   danger-quiet   outlined with red text: a destructive action that's easy to undo
//   on-masthead    see-through, for the frosted masthead
//   quiet          no box until pointed at: a secondary action next to a main one ("End tour")
//   link           looks like a text link, acts like a button
export type ButtonVariant = "default" | "primary" | "danger" | "danger-quiet" | "on-masthead" | "quiet" | "link";

// Every boxed button: shape, size and motion.
const BOX = [
  // Icon and label side by side, at least one touch target tall.
  "inline-flex min-h-tap items-center justify-center gap-2 px-4",
  // Text.
  "font-body text-sm leading-[1.2] font-semibold no-underline",
  // Shape.
  "cursor-pointer rounded-md border shadow-card",
  // Hover colors and the 1px press both ease over 300ms. (The press is a transform, like the base
  // <button> style's, so the two never add up to 2px.)
  "transition-[background-color,border-color,color,box-shadow,transform] active:[transform:translateY(1px)]",
  // Disabled: faded, and no press.
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:[transform:none]",
].join(" ");

// Each variant's colors (and, for "link", its whole look).
const LOOK: Record<ButtonVariant, string> = {
  default: cx(BOX, "border-line-strong bg-panel text-fg hover:border-muted hover:bg-surface"),
  primary: cx(BOX, "border-accent bg-accent text-on-accent hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))]"),
  danger: cx(BOX, "border-red bg-red text-bg hover:bg-[color-mix(in_srgb,var(--red)_88%,var(--fg))]"),
  "danger-quiet": cx(BOX, "justify-self-start border-line-strong bg-panel text-red-ink hover:border-muted hover:bg-surface"),
  "on-masthead": cx(BOX, "border-mast-line bg-transparent text-mast-fg shadow-none hover:border-mast-muted hover:bg-mast-hover"),
  quiet: cx(BOX, "border-transparent bg-transparent text-muted shadow-none hover:bg-surface hover:text-fg"),
  link: [
    // No box: just underlined blue text, the same as a link in a sentence.
    "inline min-h-0 cursor-pointer border-0 bg-transparent p-0 shadow-none hover:bg-transparent active:[transform:none]",
    "font-semibold text-blue underline decoration-1 underline-offset-[0.18em] transition-[text-decoration-thickness] hover:decoration-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
};

export function buttonClass(variant: ButtonVariant = "default", wide = false, extra?: string): string {
  return cx(LOOK[variant], wide && "w-full", extra);
}
