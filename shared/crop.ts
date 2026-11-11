// One record shape for every crop the garden planner knows about: the stock catalog, plants researched
// through the plant-lookup API, and plants a reader types in by hand. The frontend and the backend both
// validate against this schema, so the two can't drift apart.
import { z } from "zod";
import { slug } from "@/shared/slug";

export const KINDS = ["veg", "fruit", "herb", "flower"] as const;
export type Kind = (typeof KINDS)[number];
export const KIND_LABEL: Record<Kind, string> = { veg: "Vegetable", fruit: "Fruit", herb: "Herb", flower: "Flower" };
export const LIVES = ["annual", "biennial", "perennial"] as const;
export type Life = (typeof LIVES)[number];
// Growth habit drives the 3D shape in the planner and a few planting rules.
export const HABITS = ["leafy", "root", "bush", "vine", "tall", "clump", "groundcover", "shrub", "cane", "tree"] as const;
export type Habit = (typeof HABITS)[number];
export const SEASONS = ["cool", "warm", "perennial"] as const;
export type Season = (typeof SEASONS)[number];
export const METHODS = ["direct", "transplant", "sets", "cloves", "crowns", "slips", "tubers", "bare-root", "container", "division"] as const;
export type Method = (typeof METHODS)[number];
export const METHOD_LABEL: Record<Method, string> = {
  direct: "Sow seed in place",
  transplant: "Set out transplants",
  sets: "Plant sets",
  cloves: "Plant cloves",
  crowns: "Plant crowns",
  slips: "Plant slips",
  tubers: "Plant tubers or root pieces",
  "bare-root": "Plant bare-root while dormant",
  container: "Plant a container-grown plant",
  division: "Plant divisions or offsets",
};
export const BEDS = ["raised", "in-ground", "either"] as const;
export const ORIGINS = ["stock", "research", "custom"] as const;

const weeks = z.tuple([z.number().min(-30).max(30), z.number().min(-30).max(30)]);

export const SourceSchema = z.object({
  title: z.string().max(200),
  url: z.string().url().max(500).refine((u) => /^https?:\/\//i.test(u), "http(s) links only"),
});

export const CropSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,60}$/),
  name: z.string().trim().min(2).max(60),
  botanical: z.string().max(80).default(""),
  family: z.string().max(40).default(""), // Latin family name, e.g. "Solanaceae"
  kind: z.enum(KINDS),
  life: z.enum(LIVES),
  habit: z.enum(HABITS),
  // Hardiness zones (as numbers, 8.5 = 8b) where it grows well outdoors, as a perennial or a seasonal crop.
  zones: z.tuple([z.number().min(1).max(13.5), z.number().min(1).max(13.5)]),
  season: z.enum(SEASONS),
  sunHours: z.number().min(0).max(14), // direct sun it needs per day
  shadeOk: z.boolean(), // still worthwhile in part shade (about 4 hours)
  waterIn: z.number().min(0).max(4), // inches of water a week in season
  spacingIn: z.number().min(1).max(480), // inches between plants
  heightFt: z.number().min(0.1).max(80), // mature height, used for shadows
  rootIn: z.number().min(2).max(48).default(12), // soil depth it needs in a raised bed
  days: z.tuple([z.number().min(1).max(400), z.number().min(1).max(400)]).nullable(), // days to first harvest
  firstHarvest: z.string().max(80).default(""), // for crops that take longer, e.g. "Year 3"
  method: z.enum(METHODS),
  depthIn: z.number().min(0).max(24),
  // Planting windows in weeks from the frost dates (negative = before the frost date).
  spring: weeks.nullable(), // relative to the last spring frost
  fall: weeks.nullable(), // relative to the first fall frost
  fallMinZone: z.number().min(1).max(13).optional(), // fall planting only works from this zone up
  how: z.string().max(500),
  bed: z.enum(BEDS),
  bedNote: z.string().max(240).default(""),
  friends: z.array(z.string().max(60)).max(16), // crop ids or plain names
  foes: z.array(z.string().max(60)).max(16),
  summary: z.string().max(320).default(""),
  origin: z.enum(ORIGINS).default("custom"),
  book: z.string().max(80).optional(), // the plant's name in the encyclopedia, when it has a full entry
  zoneNote: z.string().max(320).optional(), // researched plants: a note for the zone that was asked about
  sources: z.array(SourceSchema).max(8).default([]),
});

/** One crop record, as validated by CropSchema (defaults filled in). */
export type Crop = z.infer<typeof CropSchema>;
/** What name matching needs from a crop: stock crops, library results and form drafts all have these. */
export type CropRef = Pick<Crop, "id" | "name"> & { book?: string };
export type Source = z.infer<typeof SourceSchema>;

export const cropId = (name: string): string => slug(name).slice(0, 60);

