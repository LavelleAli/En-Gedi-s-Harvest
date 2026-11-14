// The "Add to the yard" buttons (beds and shade sources): compact rows, icon beside label, flat until
// pointed at. As many columns as fit the panel.
import { SELECT } from "../controls/selectStyle";

export const TILES = "grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-1";
export const TILE = `${SELECT} min-h-10 w-full justify-start gap-2 px-2 text-sm`;
