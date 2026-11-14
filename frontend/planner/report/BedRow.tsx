// One row of the Beds list: a button with the bed's name, kind and size, its crops, its light, and how many
// things need a look. Every row is the same height (each line is cut to one line). Opens the bed window.
import type { Bed } from "../model";
import Badge from "./Badge";
import { LIGHT_TONE, type BedFacts } from "./bedFacts";

const ROW = [
  // A full-width flat button: text on the left, badges and an arrow on the right.
  "grid w-full min-h-[4.5rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-md border-transparent bg-transparent px-3 py-2 text-start shadow-none",
  // Pointed at: a light fill and hairline (300ms, from the base button style).
  "hover:border-line-strong hover:bg-surface",
].join(" ");

// One line of text, cut with "…" when it's too long.
const LINE = "truncate";

type BedRowProps = { bed: Bed; facts: BedFacts; onOpen: () => void };

export default function BedRow({ bed, facts, onOpen }: BedRowProps) {
  const crops = facts.crops.length ? facts.crops.map((c) => c.name).join(", ") : "No crops yet";
  return (
    // "bed-row" is a test hook. aria-haspopup tells screen readers the button opens a window.
    <button type="button" className={`bed-row ${ROW}`} aria-haspopup="dialog" onClick={onOpen}>
      <span className="grid min-w-0 gap-0.5">
        <span className={`${LINE} text-md font-bold`}>{bed.name}</span>
        <span className={`${LINE} text-sm font-normal text-muted`}>
          {facts.kind} · {facts.size}
        </span>
        <span className={`${LINE} text-sm font-normal`}>{crops}</span>
      </span>
      <span className="flex items-center gap-2">
        {/* Stacked, so they fit beside the text on a phone too. */}
        <span className="flex flex-col items-end gap-1.5">
          {facts.problems > 0 && <Badge tone="red">{facts.problems} to check</Badge>}
          <Badge tone={LIGHT_TONE[facts.light.id]}>
            {facts.light.label} · {facts.hours.toFixed(1)} h
          </Badge>
        </span>
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-muted">
          <path d="M6 3.5l4.5 4.5L6 12.5" />
        </svg>
      </span>
    </button>
  );
}
