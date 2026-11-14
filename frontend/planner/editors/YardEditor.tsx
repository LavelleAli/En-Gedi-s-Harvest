// The panel when nothing is selected: the yard's size and orientation, and starting over with the
// sample yard. (What's in the yard is listed in Add to the yard, on the left.)
import { useId } from "react";
import Button from "@/frontend/components/ui/Button";
import Field from "@/frontend/components/ui/Field";
import type { Garden, Yard } from "../model";
import AcreageField from "./AcreageField";
import NumberField from "./NumberField";
import { PAIR, STACK } from "./editorStyle";

const FACINGS: [string, number][] = [["North", 0], ["Northeast", 45], ["East", 90], ["Southeast", 135], ["South", 180], ["Southwest", 225], ["West", 270], ["Northwest", 315]];

type YardEditorProps = { garden: Garden; onYard: (patch: Partial<Yard>) => void; onReset: () => void };

export default function YardEditor({ garden, onYard, onReset }: YardEditorProps) {
  const facingId = useId();
  const { yard } = garden;
  // A direction typed elsewhere (not one of the eight) still shows, as degrees.
  const known = FACINGS.some(([, deg]) => deg === yard.north);
  return (
    <div className={STACK}>
      <h3>Yard</h3>
      <AcreageField yard={yard} onYard={onYard} />
      <div className={PAIR}>
        <NumberField label="Width" value={yard.w} min={10} max={400} step={1} onChange={(w) => onYard({ w })} />
        <NumberField label="Depth" value={yard.d} min={10} max={400} step={1} onChange={(d) => onYard({ d })} />
      </div>
      <Field
        id={facingId}
        label="The top of the plan faces"
        hint="Stand in the yard looking toward the top of your plan; pick the direction you face. A phone compass helps."
      >
        <select id={facingId} value={known ? yard.north : ""} onChange={(e) => onYard({ north: Number(e.target.value) })} aria-describedby={`${facingId}-hint`}>
          {!known && <option value="">{yard.north}°</option>}
          {FACINGS.map(([label, deg]) => (
            <option key={label} value={deg}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Button variant="danger-quiet" onClick={() => window.confirm("Replace your plan with the sample yard?") && onReset()}>
        Start over with the sample yard
      </Button>
    </div>
  );
}
