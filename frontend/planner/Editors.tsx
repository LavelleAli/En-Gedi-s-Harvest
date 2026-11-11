"use client";

// The planner's side panel: edit the selected bed or shade source, or the yard itself.
import { useId, useMemo, useState } from "react";
import { BED_TYPES, MAX_SQUARE_ACRES, OBSTACLES, squareYardForAcres, yardAcres, type Bed, type BedType, type Garden, type Obstacle, type Yard } from "@/frontend/planner/model";
import type { CropsById } from "@/frontend/planner/analysis";
import { FLOWER_GROUPS, FLOWER_GROUP_LABEL, isGardenFlower, suitsZone, type Crop } from "@/shared/crop";
import { suggestionsFor } from "@/shared/planting";
import { zoneNumber } from "@/shared/zones";

type NumberFieldProps = { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number; unit?: string };

function NumberField({ label, value, onChange, min, max, step = 0.5, unit = "ft" }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label} <span className="unit">({unit})</span></label>
      <input
        id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
    </div>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="panel-head">
      <h3>{title}</h3>
      <button type="button" className="link-button" onClick={onClose}>Done</button>
    </div>
  );
}

type BedEditorProps = {
  bed: Bed;
  crops: Crop[];
  cropsById: CropsById;
  zone: string;
  month: number;
  onChange: (patch: Partial<Bed>) => void;
  onDelete: () => void;
  onClose: () => void;
  onAddNewCrop: () => void;
};

