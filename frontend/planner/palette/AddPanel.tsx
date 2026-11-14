"use client";

// "Add to the yard", the panel over the sandbox's left half (beside Sun and shade):
//   - Add a raised or in-ground bed, or a shade source (house, shed, tree, hedge, fence), with one click.
//   - With one selected: repeat it in a row, or line a whole edge of the yard with it.
// The list of what's in the yard is its own panel under the sandbox (YardItems.tsx).
// The copy math (spacing, edges, the 60-item limit) lives in model.ts so it's unit-tested.
import { useState } from "react";
import FormMessage from "@/frontend/components/ui/FormMessage";
import { MAX_OBSTACLES, OBSTACLES, lineEdge, rowOf, type BedType, type Copies, type Garden, type Obstacle, type ObstacleKind } from "../model";
import { PANEL, SIDE_PANEL } from "../panelStyle";
import AddBedButtons from "./AddBedButtons";
import AddShadeButtons from "./AddShadeButtons";
import RepeatTools, { type RowSettings } from "./RepeatTools";

const GROUP = "grid content-start gap-2";

type AddPanelProps = {
  garden: Garden;
  selectedId: string | null;
  onAddBed: (type: BedType) => void;
  onAdd: (kind: ObstacleKind) => void;
  onAddItems: (items: Obstacle[], selectId?: string) => void;
};

export default function AddPanel({ garden, selectedId, onAddBed, onAdd, onAddItems }: AddPanelProps) {
  // The row settings stay put while you select different sources.
  const [row, setRow] = useState<RowSettings>({ count: 5, gap: 0, direction: "across" });
  const [message, setMessage] = useState("");

  const sources = garden.obstacles;
  const allItems = [...garden.beds, ...garden.obstacles];
  const selected = sources.find((o) => o.id === selectedId) || null;
  const full = sources.length >= MAX_OBSTACLES;
  const noun = (item: Obstacle, n: number) => `${n} ${OBSTACLES[item.kind].label.toLowerCase()}${n === 1 ? "" : "s"}`;

  // Report what happened, including anything left out because of the yard's edge or the limit.
  const report = (item: Obstacle, { added, skipped }: Copies, where: string) => {
    if (added.length) onAddItems(added);
    const left = skipped ? ` ${skipped} didn't fit (the yard's edge or the ${MAX_OBSTACLES}-item limit).` : "";
    setMessage(added.length ? `Added ${noun(item, added.length)} ${where}.${left}` : `Nothing added: there's no room ${where}.${left}`);
  };

  return (
    <aside className={`${PANEL} ${SIDE_PANEL} [grid-area:add]`} aria-label="Add to the yard" data-tour="planner-tools">
      <h3>Add to the yard</h3>
      <div className={GROUP}>
        <h4>Beds</h4>
        <AddBedButtons onAddBed={onAddBed} />
      </div>
      <div className={GROUP}>
        <h4>Shade sources</h4>
        <AddShadeButtons onAdd={onAdd} full={full} />
      </div>
      {selected && (
        <RepeatTools
          selected={selected}
          row={row}
          onRow={(patch) => setRow({ ...row, ...patch })}
          onAddRow={() => report(selected, rowOf(selected, row, garden.yard, allItems), "in a row")}
          onLineEdge={(edge) => report(selected, lineEdge(selected, edge, garden.yard, allItems, row.gap), `along the ${edge} edge`)}
        />
      )}
      <FormMessage kind="ok">{message}</FormMessage>
    </aside>
  );
}