// "Bush Beans (Phaseolus)" -> "bush bean": lowercase, no parentheses or punctuation, simple singular.
export function normalizeName(text: unknown): string {
  const base = String(text)
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base
    .split(" ")
    .map((word) => {
      if (word.length <= 3) return word;
      if (word.endsWith("ies")) return word.slice(0, -3) + "y";
      if (word.endsWith("oes")) return word.slice(0, -2);
      if (word.endsWith("ss") || word.endsWith("us")) return word;
      if (word.endsWith("s")) return word.slice(0, -1);
      return word;
    })
    .join(" ");
}

// Other names people (and web sources) use for stock crops.
const ALIASES: Record<string, string> = {
  zucchini: "summer-squash", squash: "summer-squash", courgette: "summer-squash",
  bean: "green-beans", "bush bean": "green-beans", "pole bean": "green-beans", "snap bean": "green-beans", "string bean": "green-beans",
  pea: "snap-pea", "garden pea": "snap-pea", "sugar snap pea": "snap-pea", "english pea": "snap-pea",
  corn: "sweet-corn", maize: "sweet-corn",
  cowpea: "southern-peas", "field pea": "southern-peas", "black eyed pea": "southern-peas", "southern pea": "southern-peas",
  scallion: "onion", "green onion": "onion", "walking onion": "onion", shallot: "onion",
  collard: "collards", "collard green": "collards",
  mustard: "mustard-greens", "mustard green": "mustard-greens",
  chard: "swiss-chard", "silverbeet": "swiss-chard",
  pumpkin: "winter-squash", "butternut squash": "winter-squash", "winter squash": "winter-squash",
  melon: "watermelon",
  coriander: "cilantro",
  "bell pepper": "pepper", "chili pepper": "pepper", "hot pepper": "pepper", "sweet pepper": "pepper", chili: "pepper",
  "cherry tomato": "tomato",
  yam: "sweet-potato",
  beetroot: "beet",
  rocket: "arugula",
  "pak choi": "bok-choy", "pak choy": "bok-choy",
  honeyberry: "haskap", serviceberry: "saskatoon", juneberry: "saskatoon",
  lemon: "citrus", orange: "citrus", satsuma: "citrus", lime: "citrus", grapefruit: "citrus",
  grape: "grape", "concord grape": "grape",
  "muscadine grape": "muscadine", scuppernong: "muscadine",
  "asian persimmon": "persimmon", "rabbiteye blueberry": "blueberry", "tart cherry": "sour-cherry",
};

// Names that stand for a whole plant family in companion lists.
const GROUPS: Record<string, string[]> = {
  "cabbage family": ["cabbage", "collards", "kale", "broccoli", "cauliflower", "brussels-sprouts", "mustard-greens", "turnip", "bok-choy"],
  brassica: ["cabbage", "collards", "kale", "broccoli", "cauliflower", "brussels-sprouts", "mustard-greens", "turnip", "bok-choy"],
  allium: ["onion", "garlic", "chives", "leek"],
  "onion family": ["onion", "garlic", "chives", "leek"],
  legume: ["green-beans", "snap-pea", "southern-peas"],
  nightshade: ["tomato", "pepper", "eggplant", "potato"],
  cucurbit: ["summer-squash", "cucumber", "winter-squash", "watermelon"],
};

// Turns a crop id or a plain plant name into the ids of matching crops (possibly several for a family name).
export function matchCropIds(nameOrId: string, crops: readonly CropRef[]): string[] {
  const raw = String(nameOrId).trim();
  if (!raw) return [];
  const byId = crops.find((c) => c.id === raw);
  if (byId) return [byId.id];
  const wanted = normalizeName(raw);
  if (!wanted) return [];
  if (GROUPS[wanted]) return GROUPS[wanted].filter((id) => crops.some((c) => c.id === id));
  const alias = ALIASES[wanted];
  if (alias && crops.some((c) => c.id === alias)) return [alias];
  const hit = crops.find((c) => normalizeName(c.name) === wanted || (c.book && normalizeName(c.book) === wanted) || normalizeName(c.id) === wanted);
  return hit ? [hit.id] : [];
}

export function findCrop<T extends CropRef>(name: string, crops: readonly T[]): T | null {
  const [id] = matchCropIds(name, crops);
  return id ? (crops.find((c) => c.id === id) ?? null) : null;
}

// Does the crop suit this zone number (8.5 = 8b)? The top zone includes its "b" half.
export function suitsZone(crop: Pick<Crop, "zones">, zoneNum: number): boolean {
  return zoneNum >= crop.zones[0] && zoneNum < Math.floor(crop.zones[1]) + 1;
}

// 8 -> "8", 8.5 -> "8b"
export function zoneText(n: number): string {
  return Number.isInteger(n) ? String(n) : `${Math.floor(n)}b`;
}
export function zoneRangeText(crop: Pick<Crop, "zones">): string {
  const [min, max] = crop.zones;
  return min === max ? `Zone ${zoneText(min)}` : `Zones ${zoneText(min)} to ${zoneText(max)}`;
}
