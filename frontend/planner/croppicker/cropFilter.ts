// What the crop picker shows: the planner's usual groups (plant this month in your zone, grows in your
// zone, other zones, then roses, peonies, camellias, spring bulbs and companion plants), narrowed to one type of plant
// (Vegetables, Fruits, Herbs, Flowers) and to names matching what's typed. Empty groups are left out.
// Pure functions, unit-tested in __tests__/crop-picker.test.ts.
import { normalizeName, type Crop, type Kind } from "@/shared/crop";
import { cropGroups } from "../editors/cropGroups";

export type Category = "all" | Kind;

// The filter buttons, in order, with their labels.
export const CATEGORIES: [Category, string][] = [
  ["all", "All"],
  ["veg", "Vegetables"],
  ["fruit", "Fruits"],
  ["herb", "Herbs"],
  ["flower", "Flowers"],
];

const matches = (crop: Crop, category: Category, key: string) =>
  (category === "all" || crop.kind === category) && (!key || normalizeName(crop.name).includes(key));

// How many crops each filter button would show (ignoring the typed name).
export function categoryCounts(crops: readonly Crop[]): Record<Category, number> {
  const counts = { all: crops.length, veg: 0, fruit: 0, herb: 0, flower: 0 };
  for (const c of crops) counts[c.kind]++;
  return counts;
}

// The groups to show, each with its crops sorted by name.
export function pickerGroups(crops: Crop[], zone: string, month: number, category: Category, query: string): [label: string, crops: Crop[]][] {
  const key = normalizeName(query.trim());
  return cropGroups(crops, zone, month)
    .map(([label, list]): [string, Crop[]] => [label, list.filter((c) => matches(c, category, key))])
    .filter(([, list]) => list.length > 0);
}
