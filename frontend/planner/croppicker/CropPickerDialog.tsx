"use client";

// "Choose crops": the window the Bed box's crop button opens. Every crop the planner knows, filtered by
// type (All, Vegetables, Fruits, Herbs, Flowers) and by name, in the usual groups (plant this month in your
// zone first). Click a crop to put it in the bed, click again to take it out; a bed holds up to 12.
// The search, filters and count stay pinned at the top while the list scrolls. Fades in and out (500ms).
import { useEffect, useId, useMemo, useState } from "react";
import Button from "@/frontend/components/ui/Button";
import Dialog from "@/frontend/components/ui/Dialog";
import Field from "@/frontend/components/ui/Field";
import { useFadeDialog } from "@/frontend/lib/useFadeDialog";
import type { Crop } from "@/shared/crop";
import { MAX_CROPS, type Bed } from "../model";
import CategoryFilter from "./CategoryFilter";
import CropTile from "./CropTile";
import { categoryCounts, pickerGroups, type Category } from "./cropFilter";

// The pinned top: it bleeds to the window's edges (undoing the Dialog's 1.5rem padding) so the list
// scrolls cleanly underneath it.
const TOP = "sticky -top-6 z-10 -mx-6 -mt-6 grid gap-3 border-b border-line bg-panel-solid px-6 pt-6 pb-4";
// Crops in as many columns as fit, at least 11rem wide.
const TILES = "grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2";

type CropPickerDialogProps = {
  open: boolean;
  bed: Bed;
  crops: Crop[]; // every crop the planner knows: stock plus added
  zone: string;
  month: number;
  onChange: (crops: string[]) => void; // the bed's new crop list
  onClose: () => void;
};

export default function CropPickerDialog({ open, bed, crops, zone, month, onChange, onClose }: CropPickerDialogProps) {
  const titleId = useId();
  const searchId = useId();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const { ref, open: show, close, onCancel, onClick } = useFadeDialog({ onClosed: onClose });
  // The Bed box opens and closes the window through the `open` prop.
  useEffect(() => {
    if (open) show();
    else close();
  }, [open, show, close]);

  const counts = useMemo(() => categoryCounts(crops), [crops]);
  const groups = useMemo(() => pickerGroups(crops, zone, month, category, query), [crops, zone, month, category, query]);
  const full = bed.crops.length >= MAX_CROPS;
  const toggle = (id: string) => onChange(bed.crops.includes(id) ? bed.crops.filter((c) => c !== id) : [...bed.crops, id]);

  return (
    <Dialog dialogRef={ref} onCancel={onCancel} onBackdropClick={onClick} titleId={titleId} wide>
      <div className="grid content-start gap-5">
        <div className={TOP}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id={titleId}>Choose crops for {bed.name}</h2>
            <Button variant="primary" onClick={close}>
              Done
            </Button>
          </div>
          <Field id={searchId} label="Find a crop">
            <input id={searchId} type="search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <CategoryFilter value={category} counts={counts} onChange={setCategory} />
          <p className="text-sm text-muted" role="status">
            {bed.crops.length} of {MAX_CROPS} crops in this bed{full ? ". It's full: take one out to add another." : "."}
          </p>
        </div>
        {groups.length === 0 && <p>No crops match. Try another type or name, or close this and add a crop that isn&apos;t listed.</p>}
        {groups.map(([label, list]) => (
          <section key={label} className="grid gap-2" aria-label={label}>
            <h3 className="text-base">{label}</h3>
            <div className={TILES}>
              {list.map((crop) => {
                const picked = bed.crops.includes(crop.id);
                return <CropTile key={crop.id} crop={crop} picked={picked} disabled={full && !picked} onToggle={() => toggle(crop.id)} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
