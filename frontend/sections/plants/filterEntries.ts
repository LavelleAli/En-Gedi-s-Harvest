// Which entries the list shows, given the search text and the filters. Every filter narrows the others:
// e.g. herbs, that grow in my zone, that I've starred, that mention "mint".
import { SYM } from "@/frontend/data/art";
import { suitsZone } from "@/shared/crop";
import { zoneNumber } from "@/shared/zones";
import type { Entry } from "./entries";

export type Filters = {
  q: string; // search text
  type: string; // a TYPE_GROUPS value, or "all"
  zoneOnly: boolean; // only plants that grow in the reader's zone
  starOnly: boolean; // only starred plants
};

export function filterEntries(entries: Entry[], { q, type, zoneOnly, starOnly }: Filters, stars: Record<string, true>, zone: string): Entry[] {
  const needle = q.trim().toLowerCase();
  const zoneNum = zoneNumber(zone);
  return entries.filter(({ crop, book, title }) => {
    if (starOnly && !stars[title]) return false;
    if (zoneOnly && !suitsZone(crop, zoneNum)) return false;
    if (type !== "all") {
      const [kind, flowerGroup] = type.split(":");
      if (crop.kind !== kind) return false;
      if (flowerGroup && crop.flower?.group !== flowerGroup) return false;
    }
    if (!needle) return true;
    // Search everything written about the plant: names, notes, nutrients, problems.
    const fl = crop.flower;
    const text = [
      title, crop.name, crop.botanical, crop.family, crop.summary, crop.how,
      ...(fl ? [fl.type, fl.color, fl.scent, fl.bloom] : []),
      ...(book ? [...book.nut, book.ben, book.good, ...book.pr.map(([k, n]) => SYM[k].t + " " + n)] : []),
    ]
      .join(" ")
      .toLowerCase();
    return text.includes(needle);
  });
}
