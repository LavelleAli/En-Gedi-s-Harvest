// A thin progress bar (decorative: the count next to it is what screen readers get).
import { cx } from "@/frontend/lib/cx";

type ProgressBarProps = {
  pct: number; // 0–100
  thick?: boolean; // 6px instead of 4px
  inTile?: boolean; // inside a month tile: switches to on-accent colors when the tile is the chosen month
  className?: string;
};

export default function ProgressBar({ pct, thick, inTile, className }: ProgressBarProps) {
  return (
    <span
      className={cx(
        "block overflow-hidden rounded-full bg-line",
        thick ? "h-1.5" : "h-1",
        inTile && "group-has-checked:bg-[color-mix(in_srgb,var(--on-accent)_30%,transparent)]",
        className,
      )}
      aria-hidden="true"
    >
      {/* The fill grows smoothly when an item is ticked. */}
      <span
        className={cx("block h-full rounded-[inherit] bg-green transition-[inline-size] duration-300 ease-out", inTile && "group-has-checked:bg-on-accent")}
        style={{ inlineSize: `${pct}%` }}
      />
    </span>
  );
}