export function BedEditor({ bed, crops, cropsById, zone, month, onChange, onDelete, onClose, onAddNewCrop }: BedEditorProps) {
  const nameId = useId();
  const pickId = useId();
  // Group the crop list: plant now in this zone, grows in this zone, everything else,
  // then the named roses, peonies and camellias in their own groups so they don't bury the food crops.
  const groups = useMemo(() => {
    const now = suggestionsFor(zone, month, crops).map((s) => s.crop);
    const nowIds = new Set(now.map((c) => c.id));
    const zn = zoneNumber(zone);
    const byName = (a: Crop, b: Crop) => a.name.localeCompare(b.name);
    const food = crops.filter((c) => !isGardenFlower(c) && !nowIds.has(c.id));
    const fits = food.filter((c) => suitsZone(c, zn)).sort(byName);
    const other = food.filter((c) => !suitsZone(c, zn)).sort(byName);
    const list: [string, Crop[]][] = [["Plant this month in zone " + zone, now.sort(byName)], [`Grows in zone ${zone}`, fits], ["Other zones", other]];
    for (const group of FLOWER_GROUPS) {
      list.push([FLOWER_GROUP_LABEL[group], crops.filter((c) => c.flower?.group === group).sort(byName)]);
    }
    return list;
  }, [crops, zone, month]);

  return (
    <div className="stack">
      <PanelHeader title="Bed" onClose={onClose} />
      <div className="field">
        <label htmlFor={nameId}>Name</label>
        <input id={nameId} type="text" maxLength={40} value={bed.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <fieldset className="field">
        <legend>Type</legend>
        <div className="segmented" role="radiogroup">
          {(Object.entries(BED_TYPES) as [BedType, string][]).map(([type, label]) => (
            <label key={type} className="radio-pill">
              <input type="radio" name={`type-${bed.id}`} checked={bed.type === type} onChange={() => onChange({ type, h: type === "raised" ? Math.max(bed.h, 1) : 0 })} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="two-col">
        <NumberField label="Width" value={bed.w} min={1} max={100} onChange={(w) => onChange({ w })} />
        <NumberField label="Length" value={bed.d} min={1} max={100} onChange={(d) => onChange({ d })} />
        {bed.type === "raised" && <NumberField label="Height" value={bed.h} min={0.25} max={4} step={0.25} onChange={(h) => onChange({ h })} />}
      </div>
      <div className="two-col">
        <NumberField label="From left" value={bed.x} min={0} max={600} onChange={(x) => onChange({ x })} />
        <NumberField label="From top" value={bed.z} min={0} max={600} onChange={(z) => onChange({ z })} />
      </div>

      <div className="stack-sm">
        <h4>Crops in this bed</h4>
        {bed.crops.length === 0 && <p className="pmeta">No crops yet. Pick one below.</p>}
        <ul className="crop-list">
          {bed.crops.map((id) => (
            <li key={id}>
              <span>{cropsById[id]?.name || id}</span>
              <button type="button" className="link-button" aria-label={`Remove ${cropsById[id]?.name || id}`} onClick={() => onChange({ crops: bed.crops.filter((c) => c !== id) })}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {bed.crops.length < 12 && (
          <div className="field">
            <label htmlFor={pickId}>Add a crop</label>
            <select id={pickId} value="" onChange={(e) => e.target.value && onChange({ crops: [...bed.crops, e.target.value] })}>
              <option value="">Choose a crop…</option>
              {groups.map(([label, list]) =>
                list.length ? (
                  <optgroup key={label} label={label}>
                    {list.filter((c) => !bed.crops.includes(c.id)).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.origin !== "stock" ? " (added)" : ""}</option>
                    ))}
                  </optgroup>
                ) : null,
              )}
            </select>
          </div>
        )}
        <button type="button" onClick={onAddNewCrop}>Add a crop that isn&apos;t listed…</button>
      </div>
      <button type="button" className="btn-danger-quiet" onClick={onDelete}>Delete this bed</button>
    </div>
  );
}

type ObstacleEditorProps = { item: Obstacle; onChange: (patch: Partial<Obstacle>) => void; onDelete: () => void; onClose: () => void };

export function ObstacleEditor({ item, onChange, onDelete, onClose }: ObstacleEditorProps) {
  const nameId = useId();
  const label = OBSTACLES[item.kind].label;
  return (
    <div className="stack">
      <PanelHeader title={label} onClose={onClose} />
      <div className="field">
        <label htmlFor={nameId}>Name</label>
        <input id={nameId} type="text" maxLength={40} value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="two-col">
        <NumberField label={item.kind === "tree" ? "Canopy width" : "Width"} value={item.w} min={0.5} max={200} onChange={(w) => onChange(item.kind === "tree" ? { w, d: w } : { w })} />
        {item.kind !== "tree" && <NumberField label="Depth" value={item.d} min={0.5} max={200} onChange={(d) => onChange({ d })} />}
        <NumberField label={item.kind === "house" || item.kind === "shed" ? "Wall height" : "Height"} value={item.h} min={1} max={120} onChange={(h) => onChange({ h })} />
      </div>
      <div className="two-col">
        <NumberField label="From left" value={item.x} min={0} max={600} onChange={(x) => onChange({ x })} />
        <NumberField label="From top" value={item.z} min={0} max={600} onChange={(z) => onChange({ z })} />
      </div>
      <button type="button" className="btn-danger-quiet" onClick={onDelete}>Delete this {label.toLowerCase()}</button>
    </div>
  );
}

// Yard size in acres: type a number (applied on Enter or when you leave the field) or tap a preset.
// Either way the yard becomes a square of that area; width and depth can be fine-tuned afterwards.
const ACRE_PRESETS: [string, number][] = [["¼", 0.25], ["½", 0.5], ["¾", 0.75], ["1", 1], ["2", 2], ["3", 3]];
const formatAcres = (a: number) => (a < 0.1 ? a.toFixed(3) : a < 10 ? a.toFixed(2) : a.toFixed(1)).replace(/\.?0+$/, "");

function AcreageField({ yard, onYard }: { yard: Yard; onYard: (patch: Partial<Yard>) => void }) {
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
    <div className="field">
      <label htmlFor={id}>Yard size <span className="unit">(acres)</span></label>
      <input
        id={id} type="number" inputMode="decimal" min="0.01" max={MAX_SQUARE_ACRES.toFixed(2)} step="0.01"
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
      <div className="acre-presets" role="group" aria-label="Common yard sizes">
        {ACRE_PRESETS.map(([label, acres]) => (
          <button key={label} type="button" aria-pressed={Math.abs(current - acres) < 0.01} onClick={() => apply(acres)}>
            {label} acre
          </button>
        ))}
      </div>
      <p className="hint" id={`${id}-hint`} role={error ? "alert" : undefined}>
        {error || `Now ${yard.w} × ${yard.d} ft (${(yard.w * yard.d).toLocaleString("en-US")} sq ft). Picking an acreage makes the yard square; beds and trees outside it move back in.`}
      </p>
    </div>
  );
}

const FACINGS: [string, number][] = [["North", 0], ["Northeast", 45], ["East", 90], ["Southeast", 135], ["South", 180], ["Southwest", 225], ["West", 270], ["Northwest", 315]];

type YardEditorProps = { garden: Garden; onYard: (patch: Partial<Yard>) => void; onSelect: (id: string) => void; onReset: () => void };

export function YardEditor({ garden, onYard, onSelect, onReset }: YardEditorProps) {
  const facingId = useId();
  const { yard } = garden;
  return (
    <div className="stack">
      <h3>Yard</h3>
      <AcreageField yard={yard} onYard={onYard} />
      <div className="two-col">
        <NumberField label="Width" value={yard.w} min={10} max={400} step={1} onChange={(w) => onYard({ w })} />
        <NumberField label="Depth" value={yard.d} min={10} max={400} step={1} onChange={(d) => onYard({ d })} />
      </div>
      <div className="field">
        <label htmlFor={facingId}>The top of the plan faces</label>
        <select id={facingId} value={FACINGS.find(([, deg]) => deg === yard.north) ? yard.north : ""} onChange={(e) => onYard({ north: Number(e.target.value) })} aria-describedby={`${facingId}-hint`}>
          {!FACINGS.some(([, deg]) => deg === yard.north) && <option value="">{yard.north}°</option>}
          {FACINGS.map(([label, deg]) => <option key={label} value={deg}>{label}</option>)}
        </select>
        <p className="hint" id={`${facingId}-hint`}>Stand in the yard looking toward the top of your plan; pick the direction you face. A phone compass helps.</p>
      </div>
      <div className="stack-sm">
        <h4>In this yard</h4>
        <ul className="item-list">
          {[...garden.beds, ...garden.obstacles].map((item) => (
            <li key={item.id}>
              <button type="button" className="link-button" onClick={() => onSelect(item.id)}>
                {item.name}
              </button>
              <span className="pmeta">{item.kind === "bed" ? (item.type === "raised" ? "raised bed" : "in-ground bed") : OBSTACLES[item.kind].label.toLowerCase()} · {item.w} × {item.d} ft</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className="btn-danger-quiet" onClick={() => window.confirm("Replace your plan with the sample yard?") && onReset()}>
        Start over with the sample yard
      </button>
    </div>
  );
}
