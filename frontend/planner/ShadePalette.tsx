"use client";

// The planner's left panel: shade sources (house, shed, tree, hedge, fence).
//   - Add one with a single click.
//   - Pick any shade source in the yard from the list, or duplicate it with the ⧉ button.
//   - With one selected: repeat it in a row, or line a whole edge of the yard with it.
// The copy math (spacing, edges, the 60-item limit) lives in model.ts so it's unit-tested.
import { useId, useState, type ReactNode } from "react";
import { MAX_OBSTACLES, OBSTACLES, duplicateNextTo, lineEdge, rowOf, type Copies, type Edge, type Garden, type Obstacle, type ObstacleKind } from "@/frontend/planner/model";

// Small icons for each kind, on a 24×24 grid.
const ICONS: Record<ObstacleKind, ReactNode> = {
  // A Dutch Colonial seen from the front: gambrel roof (shallow on top, steep below), the wide
  // upstairs dormer, the peaked porch roof over the door, and a window on each side.
  house: (
    <>
      <path d="M2.5 13.5 4.6 8 8.5 4.5h7L19.4 8l2.1 5.5z" />
      <path d="M6.3 8.2v2.9h11.4V8.2" />
      <path d="M4 13.5v7h16v-7" />
      <path d="M9.3 15.6 12 13.6l2.7 2" />
      <path d="M10.8 20.5v-3.4h2.4v3.4M6.4 16.4v2.2M16.6 16.4v2.2" />
    </>
  ),
  shed: <path d="M5 9h14v11H5z M5 9l7-4 7 4 M9 20v-6h6v6" />,
  tree: <><circle cx="12" cy="10" r="6" /><path d="M12 16v5" /></>,
  hedge: <path d="M3 15c0-3 2-5 4.5-5S12 12 12 15c0-3 2-5 4.5-5S21 12 21 15v3H3z" />,
  fence: <path d="M5 6v14M12 6v14M19 6v14M3 10h18M3 16h18" />,
};

function KindIcon({ kind }: { kind: ObstacleKind }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  );
}

const EDGES: [Edge, string][] = [["top", "Top"], ["bottom", "Bottom"], ["left", "Left"], ["right", "Right"]];

type ShadePaletteProps = {
  garden: Garden;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (kind: ObstacleKind) => void;
  onAddItems: (items: Obstacle[], selectId?: string) => void;
};

export default function ShadePalette({ garden, selectedId, onSelect, onAdd, onAddItems }: ShadePaletteProps) {
  const countId = useId();
  const dirId = useId();
  const gapId = useId();
  const [count, setCount] = useState(5);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [gap, setGap] = useState(0);
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

  const duplicate = (item: Obstacle) => {
    if (full) return setMessage(`The planner holds up to ${MAX_OBSTACLES} shade sources. Delete one to add more.`);
    const copy = duplicateNextTo(item, garden.yard, allItems);
    onAddItems([copy], copy.id);
    setMessage(`Added ${copy.name}.`);
  };

  return (
    <aside className="shade-palette" aria-label="Shade sources">
      <h3>Shade sources</h3>

      <div className="shade-add" role="group" aria-label="Add a shade source">
        {(Object.entries(OBSTACLES) as [ObstacleKind, (typeof OBSTACLES)[ObstacleKind]][]).map(([kind, { label }]) => (
          <button key={kind} type="button" onClick={() => onAdd(kind)} disabled={full}>
            <KindIcon kind={kind} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="stack-sm">
        <h4>In this yard <span className="pmeta">({sources.length} of {MAX_OBSTACLES})</span></h4>
        {sources.length === 0 ? (
          <p className="pmeta">None yet. Add a house, trees or a fence above.</p>
        ) : (
          <ul className="shade-list">
            {sources.map((item) => (
              <li key={item.id}>
                <button type="button" className="shade-pick" aria-pressed={item.id === selectedId} onClick={() => onSelect(item.id)}>
                  <KindIcon kind={item.kind} />
                  <span>{item.name}</span>
                </button>
                <button type="button" className="shade-dup" onClick={() => duplicate(item)} aria-label={`Duplicate ${item.name}`} title="Duplicate">
                  ⧉
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="stack-sm shade-repeat">
          <h4>Repeat {selected.name}</h4>
          <div className="two-col">
            <div className="field">
              <label htmlFor={countId}>Copies</label>
              <input id={countId} type="number" min={1} max={30} value={count} onChange={(e) => setCount(Math.min(30, Math.max(1, Number(e.target.value) || 1)))} />
            </div>
            <div className="field">
              <label htmlFor={gapId}>Gap <span className="unit">(ft)</span></label>
              <input id={gapId} type="number" min={0} max={50} step={0.5} value={gap} onChange={(e) => setGap(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} />
            </div>
          </div>
          <div className="field">
            <label htmlFor={dirId}>Direction</label>
            <select id={dirId} value={direction} onChange={(e) => setDirection(e.target.value as "across" | "down")}>
              <option value="across">Across (to the right)</option>
              <option value="down">Down (toward the bottom)</option>
            </select>
          </div>
          <button type="button" onClick={() => report(selected, rowOf(selected, { count, direction, gap }, garden.yard, allItems), "in a row")}>
            Add a row
          </button>

          <h4>Line a whole edge</h4>
          <p className="hint">
            {selected.kind === "fence" || selected.kind === "hedge"
              ? "Runs along the full edge of the yard."
              : "Fills the edge side by side, using the gap above."}
          </p>
          <div className="edge-buttons" role="group" aria-label={`Line an edge with ${selected.name}`}>
            {EDGES.map(([edge, label]) => (
              <button key={edge} type="button" onClick={() => report(selected, lineEdge(selected, edge, garden.yard, allItems, gap), `along the ${edge} edge`)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="form-message ok" role="status">{message}</p>
    </aside>
  );
}
