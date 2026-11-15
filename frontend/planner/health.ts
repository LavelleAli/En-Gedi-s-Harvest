// The Health box for the coop, fish farm and beehive: a short checklist you tick as you look things over
// (saved with the item as the ids ticked), and a few tips. Everything here comes from the Chickens, Bees
// and Fish pages (frontend/sections/animals), cut down to what fits a side panel; the page link says where
// to read more.
import type { ObstacleKind } from "./model";

export type HealthCheck = { id: string; text: string };
export type HealthBox = { title: string; checks: HealthCheck[]; tips: string[]; page: { href: string; label: string } };

const HEALTH: Partial<Record<ObstacleKind, HealthBox>> = {
  coop: {
    title: "Flock health",
    checks: [
      { id: "birds", text: "Every bird eating, moving, bright-eyed" },
      { id: "water", text: "Waterers scrubbed and full" },
      { id: "mites", text: "No mites or lice under the wings or at the vent" },
      { id: "feet", text: "Feet free of swelling and dark scabs" },
      { id: "secure", text: "Fences, latches and hardware cloth sound" },
    ],
    tips: [
      "Lock the coop at dusk every night.",
      "Panting with wings held out is heat stress: move birds to shade and give cool water with electrolytes. It can kill in hours.",
      "Sneezing, bubbles at the eyes or rattling breath: isolate that bird.",
      "Several sudden deaths or swollen purple combs: report it to your state veterinarian right away and don't move birds.",
      "Change the bedding monthly; the old bedding goes on the compost pile.",
    ],
    page: { href: "/chickens/", label: "Chickens" },
  },
  hive: {
    title: "Hive checks",
    checks: [
      { id: "eggs", text: "Eggs or young larvae seen (the queen is laying)" },
      { id: "brood", text: "Solid brood, no sunken or greasy cells" },
      { id: "stores", text: "Pollen and honey on the frames" },
      { id: "room", text: "Room to grow (add a box at 7–8 of 10 frames full)" },
      { id: "mites", text: "Mite count this month under 3 per 100 bees" },
    ],
    tips: [
      "Inspect every 7–10 days in spring, every 2 weeks in summer and fall, rarely in winter, on a warm, calm midday.",
      "Queen cells on frame bottoms in spring mean a swarm is coming: give room or split the hive.",
      "Fighting at the entrance is robbing: shrink the entrance.",
      "Slimy, fermented-smelling comb means small hive beetles: keep colonies strong and hives in sun.",
      "Sunken, greasy, foul-smelling brood may be foulbrood: call your state apiary inspector and don't move the equipment.",
    ],
    page: { href: "/bees/", label: "Bees" },
  },
  fishfarm: {
    title: "Water and fish",
    checks: [
      { id: "fish", text: "Fish eating and swimming normally" },
      { id: "pumps", text: "Pumps running; grow bed floods and drains" },
      { id: "temp", text: "Water temperature checked" },
      { id: "tests", text: "Ammonia and nitrite at 0, pH about 6.8–7.2" },
      { id: "intake", text: "Pump intake and solids filter cleaned" },
    ],
    tips: [
      "Feed only what the fish eat in about 5 minutes.",
      "Fish gasping at the surface means low oxygen: add aeration now.",
      "Ammonia or nitrite above 0.5 ppm: stop feeding and replace a quarter of the water with dechlorinated water.",
      "pH below 6.5: add a little crushed oyster shell or potassium bicarbonate to the grow bed.",
      "Keep a battery air pump for power outages.",
    ],
    page: { href: "/fish/", label: "Fish" },
  },
};

/** The Health box for an item, or null for kinds without animals. */
export function healthFor(kind: ObstacleKind): HealthBox | null {
  return HEALTH[kind] ?? null;
}

/** The checks not ticked yet: what still needs a look. */
export function toWatch(kind: ObstacleKind, ticked: readonly string[] = []): HealthCheck[] {
  return healthFor(kind)?.checks.filter((c) => !ticked.includes(c.id)) ?? [];
}
