// A bed's crops: the list (each with Remove), "Choose crops…" (opens the crop picker window: every crop,
// filtered by type and name; up to 12 per bed), and a button for a crop that isn't listed (opens the Add a
// crop window).
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";
import type { Crop } from "@/shared/crop";
import type { CropsById } from "../analysis";
import CropPickerDialog from "../croppicker/CropPickerDialog";
import type { Bed } from "../model";
import { GROUP, ROW, ROWS } from "./editorStyle";

type BedCropsProps = {
  bed: Bed;
  crops: Crop[];
  cropsById: CropsById;
  zone: string;
  month: number;
  onChange: (crops: string[]) => void;
  onAddNewCrop: () => void;
};

export default function BedCrops({ bed, crops, cropsById, zone, month, onChange, onAddNewCrop }: BedCropsProps) {
  const [picking, setPicking] = useState(false);
  return (
    <div className={GROUP}>
      <h4>Crops in this bed</h4>
      {bed.crops.length === 0 && <p>No crops yet. Choose some below.</p>}
      <ul className={ROWS}>
        {bed.crops.map((id) => (
          <li key={id} className={ROW}>
            <span>{cropsById[id]?.name || id}</span>
            <Button variant="link" aria-label={`Remove ${cropsById[id]?.name || id}`} onClick={() => onChange(bed.crops.filter((c) => c !== id))}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="primary" aria-haspopup="dialog" onClick={() => setPicking(true)}>
        Choose crops…
      </Button>
      <Button onClick={onAddNewCrop}>Add a crop that isn&apos;t listed…</Button>
      <CropPickerDialog open={picking} bed={bed} crops={crops} zone={zone} month={month} onChange={onChange} onClose={() => setPicking(false)} />
    </div>
  );
}
