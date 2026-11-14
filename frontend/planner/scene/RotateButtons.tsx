// The turn buttons, floating in the sandbox's bottom-right corner while a bed or shade source is selected:
// ⟲ turns it 15° counterclockwise, ⟳ 15° clockwise, with its angle between them. R and Shift+R do the same
// from the keyboard (GardenScene), and the editor's Rotation box takes an exact angle.
import { ROT_STEP } from "../footprint";
import type { Item } from "../model";
import { SELECT } from "../controls/selectStyle";

// A frosted pill like the camera buttons, so it reads over the 3D scene.
const BAR = "absolute right-3 bottom-3 z-10 inline-flex items-center gap-1 rounded-md border border-line bg-panel p-1 shadow-card backdrop-blur-glass";
// Square icon buttons, borderless until pointed at.
const TURN = `${SELECT} size-9 min-h-0 p-0`;
// The angle, wide enough for "345°" so the buttons don't shift as it changes.
const ANGLE = "min-w-[3.25rem] text-center text-sm font-semibold tabular-nums";

// A curved arrow; `flip` mirrors it for the clockwise button.
function TurnIcon({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={flip ? "-scale-x-100" : undefined}>
      <path d="M4 12a8 8 0 1 0 2.3-5.6" />
      <path d="M4 3v4.5h4.5" />
    </svg>
  );
}

type RotateButtonsProps = { item: Item; onRotate: (id: string, rot: number) => void };

export default function RotateButtons({ item, onRotate }: RotateButtonsProps) {
  const rot = item.rot ?? 0;
  return (
    <div className={BAR} role="group" aria-label={`Turn ${item.name}`}>
      <button type="button" className={TURN} onClick={() => onRotate(item.id, rot - ROT_STEP)} aria-label={`Turn left ${ROT_STEP}°`} title="Turn left (Shift+R)">
        <TurnIcon />
      </button>
      {/* "rotate-angle" is a test hook. */}
      <span className={`rotate-angle ${ANGLE}`} aria-live="polite">
        {Math.round(rot)}°
      </span>
      <button type="button" className={TURN} onClick={() => onRotate(item.id, rot + ROT_STEP)} aria-label={`Turn right ${ROT_STEP}°`} title="Turn right (R)">
        <TurnIcon flip />
      </button>
    </div>
  );
}
