// A number box with a label and its unit ("Width (ft)"). Typed values are kept inside min–max; an empty
// or half-typed box is left alone until it's a number.
import { useId } from "react";
import Field from "@/frontend/components/ui/Field";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
};

export default function NumberField({ label, value, onChange, min, max, step = 0.5, unit = "ft" }: NumberFieldProps) {
  const id = useId();
  return (
    <Field id={id} label={label} note={`(${unit})`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
      />
    </Field>
  );
}
