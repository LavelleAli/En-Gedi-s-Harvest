// Groups the "Add a crop" list: what to plant this month in the zone, what grows in the zone, everything
// else, then the named roses, peonies, camellias and spring bulbs in their own groups so they don't bury the food crops.
import { FLOWER_GROUPS, FLOWER_GROUP_LABEL, isGardenFlower, suitsZone, type Crop } from "@/shared/crop";
import { suggestionsFor } from "@/shared/planting";
import { zoneNumber } from "@/shared/zones";

export function cropGroups(crops: Crop[], zone: string, month: number): [label: string, crops: Crop[]][] {
  const now = suggestionsFor(zone, month, crops).map((s) => s.crop);
  const nowIds = new Set(now.map((c) => c.id));
  const zn = zoneNumber(zone);
  const byName = (a: Crop, b: Crop) => a.name.localeCompare(b.name);
  const food = crops.filter((c) => !isGardenFlower(c) && !nowIds.has(c.id));
  const fits = food.filter((c) => suitsZone(c, zn)).sort(byName);
  const other = food.filter((c) => !suitsZone(c, zn)).sort(byName);
  const list: [string, Crop[]][] = [
    ["Plant this month in zone " + zone, now.sort(byName)],
    [`Grows in zone ${zone}`, fits],
    ["Other zones", other],
  ];
  for (const group of FLOWER_GROUPS) {
    list.push([FLOWER_GROUP_LABEL[group], crops.filter((c) => c.flower?.group === group).sort(byName)]);
  }
  return list;
}
