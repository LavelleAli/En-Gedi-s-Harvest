// Editing a bed: its name, raised or in-ground, size, position and turn, its crops, and deleting it.
import { useId } from "react";
import Button from "@/frontend/components/ui/Button";
import Field from "@/frontend/components/ui/Field";
import type { Crop } from "@/shared/crop";
import type { CropsById } from "../analysis";
import type { Bed } from "../model";
import BedCrops from "./BedCrops";
import BedTypeField from "./BedTypeField";
import NumberField from "./NumberField";
import PanelHeader from "./PanelHeader";
import RotationField from "./RotationField";
import { PAIR, STACK } from "./editorStyle";

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

export default function BedEditor({ bed, crops, cropsById, zone, month, onChange, onDelete, onClose, onAddNewCrop }: BedEditorProps) {
  const nameId = useId();
  return (
    <div className={STACK}>
      <PanelHeader title="Bed" onClose={onClose} />
      <Field id={nameId} label="Name">
        <input id={nameId} type="text" maxLength={40} value={bed.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      {/* An in-ground bed has no height; a raised one is at least a foot tall. */}
      <BedTypeField bedId={bed.id} value={bed.type} onChange={(type) => onChange({ type, h: type === "raised" ? Math.max(bed.h, 1) : 0 })} />
      <div className={PAIR}>
        <NumberField label="Width" value={bed.w} min={1} max={100} onChange={(w) => onChange({ w })} />
        <NumberField label="Length" value={bed.d} min={1} max={100} onChange={(d) => onChange({ d })} />
        {bed.type === "raised" && <NumberField label="Height" value={bed.h} min={0.25} max={4} step={0.25} onChange={(h) => onChange({ h })} />}
      </div>
      <div className={PAIR}>
        <NumberField label="From left" value={bed.x} min={0} max={600} onChange={(x) => onChange({ x })} />
        <NumberField label="From top" value={bed.z} min={0} max={600} onChange={(z) => onChange({ z })} />
        <RotationField value={bed.rot} onChange={(rot) => onChange({ rot })} />
      </div>
      <BedCrops bed={bed} crops={crops} cropsById={cropsById} zone={zone} month={month} onChange={(list) => onChange({ crops: list })} onAddNewCrop={onAddNewCrop} />
      <Button variant="danger-quiet" onClick={onDelete}>
        Delete this bed
      </Button>
    </div>
  );
}
