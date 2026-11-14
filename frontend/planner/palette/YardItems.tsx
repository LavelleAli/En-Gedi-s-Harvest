// "In this yard", the panel under the sandbox's right half (beside the editor): everything in the yard, beds first
// then shade sources. Click one to select it (it fills green and its editor opens below), or ⧉ to
// duplicate a shade source next to it. The names flow into as many columns as fit. Beside the editor
// the list fills the panel (which is as tall as the editor) and scrolls inside it, so a long list never
// makes the panel taller; stacked on a phone it scrolls after about 16rem. Not printed.
import { useState } from "react";
import FormMessage from "@/frontend/components/ui/FormMessage";
import { MAX_OBSTACLES, duplicateNextTo, type Garden, type Obstacle } from "../model";
import { PANEL } from "../panelStyle";
import BedIcon from "./BedIcon";
import KindIcon from "./KindIcon";

// The panel: header, then the list taking the rest of the height once it sits beside the editor.
const SECTION = `${PANEL} gap-3 [grid-area:items] @2xl:grid-rows-[auto_1fr]`;
// Holds the list's place. Beside the editor the list is laid over it (absolute), so the list's length
// doesn't count toward the panel's height; it keeps at least 12rem for the list.
const LIST_BOX = "relative @2xl:min-h-48";
// The list: columns at least 12rem wide, rows packed at the top; "yard-list" is a test hook.
const LIST = [
  "yard-list m-0 grid max-h-64 list-none content-start grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-3 gap-y-0.5 overflow-auto p-0",
  "@2xl:absolute @2xl:inset-0 @2xl:max-h-none",
].join(" ");

// The name button: a flat row until pointed at, filled green while selected.
const PICK = [
  "min-h-9 min-w-0 flex-1 justify-start gap-2 border-transparent bg-transparent px-2 py-[0.2rem] text-start text-sm font-semibold shadow-none",
  "hover:border-line-strong hover:bg-surface",
  "aria-pressed:border-green aria-pressed:bg-green-soft aria-pressed:text-green-ink",
].join(" ");

// The ⧉ button: a small square button, also borderless until pointed at.
const DUPLICATE = "min-h-9 min-w-9 flex-none border-transparent bg-transparent p-0 text-md shadow-none hover:border-line-strong hover:bg-surface";

type YardItemsProps = {
  garden: Garden;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddItems: (items: Obstacle[], selectId?: string) => void;
};

export default function YardItems({ garden, selectedId, onSelect, onAddItems }: YardItemsProps) {
  const [message, setMessage] = useState("");
  const items = [...garden.beds, ...garden.obstacles];
  const shadeCount = garden.obstacles.length;

  const duplicate = (item: Obstacle) => {
    if (shadeCount >= MAX_OBSTACLES) return setMessage(`The planner holds up to ${MAX_OBSTACLES} shade sources. Delete one to add more.`);
    const copy = duplicateNextTo(item, garden.yard, items);
    onAddItems([copy], copy.id);
    setMessage(`Added ${copy.name}.`);
  };

  return (
    <section className={SECTION} aria-label="In this yard">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3>In this yard</h3>
        <p className="text-xs text-muted">
          {shadeCount} of {MAX_OBSTACLES} shade sources
        </p>
      </div>
      {items.length === 0 ? (
        <p>Nothing yet. Add a bed or a shade source from Add to the yard.</p>
      ) : (
        <div className={LIST_BOX}>
          <ul className={LIST}>
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-1">
                <button type="button" className={PICK} aria-pressed={item.id === selectedId} onClick={() => onSelect(item.id)}>
                  {item.kind === "bed" ? <BedIcon type={item.type} /> : <KindIcon kind={item.kind} />}
                  <span className="truncate">{item.name}</span>
                </button>
                {item.kind !== "bed" && (
                  <button type="button" className={DUPLICATE} onClick={() => duplicate(item)} aria-label={`Duplicate ${item.name}`} title="Duplicate">
                    ⧉
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <FormMessage kind="ok">{message}</FormMessage>
    </section>
  );
}
