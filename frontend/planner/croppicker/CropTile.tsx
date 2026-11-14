// One crop in the crop picker: a toggle button with its name and type. Pressed (aria-pressed) means it's
// in the bed: filled with the accent and marked with a check, so it isn't shown by color alone.
import { KIND_LABEL, type Crop } from "@/shared/crop";

const TILE = [
  // A flat card-like button, left-aligned, name over type.
  "group w-full min-h-14 justify-start gap-2.5 rounded-md border border-line bg-panel px-3 py-2 text-start shadow-none",
  // Hover (300ms, from the base button) and the picked state, which wins while pointed at too.
  "hover:border-line-strong hover:bg-surface",
  "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent",
].join(" ");

// The round check: an empty ring until picked, then a filled tick.
const CHECK = "grid size-5 flex-none place-items-center rounded-full border border-line-strong group-aria-pressed:border-on-accent";

type CropTileProps = { crop: Crop; picked: boolean; disabled: boolean; onToggle: () => void };

export default function CropTile({ crop, picked, disabled, onToggle }: CropTileProps) {
  return (
    <button type="button" className={TILE} aria-pressed={picked} disabled={disabled} onClick={onToggle}>
      <span className={CHECK} aria-hidden="true">
        {picked && (
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        )}
      </span>
      <span className="grid min-w-0">
        <span className="truncate">{crop.name}</span>
        <span className="text-xs font-normal text-muted group-aria-pressed:text-on-accent">
          {KIND_LABEL[crop.kind]}
          {crop.origin !== "stock" ? " · added" : ""}
        </span>
      </span>
    </button>
  );
}
