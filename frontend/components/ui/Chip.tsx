// A small button with 6px corners: a filter that toggles on and off, or a quick action.
//   <Chip pressed={zoneOnly} onClick={() => setZoneOnly(!zoneOnly)}>Grows in zone 8a</Chip>   toggle
//   <Chip onClick={() => add(crop)}>+ Tomatillo</Chip>                                          action
// A toggle says whether it's on with aria-pressed, and is filled with the accent while on.
import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/frontend/lib/cx";

const CHIP = [
  // 40px tall (smaller than a button, still easy to tap), with the same 6px corners as buttons.
  "inline-flex min-h-10 items-center rounded-md border px-3.5 shadow-none",
  "text-[0.8125rem] leading-[1.3] font-semibold no-underline cursor-pointer",
  // Off, and its 300ms hover.
  "border-line bg-panel text-fg transition-colors hover:border-line-strong hover:bg-surface",
  // On (aria-pressed="true"): accent fill. Listed after hover, so it wins while pointed at too.
  "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent",
].join(" ");

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  pressed?: boolean; // leave out for an action chip; true/false makes it a toggle
};

export default function Chip({ pressed, className, type = "button", ...rest }: ChipProps) {
  return <button type={type} aria-pressed={pressed} className={cx(CHIP, className)} {...rest} />;
}
