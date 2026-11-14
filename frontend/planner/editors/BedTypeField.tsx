// Raised or in-ground: two radio buttons dressed as a segmented switch. The chosen one is raised on a
// panel-colored fill; the hidden radio's keyboard focus shows as a ring on its label.
import Field from "@/frontend/components/ui/Field";
import { BED_TYPES, type BedType } from "../model";

const SWITCH = "inline-flex gap-0.5 rounded-md border border-line bg-surface p-[3px]";

const PILL = [
  "inline-flex min-h-[2.375rem] items-center rounded-sm px-3 text-sm font-semibold text-muted",
  "peer-checked:bg-panel peer-checked:text-fg peer-checked:shadow-card",
  "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-focus",
].join(" ");

type BedTypeFieldProps = { bedId: string; value: BedType; onChange: (type: BedType) => void };

export default function BedTypeField({ bedId, value, onChange }: BedTypeFieldProps) {
  return (
    <Field group label="Type">
      <div className={SWITCH} role="radiogroup">
        {(Object.entries(BED_TYPES) as [BedType, string][]).map(([type, label]) => (
          <label key={type} className="relative">
            {/* The radio covers its label invisibly, so the whole pill is the click target. */}
            <input type="radio" className="peer absolute inset-0 m-0 cursor-pointer opacity-0" name={`type-${bedId}`} checked={value === type} onChange={() => onChange(type)} />
            <span className={PILL}>{label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}
