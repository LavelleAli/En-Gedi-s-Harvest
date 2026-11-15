// One tile per kind in a group of yard items (shade sources, animals or water); clicking one adds it to
// the yard. Disabled once the yard holds 60 non-bed items.
import { OBSTACLES, type ObstacleGroup, type ObstacleKind } from "../model";
import KindIcon from "./KindIcon";
import { TILE, TILES } from "./addTileStyle";

type AddKindButtonsProps = {
  group: ObstacleGroup;
  label: string; // the group's name for screen readers, e.g. "Add a shade source"
  onAdd: (kind: ObstacleKind) => void;
  full: boolean;
};

export default function AddKindButtons({ group, label, onAdd, full }: AddKindButtonsProps) {
  const kinds = (Object.keys(OBSTACLES) as ObstacleKind[]).filter((k) => OBSTACLES[k].group === group);
  return (
    <div className={TILES} role="group" aria-label={label}>
      {kinds.map((kind) => (
        <button key={kind} type="button" className={TILE} onClick={() => onAdd(kind)} disabled={full}>
          <KindIcon kind={kind} />
          <span>{OBSTACLES[kind].label}</span>
        </button>
      ))}
    </div>
  );
}
