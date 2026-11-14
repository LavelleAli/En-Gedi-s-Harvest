// One tile per kind of shade source; clicking one adds it to the yard. Disabled once the yard is full.
import { OBSTACLES, type ObstacleKind } from "../model";
import KindIcon from "./KindIcon";
import { TILE, TILES } from "./addTileStyle";

export default function AddShadeButtons({ onAdd, full }: { onAdd: (kind: ObstacleKind) => void; full: boolean }) {
  return (
    <div className={TILES} role="group" aria-label="Add a shade source">
      {(Object.entries(OBSTACLES) as [ObstacleKind, (typeof OBSTACLES)[ObstacleKind]][]).map(([kind, { label }]) => (
        <button key={kind} type="button" className={TILE} onClick={() => onAdd(kind)} disabled={full}>
          <KindIcon kind={kind} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
