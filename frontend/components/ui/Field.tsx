// A labelled form field: the label, the control you pass in, and an optional hint under it.
//   <Field id="loc-place" label="Name for this garden" note="(optional)">
//     <input id="loc-place" type="text" … />
//   </Field>
//   <Field id="loc-zone" label="Your USDA hardiness zone" hint="Confirm it by ZIP code…">
//     <select id="loc-zone" aria-describedby="loc-zone-hint" … />      ← the hint's id is "<id>-hint"
//   </Field>
//   <Field group label="Coordinates" note="(optional)">…several controls…</Field>   ← a <fieldset>
// The control is passed in (not built here), so any input, select or group of radios fits.
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";
import Hint from "./Hint";

type FieldProps = {
  label: ReactNode;
  note?: ReactNode; // quieter text after the label: "(optional)", "(acres)"
  hint?: ReactNode; // shown under the control, with the id "<id>-hint"
  className?: string;
  children: ReactNode;
} & (
  | { id: string; group?: false } // one control: the label points at it by id
  | { group: true; id?: undefined } // several controls under one legend
);

const FIELD = "m-0 grid min-w-0 gap-1.5 border-0 p-0";
const LABEL = "p-0 text-sm font-semibold";

export default function Field({ label, note, hint, className, children, ...which }: FieldProps) {
  const caption = (
    <>
      {label}
      {note && <span className="font-normal text-muted"> {note}</span>}
    </>
  );
  if (which.group) {
    return (
      <fieldset className={cx(FIELD, className)}>
        <legend className={LABEL}>{caption}</legend>
        {children}
        {hint && <Hint>{hint}</Hint>}
      </fieldset>
    );
  }
  return (
    <div className={cx(FIELD, className)}>
      <label htmlFor={which.id} className={LABEL}>
        {caption}
      </label>
      {children}
      {hint && <Hint id={`${which.id}-hint`}>{hint}</Hint>}
    </div>
  );
}
