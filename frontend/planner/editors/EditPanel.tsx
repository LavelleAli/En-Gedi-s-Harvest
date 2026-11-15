// The panel under the sandbox's left half (beside In this yard): the yard's size and layout when nothing is selected, or the
// selected bed's or shade source's editor; and Snap to grid at its foot, which applies to both. Not printed.
import type { Crop } from "@/shared/crop";
import type { CropsById } from "../analysis";
import SnapTools from "../controls/SnapTools";
import type { Bed, Garden, Item, Obstacle, Yard } from "../model";
import { PANEL } from "../panelStyle";
import BedEditor from "./BedEditor";
import ObstacleEditor from "./ObstacleEditor";
import YardEditor from "./YardEditor";

type EditPanelProps = {
  garden: Garden;
  selected: Item | null;
  crops: Crop[];
  cropsById: CropsById;
  zone: string;
  month: number;
  onPatch: (id: string, patch: Partial<Bed> | Partial<Obstacle>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onAddNewCrop: (bedId: string) => void;
  onYard: (patch: Partial<Yard>) => void;
  onReset: () => void;
  snap: { on: boolean; step: number };
  onSnap: (patch: { on?: boolean; step?: number }) => void;
};

export default function EditPanel({ garden, selected, crops, cropsById, zone, month, onPatch, onDelete, onSelect, onAddNewCrop, onYard, onReset, snap, onSnap }: EditPanelProps) {
  return (
    <aside className={`${PANEL} [grid-area:edit]`} aria-label="Edit the plan">
      {selected?.kind === "bed" && (
        <BedEditor
          bed={selected}
          crops={crops}
          cropsById={cropsById}
          zone={zone}
          month={month}
          onChange={(patch) => onPatch(selected.id, patch)}
          onDelete={() => onDelete(selected.id)}
          onClose={() => onSelect(null)}
          onAddNewCrop={() => onAddNewCrop(selected.id)}
        />
      )}
      {selected && selected.kind !== "bed" && (
        <ObstacleEditor item={selected} garden={garden} onChange={(patch) => onPatch(selected.id, patch)} onDelete={() => onDelete(selected.id)} onClose={() => onSelect(null)} />
      )}
      {!selected && <YardEditor garden={garden} onYard={onYard} onReset={onReset} />}
      <div className="border-t border-line pt-3">
        <SnapTools on={snap.on} step={snap.step} onChange={onSnap} />
      </div>
    </aside>
  );
}
