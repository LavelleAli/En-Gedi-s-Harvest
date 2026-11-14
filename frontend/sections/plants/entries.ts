// The encyclopedia's data: one entry per catalog crop, joined with its long-form book text when it has
// one, sorted A to Z. Also the labels and counts the page's filters show.
import { PLANTS, type Plant } from "@/frontend/data/plants";
import { slug } from "@/shared/slug";
import { CATALOG } from "@/shared/catalog";
import { FLOWER_GROUPS, FLOWER_GROUP_LABEL, type Crop, type FlowerGroup, type Life } from "@/shared/crop";

/** One encyclopedia article: the catalog crop, its long-form book text if it has one, and where it sits A to Z. */
export type Entry = { crop: Crop; book: Plant | null; title: string; id: string; letter: string };

const collator = new Intl.Collator("en", { sensitivity: "base" });

export const ENTRIES: Entry[] = CATALOG.map((crop) => {
  const book = crop.book ? (PLANTS.find((p) => p.n === crop.book) ?? null) : null;
  const title = crop.book || crop.name;
  return { crop, book, title, id: `plant-${slug(title)}`, letter: title[0].toUpperCase() };
}).sort((a, b) => collator.compare(a.title, b.title));

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// The "Type of plant" dropdown. A value is a kind ("veg"), or a kind and a flower group ("flower:rose").
export const TYPE_GROUPS: { label: string; options: [string, string][] }[] = [
  { label: "Food", options: [["fruit", "Fruits"], ["veg", "Vegetables"], ["herb", "Herbs"]] },
  { label: "Flowers", options: [["flower", "All roses & flowers"], ...FLOWER_GROUPS.map((g): [string, string] => [`flower:${g}`, FLOWER_GROUP_LABEL[g]])] },
];

// How many plants each "Type of plant" option holds, shown in the dropdown.
export const TYPE_COUNTS: Record<string, number> = {};
for (const { crop } of ENTRIES) {
  TYPE_COUNTS[crop.kind] = (TYPE_COUNTS[crop.kind] ?? 0) + 1;
  if (crop.flower) TYPE_COUNTS[`flower:${crop.flower.group}`] = (TYPE_COUNTS[`flower:${crop.flower.group}`] ?? 0) + 1;
}

// Words for a plant's group and life cycle, under its name.
export const FLOWER_ONE: Record<FlowerGroup, string> = { rose: "Rose", peony: "Peony", camellia: "Camellia", bulb: "Spring bulb", companion: "Companion plant" };
export const LIFE: Record<Life, string> = { annual: "Annual", biennial: "Biennial", perennial: "Perennial" };
