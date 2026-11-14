"use client";

// Entering a crop by hand: its name, type, season, sun, spacing, size, water, days to harvest, the
// zones it grows in, planting notes and companions. Checked against the crop schema before saving.
import { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/frontend/components/ui/Button";
import Callout from "@/frontend/components/ui/Callout";
import Field from "@/frontend/components/ui/Field";
import { CropSchema, KINDS, KIND_LABEL, cropId, type Crop, type Kind, type Season } from "@/shared/crop";

// Number boxes side by side: as many 8.5rem columns as fit.
const PAIR = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3";

// Planting windows (weeks from the frost dates) for a hand-entered crop, by season.
const SEASON_WINDOWS: Record<Season, { spring: [number, number]; fall: [number, number] | null }> = {
  cool: { spring: [-4, 2], fall: [-8, -4] },
  warm: { spring: [1, 6], fall: null },
  perennial: { spring: [-4, 2], fall: [-6, -2] },
};

type ManualFields = {
  name: string; kind: Kind; season: Season; how: string; friends: string; foes: string;
  sunHours: number; spacingIn: number; heightFt: number; waterIn: number; daysMax: number; zoneMin: number; zoneMax: number;
};
type NumberKey = "sunHours" | "spacingIn" | "heightFt" | "waterIn" | "daysMax" | "zoneMin" | "zoneMax";

export default function ManualForm({ initialName, onSave }: { initialName: string; onSave: (crop: Crop) => void }) {
  const [f, setF] = useState<ManualFields>({ name: initialName, kind: "veg", season: "warm", sunHours: 6, spacingIn: 12, heightFt: 2, waterIn: 1, daysMax: 70, zoneMin: 3, zoneMax: 11, how: "", friends: "", foes: "" });
  const [errors, setErrors] = useState<string[]>([]);
  // Number inputs store numbers; everything else stores the text (select values are always valid options).
  const set = (k: keyof ManualFields) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
    const result = CropSchema.safeParse({
      id: cropId(f.name) || "crop",
      name: f.name,
      kind: f.kind,
      life: f.season === "perennial" ? "perennial" : "annual",
      habit: f.heightFt >= 4 ? "tall" : f.heightFt < 0.7 ? "groundcover" : "bush",
      zones: [Math.min(f.zoneMin, f.zoneMax), Math.max(f.zoneMin, f.zoneMax)],
      season: f.season,
      sunHours: f.sunHours,
      shadeOk: f.sunHours <= 5,
      waterIn: f.waterIn,
      spacingIn: f.spacingIn,
      heightFt: f.heightFt,
      days: f.daysMax > 0 ? [Math.max(1, Math.round(f.daysMax * 0.8)), f.daysMax] : null,
      method: "transplant",
      depthIn: 0.25,
      ...SEASON_WINDOWS[f.season],
      how: f.how || "Plant at the spacing shown and keep evenly watered until established.",
      bed: "either",
      friends: list(f.friends),
      foes: list(f.foes),
      origin: "custom",
    });
    if (!result.success) {
      setErrors(result.error.issues.map((i) => `${i.path.join(".") || "Form"}: ${i.message}`));
      return;
    }
    setErrors([]);
    onSave(result.data);
  };
  const num = (k: NumberKey, label: string, min: number, max: number, step = 1) => (
    <Field id={`m-${k}`} label={label}>
      <input id={`m-${k}`} type="number" inputMode="decimal" required min={min} max={max} step={step} value={f[k]} onChange={set(k)} />
    </Field>
  );
  return (
    <form className="grid content-start gap-4" onSubmit={submit}>
      <Field id="m-name" label="Plant name">
        <input id="m-name" type="text" required minLength={2} maxLength={60} value={f.name} onChange={set("name")} />
      </Field>
      <div className={PAIR}>
        <Field id="m-kind" label="Type">
          <select id="m-kind" value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select>
        </Field>
        <Field id="m-season" label="Season">
          <select id="m-season" value={f.season} onChange={set("season")}>
            <option value="cool">Cool season (spring and fall)</option>
            <option value="warm">Warm season (after frost)</option>
            <option value="perennial">Perennial</option>
          </select>
        </Field>
        {num("sunHours", "Sun it needs (hours)", 0, 14, 0.5)}
        {num("spacingIn", "Spacing (inches)", 1, 480)}
        {num("heightFt", "Height (feet)", 0.1, 80, 0.1)}
        {num("waterIn", "Water (inches a week)", 0, 4, 0.25)}
        {num("daysMax", "Days to harvest (0 if a year+)", 0, 400)}
        {num("zoneMin", "Coldest zone", 1, 13)}
        {num("zoneMax", "Warmest zone", 1, 13)}
      </div>
      <Field id="m-how" label="Planting notes" note="(optional)">
        <textarea id="m-how" rows={3} maxLength={500} value={f.how} onChange={set("how")} />
      </Field>
      <div className={PAIR}>
        <Field id="m-friends" label="Good companions" note="(comma-separated)">
          <input id="m-friends" type="text" maxLength={300} value={f.friends} onChange={set("friends")} />
        </Field>
        <Field id="m-foes" label="Keep apart from" note="(comma-separated)">
          <input id="m-foes" type="text" maxLength={300} value={f.foes} onChange={set("foes")} />
        </Field>
      </div>
      {errors.length > 0 && (
        <Callout title="Check these fields" role="alert">
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Callout>
      )}
      <div>
        <Button variant="primary" type="submit">
          Save crop
        </Button>
      </div>
    </form>
  );
}
