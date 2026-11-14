// The "Type of plant" dropdown: all plants, food (fruits, vegetables, herbs) or a group of flowers,
// each with how many plants it holds.
import { useRef } from "react";
import { useEarlyInput } from "@/frontend/lib/useEarlyInput";
import { ENTRIES, TYPE_COUNTS, TYPE_GROUPS } from "./entries";

export default function TypeFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  // A type picked while the page was still loading counts too.
  const ref = useRef<HTMLSelectElement>(null);
  useEarlyInput(ref, value, onChange);
  return (
    <>
      <label className="sr-only" htmlFor="ptype">
        Type of plant
      </label>
      <select ref={ref} id="ptype" className="w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">All plants ({ENTRIES.length})</option>
        {TYPE_GROUPS.map(({ label, options }) => (
          <optgroup key={label} label={label}>
            {options.map(([v, name]) => (
              <option key={v} value={v}>
                {name} ({TYPE_COUNTS[v]})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </>
  );
}
