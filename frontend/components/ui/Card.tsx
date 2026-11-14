// A frosted-glass card: the panel that holds a form, a list or a block of facts.
//   <Card className="grid gap-4">…</Card>   <Card as="form" onSubmit={save}>…</Card>   <Card danger>…</Card>
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cx } from "@/frontend/lib/cx";

const CARD = [
  // Glass: see-through panel, blurred behind, a hairline border and a soft shadow.
  "rounded-lg border bg-panel shadow-card backdrop-blur-glass",
  // Room inside (16px top and bottom, 24px at the sides); min-w-0 lets it shrink inside a grid or flex row.
  "min-w-0 px-6 py-4",
  // Printing never splits a card across two pages.
  "print:break-inside-avoid",
].join(" ");

type CardProps<T extends ElementType> = {
  as?: T; // the element to render: div (default), section, article, form…
  danger?: boolean; // a reddish border, for actions that can't be undone
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export default function Card<T extends ElementType = "div">({ as, danger, className, ...rest }: CardProps<T>) {
  const Tag: ElementType = as || "div";
  return <Tag className={cx(CARD, danger ? "border-[color-mix(in_srgb,var(--red)_35%,var(--line))]" : "border-line", className)} {...rest} />;
}
