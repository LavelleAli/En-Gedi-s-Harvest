// One month in the year calendar: a radio button dressed as a tile, with the month's name, a "Now"
// badge on the current month, and how much of its checklist is done. The chosen month is filled with
// the accent; "group" lets everything inside switch to on-accent colors with it.
import { cx } from "@/frontend/lib/cx";
import ProgressBar from "./ProgressBar";
import type { Progress } from "./progress";
import { percent } from "./progress";

const TILE = [
  // Layout: name row at the top, count and bar at the bottom.
  "group relative grid min-h-[4.75rem] content-between gap-2 p-3",
  // Glass tile.
  "cursor-pointer rounded-md border border-line bg-panel backdrop-blur-glass select-none",
  // Hover (300ms): a stronger border and a lift, except on the chosen month.
  "transition-[border-color,box-shadow,background-color] hover:shadow-card hover:[&:not(:has(:checked))]:border-line-strong",
  // The chosen month: accent fill.
  "has-checked:border-accent has-checked:bg-accent has-checked:text-on-accent has-checked:shadow-card",
  // The radio inside is hidden, so the tile shows its keyboard focus ring.
  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
  // Windows High Contrast: fills vanish, so the chosen month uses the system highlight.
  "forced-colors:has-checked:[forced-color-adjust:none] forced-colors:has-checked:border-[Highlight] forced-colors:has-checked:bg-[Highlight] forced-colors:has-checked:text-[HighlightText]",
].join(" ");

type MonthTileProps = {
  name: string; // "March"
  progress: Progress;
  chosen: boolean;
  now: boolean; // the current month
  onPick: () => void;
};

export default function MonthTile({ name, progress, chosen, now, onPick }: MonthTileProps) {
  const complete = progress.total > 0 && progress.done === progress.total;
  return (
    <label className={TILE}>
      <input type="radio" name="month" className="sr-only" checked={chosen} onChange={onPick} />
      {/* One clean name for screen readers, e.g. "March, 3 of 10 done, this month"; the rest is hidden from them. */}
      <span className="sr-only">{`${name}, ${progress.done} of ${progress.total} done${now ? ", this month" : ""}`}</span>
      <span className="flex flex-wrap items-center justify-between gap-1" aria-hidden="true">
        <span className="font-display text-lg font-bold tracking-[-0.01em]">{name.slice(0, 3)}</span>
        {now && (
          <span className="rounded-full bg-accent px-1.5 py-px font-mono text-[0.625rem] font-medium tracking-[0.1em] text-on-accent uppercase group-has-checked:bg-on-accent group-has-checked:text-accent">
            Now
          </span>
        )}
      </span>
      <span className={cx("font-mono text-xs group-has-checked:text-on-accent", complete ? "font-medium text-green-ink" : "text-muted")} aria-hidden="true">
        {complete ? "✓ Done" : `${progress.done}/${progress.total}`}
      </span>
      <ProgressBar pct={percent(progress)} inTile />
    </label>
  );
}
