// Yard size in acres: type a number (applied on Enter or when you leave the box) or tap a preset.
// Either way the yard becomes a square of that area; width and depth can be fine-tuned afterwards.
import { useId, useState } from "react";
import Field from "@/frontend/components/ui/Field";
import Hint from "@/frontend/components/ui/Hint";
import { SELECT_SMALL } from "../controls/selectStyle";
import { MAX_SQUARE_ACRES, squareYardForAcres, yardAcres, type Yard } from "../model";

const PRESETS: [string, number][] = [["¼", 0.25], ["½", 0.5], ["¾", 0.75], ["1", 1], ["2", 2], ["3", 3]];
const formatAcres = (a: number) => (a < 0.1 ? a.toFixed(3) : a < 10 ? a.toFixed(2) : a.toFixed(1)).replace(/\.?0+$/, "");

export default function AcreageField({ yard, onYard }: { yard: Yard; onYard: (patch: Partial<Yard>) => void }) {
  const id = useId();
  const current = yardAcres(yard);
  const [draft, setDraft] = useState<string | null>(null); // text being typed; null shows the yard's current acreage
  const [error, setError] = useState("");

  const apply = (acres: number) => {
    setDraft(null);
    if (!Number.isFinite(acres) || acres <= 0) return setError("Enter an acreage above 0, like 0.25 or 1.");
    if (acres > MAX_SQUARE_ACRES) setError(`The planner goes up to about ${MAX_SQUARE_ACRES.toFixed(2)} acres (400 × 400 ft), so it was set to that.`);
    else setError("");
    onYard(squareYardForAcres(acres));
  };

  return (
    <Field id={id} label="Yard size" note="(acres)">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0.01"
        max={MAX_SQUARE_ACRES.toFixed(2)}
        step="0.01"
        value={draft ?? formatAcres(current)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== null && apply(Number(draft))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply(Number(e.currentTarget.value));
          }
          if (e.key === "Escape") setDraft(null);
        }}
        aria-describedby={`${id}-hint`}
      />
      <div className="flex flex-wrap gap-1" role="group" aria-label="Common yard sizes">
        {PRESETS.map(([label, acres]) => (
          <button key={label} type="button" className={SELECT_SMALL} aria-pressed={Math.abs(current - acres) < 0.01} onClick={() => apply(acres)}>
            {label} acre
          </button>
        ))}
      </div>
      {/* The hint turns into an alert when the acreage can't be used. */}
      <Hint id={`${id}-hint`} role={error ? "alert" : undefined}>
        {error ||
          `Now ${yard.w} × ${yard.d} ft (${(yard.w * yard.d).toLocaleString("en-US")} sq ft). Picking an acreage makes the yard square; beds and trees outside it move back in.`}
      </Hint>
    </Field>
  );
}
