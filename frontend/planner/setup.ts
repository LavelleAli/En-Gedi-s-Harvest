// The Setup box for an animal or water item: the one or two numbers you type (birds, gallons, hives,
// roof area and rain) and the numbers that follow from them. The rules of thumb match the Chickens,
// Fish and Bees pages, checked against extension guides:
//   chickens — 4 sq ft of coop floor and 10 sq ft of run per bird, one nest box per 4 hens (Chickens page);
//              about ¼ lb of feed a day (Alabama, Mississippi State extension) and 1–2 cups of water a day,
//              more in heat (Kentucky extension: about twice the feed by weight).
//   fish     — start light: about 1 lb of adult fish per 10 gallons, added a few at a time (Fish page).
//   bees     — hives in a line a few feet apart (Mississippi State extension; 3 ft used here), room to
//              work from behind, a 6-ft fence or hedge in front of the entrances (Bees page).
//   rain     — 0.623 gallons per sq ft of roof per inch of rain (7.48 gal per cu ft ÷ 12), and about 80%
//              of that reaching the tank after splash, gutters and first flush.
import type { Garden, Obstacle, ObstacleKind, Setup } from "./model";

const GALLONS_PER_CU_FT = 7.48;
const RAIN_GALLONS = GALLONS_PER_CU_FT / 12; // per sq ft per inch
const CATCH = 0.8;
const HIVE_GAP_FT = 3;
const WORK_ROOM_FT = 3;

export type SetupField = { key: keyof Setup; label: string; unit: string; min: number; max: number; step: number; value: number };
export type SetupLine = { label: string; value: string; warn?: boolean };
export type SetupBox = { fields: SetupField[]; lines: SetupLine[]; note: string };

/** A number for reading: whole numbers past 10, one decimal below, with thousands commas. */
export function fmt(n: number): string {
  const v = Math.abs(n) >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
  return v.toLocaleString("en-US");
}

/** A day's water range as cups, quarts or gallons, both ends in the unit that suits the larger. */
function water(lowCups: number, highCups: number): string {
  const [per, unit] = highCups < 4 ? [1, "cups"] : highCups < 16 ? [4, "qt"] : [16, "gal"];
  return `${fmt(lowCups / per)}–${fmt(highCups / per)} ${unit}`;
}

/** Gallons a box (fish farm) or a round tank (as wide as its shorter side) holds when full. */
export function gallonsHeld(item: Pick<Obstacle, "kind" | "w" | "d" | "h">): number {
  if (item.kind === "tank" || item.kind === "filter") {
    const r = Math.min(item.w, item.d) / 2;
    return Math.PI * r * r * item.h * GALLONS_PER_CU_FT;
  }
  return item.w * item.d * item.h * GALLONS_PER_CU_FT;
}

/** The house's footprint, the usual roof for a rain tank (1,000 sq ft if there's no house). */
function roofGuess(garden: Garden): number {
  const house = garden.obstacles.find((o) => o.kind === "house");
  return house ? Math.round(house.w * house.d) : 1000;
}

const KINDS_WITH_SETUP: ReadonlySet<ObstacleKind> = new Set(["coop", "fishfarm", "hive", "tank"]);
export const hasSetup = (kind: ObstacleKind) => KINDS_WITH_SETUP.has(kind);

/** The Setup box for an item, or null for kinds that don't have one. */
export function setupFor(item: Obstacle, garden: Garden): SetupBox | null {
  const s = item.setup ?? {};
  switch (item.kind) {
    case "coop": {
      const birds = s.birds ?? 4;
      const floor = item.w * item.d;
      const needed = birds * 4;
      return {
        fields: [{ key: "birds", label: "Birds", unit: "count", min: 1, max: 200, step: 1, value: birds }],
        lines: [
          { label: "Coop floor", value: `${fmt(needed)} sq ft needed; this coop has ${fmt(floor)}`, warn: floor < needed },
          { label: "Run", value: `${fmt(birds * 10)} sq ft, roofed` },
          { label: "Nest boxes", value: `${Math.ceil(birds / 4)}` },
          { label: "Feed", value: `${fmt(birds * 0.25)} lb a day (${fmt(birds * 0.25 * 7)} lb a week)` },
          { label: "Water", value: `${water(birds, birds * 2)} a day, more in heat` },
        ],
        note: "4 sq ft inside and 10 sq ft of run per bird; about ¼ lb of layer feed and 1–2 cups of water each a day.",
      };
    }
    case "fishfarm": {
      const held = gallonsHeld(item);
      const gallons = s.gallons ?? Math.round(held / 10) * 10;
      const fish = gallons / 10;
      return {
        fields: [{ key: "gallons", label: "Water in the tank", unit: "gal", min: 1, max: 100000, step: 10, value: gallons }],
        lines: [
          gallons > held
            ? { label: "Tank holds", value: `only about ${fmt(held)} gal; make it bigger or enter less`, warn: true }
            : { label: "Tank holds", value: `about ${fmt(held)} gal when full` },
          { label: "Start with", value: `about ${fmt(fish)} lb of fish` },
          { label: "At 1 lb each", value: `about ${Math.max(1, Math.floor(fish))} fish, added a few at a time` },
        ],
        note: "Start light: about 1 lb of adult fish per 10 gallons, and add more only once the water tests stay steady.",
      };
    }
    case "hive": {
      const hives = s.hives ?? 2;
      const row = hives * item.w + (hives - 1) * HIVE_GAP_FT;
      return {
        fields: [{ key: "hives", label: "Hives", unit: "count", min: 1, max: 50, step: 1, value: hives }],
        lines: [
          { label: "In a line", value: `about ${fmt(row)} ft long, ${HIVE_GAP_FT} ft apart` },
          { label: "Spot to keep", value: `${fmt(row)} × ${fmt(item.d + WORK_ROOM_FT)} ft, with ${WORK_ROOM_FT} ft behind to work` },
          { label: "In front", value: "a 6-ft fence or hedge sends bees up over people" },
          { label: "Water", value: "a shallow dish with stones nearby" },
        ],
        note: "Hives a few feet apart, entrances facing east or south, away from walkways.",
      };
    }
    case "tank": {
      const roof = s.roof ?? roofGuess(garden);
      const rain = s.rain ?? 1;
      const held = gallonsHeld(item);
      const perInch = roof * RAIN_GALLONS * CATCH;
      const caught = perInch * rain;
      const share = held > 0 ? (caught / held) * 100 : 0;
      return {
        fields: [
          { key: "roof", label: "Roof", unit: "sq ft", min: 10, max: 20000, step: 10, value: roof },
          { key: "rain", label: "Rain", unit: "in", min: 0.1, max: 20, step: 0.1, value: rain },
        ],
        lines: [
          { label: "Tank holds", value: `about ${fmt(held)} gal` },
          { label: "This rain", value: `about ${fmt(caught)} gal` },
          share > 100
            ? { label: "Fills", value: `the tank, with about ${fmt(caught - held)} gal spilling over`, warn: true }
            : { label: "Fills", value: `about ${fmt(share)}% of the tank` },
          { label: "To fill it", value: `about ${fmt(held / perInch)} in of rain` },
        ],
        note: "Each inch of rain on a square foot of roof is 0.62 gal; about 80% of that reaches the tank.",
      };
    }
    default:
      return null;
  }
}
