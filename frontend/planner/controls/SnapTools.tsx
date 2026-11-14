// Snap to grid: an on/off button and the grid size. Picking a size also turns snapping on.
import { SNAP_STEPS } from "../model";
import { SELECT } from "./selectStyle";

type SnapToolsProps = {
  on: boolean;
  step: number; // grid size in feet
  onChange: (patch: { on?: boolean; step?: number }) => void;
};

export default function SnapTools({ on, step, onChange }: SnapToolsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Snap to grid">
      <button type="button" className={`${SELECT} gap-1.5`} aria-pressed={on} onClick={() => onChange({ on: !on })} title="Hold Ctrl while dragging to do the opposite">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 4v8a6 6 0 0 0 12 0V4M6 8h4M14 8h4" />
        </svg>
        Snap to grid
      </button>
      <label className="sr-only" htmlFor="snap-step">
        Grid size
      </label>
      <select id="snap-step" className="w-auto" value={step} onChange={(e) => onChange({ step: Number(e.target.value), on: true })}>
        {SNAP_STEPS.map((n) => (
          <option key={n} value={n}>
            {n} ft
          </option>
        ))}
      </select>
    </div>
  );
}
