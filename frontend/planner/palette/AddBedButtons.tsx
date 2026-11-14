// Two buttons that add a bed to the yard: raised or in-ground. The new bed is selected so its editor opens.
import type { BedType } from "../model";
import BedIcon from "./BedIcon";
import { TILE, TILES } from "./addTileStyle";

export default function AddBedButtons({ onAddBed }: { onAddBed: (type: BedType) => void }) {
  return (
    <div className={TILES} role="group" aria-label="Add a bed">
      <button type="button" className={TILE} aria-label="Add a raised bed" onClick={() => onAddBed("raised")}>
        <BedIcon type="raised" />
        <span>Raised bed</span>
      </button>
      <button type="button" className={TILE} aria-label="Add an in-ground bed" onClick={() => onAddBed("in-ground")}>
        <BedIcon type="in-ground" />
        <span>In-ground bed</span>
      </button>
    </div>
  );
}
