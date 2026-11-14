// The Rotation (°) box: the selected item's turn, clockwise on the plan, in whole degrees. 360 is the same
// as 0 (the plan stores 0–359). The turn buttons in the sandbox and the R key change it 15° at a time.
import NumberField from "./NumberField";

type RotationFieldProps = { value: number | undefined; onChange: (rot: number) => void };

export default function RotationField({ value, onChange }: RotationFieldProps) {
  return <NumberField label="Rotation" unit="°" value={value ?? 0} min={0} max={360} step={1} onChange={onChange} />;
}
