// The small line icon for a bed: a raised bed seen from the side (a box with a soil line), or an
// in-ground bed (a row of seedlings in the soil). Drawn on a 24×24 grid in the current text color.
import type { BedType } from "../model";

const PATHS: Record<BedType, string> = {
  raised: "M3 11h18v7H3zM3 14h18M7 11V8M12 11V7M17 11V8",
  "in-ground": "M2 16h20M5 16c1-2 3-2 4 0M10 16c1-2 3-2 4 0M15 16c1-2 3-2 4 0M7 13V9M12 13V8M17 13V9",
};

export default function BedIcon({ type }: { type: BedType }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[type]} />
    </svg>
  );
}
