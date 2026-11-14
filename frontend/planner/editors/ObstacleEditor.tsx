// Editing a shade source (house, shed, tree, hedge, fence): its name, size, height, position, turn, and
// deleting it. A tree has one canopy width instead of width and depth.
import { useId } from "react";
import Button from "@/frontend/components/ui/Button";
import Field from "@/frontend/components/ui/Field";
import { OBSTACLES, type Obstacle } from "../model";
import NumberField from "./NumberField";
import PanelHeader from "./PanelHeader";
import RotationField from "./RotationField";
import { PAIR, STACK } from "./editorStyle";

type ObstacleEditorProps = { item: Obstacle; onChange: (patch: Partial<Obstacle>) => void; onDelete: () => void; onClose: () => void };

export default function ObstacleEditor({ item, onChange, onDelete, onClose }: ObstacleEditorProps) {
  const nameId = useId();
  const label = OBSTACLES[item.kind].label;
  const tree = item.kind === "tree";
  const building = item.kind === "house" || item.kind === "shed";
  return (
    <div className={STACK}>
      <PanelHeader title={label} onClose={onClose} />
      <Field id={nameId} label="Name">
        <input id={nameId} type="text" maxLength={40} value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <div className={PAIR}>
        <NumberField label={tree ? "Canopy width" : "Width"} value={item.w} min={0.5} max={200} onChange={(w) => onChange(tree ? { w, d: w } : { w })} />
        {!tree && <NumberField label="Depth" value={item.d} min={0.5} max={200} onChange={(d) => onChange({ d })} />}
        <NumberField label={building ? "Wall height" : "Height"} value={item.h} min={1} max={120} onChange={(h) => onChange({ h })} />
      </div>
      <div className={PAIR}>
        <NumberField label="From left" value={item.x} min={0} max={600} onChange={(x) => onChange({ x })} />
        <NumberField label="From top" value={item.z} min={0} max={600} onChange={(z) => onChange({ z })} />
        <RotationField value={item.rot} onChange={(rot) => onChange({ rot })} />
      </div>
      <Button variant="danger-quiet" onClick={onDelete}>
        Delete this {label.toLowerCase()}
      </Button>
    </div>
  );
}
