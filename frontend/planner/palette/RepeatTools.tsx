// With a shade source selected: repeat it in a row (how many, the gap, which way), or line a whole edge
// of the yard with it.
import { useId } from "react";
import Button from "@/frontend/components/ui/Button";
import Field from "@/frontend/components/ui/Field";
import Hint from "@/frontend/components/ui/Hint";
import { SELECT } from "../controls/selectStyle";
import type { Edge, Obstacle } from "../model";

const EDGES: [Edge, string][] = [["top", "Top"], ["bottom", "Bottom"], ["left", "Left"], ["right", "Right"]];

export type RowSettings = { count: number; gap: number; direction: "across" | "down" };

type RepeatToolsProps = {
  selected: Obstacle;
  row: RowSettings;
  onRow: (patch: Partial<RowSettings>) => void;
  onAddRow: () => void;
  onLineEdge: (edge: Edge) => void;
};

export default function RepeatTools({ selected, row, onRow, onAddRow, onLineEdge }: RepeatToolsProps) {
  const countId = useId();
  const gapId = useId();
  const dirId = useId();
  const linear = selected.kind === "fence" || selected.kind === "hedge";
  return (
    <div className="grid content-start gap-2 border-t border-line pt-3">
      <h4>Repeat {selected.name}</h4>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3">
        <Field id={countId} label="Copies">
          <input id={countId} type="number" min={1} max={30} value={row.count} onChange={(e) => onRow({ count: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })} />
        </Field>
        <Field id={gapId} label="Gap" note="(ft)">
          <input id={gapId} type="number" min={0} max={50} step={0.5} value={row.gap} onChange={(e) => onRow({ gap: Math.min(50, Math.max(0, Number(e.target.value) || 0)) })} />
        </Field>
      </div>
      <Field id={dirId} label="Direction">
        <select id={dirId} value={row.direction} onChange={(e) => onRow({ direction: e.target.value as RowSettings["direction"] })}>
          <option value="across">Across (to the right)</option>
          <option value="down">Down (toward the bottom)</option>
        </select>
      </Field>
      <Button onClick={onAddRow} className="justify-self-start">
        Add a row
      </Button>

      <h4>Line a whole edge</h4>
      <Hint>{linear ? "Runs along the full edge of the yard." : "Fills the edge side by side, using the gap above."}</Hint>
      <div className="grid grid-cols-2 gap-1" role="group" aria-label={`Line an edge with ${selected.name}`}>
        {EDGES.map(([edge, label]) => (
          <button key={edge} type="button" className={`${SELECT} min-h-9 text-sm`} onClick={() => onLineEdge(edge)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
