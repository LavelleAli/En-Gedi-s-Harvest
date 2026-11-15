// The Setup box in a chicken coop's, fish farm's, beehive's or water tank's editor: one or two number
// boxes, and the numbers that follow from them, updated as you type. The values are saved with the item.
import { useId } from "react";
import FactList from "@/frontend/components/ui/FactList";
import Hint from "@/frontend/components/ui/Hint";
import type { Setup } from "../model";
import type { SetupBox } from "../setup";
import NumberField from "./NumberField";
import { GROUP, PAIR } from "./editorStyle";

type SetupSectionProps = { box: SetupBox; setup: Setup | undefined; onChange: (setup: Setup) => void };

export default function SetupSection({ box, setup, onChange }: SetupSectionProps) {
  const headingId = useId();
  return (
    <section className={`${GROUP} border-t border-line pt-3`} aria-labelledby={headingId}>
      <h4 id={headingId}>Setup</h4>
      <div className={PAIR}>
        {box.fields.map((f) => (
          <NumberField
            key={f.key}
            label={f.label}
            unit={f.unit}
            value={f.value}
            min={f.min}
            max={f.max}
            step={f.step}
            onChange={(v) => onChange({ ...setup, [f.key]: v })}
          />
        ))}
      </div>
      {/* Read out politely as the numbers change, so a screen reader hears the new totals. */}
      <FactList aria-live="polite" className="text-sm">
        {box.lines.map((line) => (
          <div key={line.label} className="contents">
            <dt>{line.label}</dt>
            <dd className={line.warn ? "m-0 font-semibold text-red-ink" : "m-0"}>{line.value}</dd>
          </div>
        ))}
      </FactList>
      <Hint>{box.note}</Hint>
    </section>
  );
}
