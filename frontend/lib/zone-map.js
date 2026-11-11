// The facts the zone map shows for one state, worked out from its zone range and the frost
// averages in shared/zones.js. Pure functions, so they're unit-tested.
import { STATE_ZONES } from "@/frontend/data/state-zones";
import { ZONES, formatDay, frostDays, isFrostFree, zoneNumber } from "@/shared/zones";

// Every half-zone from coldest to warmest: ["7a", "7b", "8a", "8b", "9a"].
export function zonesBetween(coldest, warmest) {
  const a = ZONES.indexOf(coldest);
  const b = ZONES.indexOf(warmest);
  return a === -1 || b === -1 || a > b ? [] : ZONES.slice(a, b + 1);
}

// The zone in the middle of a state's range, used for its color on the map.
export function middleZone(coldest, warmest) {
  const zones = zonesBetween(coldest, warmest);
  return zones[Math.floor((zones.length - 1) / 2)] ?? coldest;
}

// Everything the hover card shows for one state, or null for an unknown name.
export function stateSummary(name) {
  const info = STATE_ZONES[name];
  if (!info) return null;
  const [coldest, warmest] = info.range;
  const zones = zonesBetween(coldest, warmest);
  const [coldSpring, coldFall] = frostDays(coldest);
  const [warmSpring, warmFall] = frostDays(warmest);
  const reachesFrostFree = isFrostFree(warmest);
  return {
    name,
    abbr: info.abbr,
    zones,
    range: coldest === warmest ? coldest : `${coldest} to ${warmest}`,
    // Warm areas have their last spring frost first, and their first fall frost last.
    lastFrost: reachesFrostFree ? `${formatDay(coldSpring)} or earlier; rare in the warmest areas` : `${formatDay(warmSpring)} to ${formatDay(coldSpring)}`,
    firstFrost: reachesFrostFree ? `${formatDay(coldFall)} or later; rare in the warmest areas` : `${formatDay(coldFall)} to ${formatDay(warmFall)}`,
    season: reachesFrostFree ? `${coldFall - coldSpring} days to year-round` : `${coldFall - coldSpring} to ${warmFall - warmSpring} days`,
  };
}

// Map color for a zone: cold blues through greens and yellows to warm reds, like the USDA map.
const COLORS = ["#8c6bb1", "#6a7fc2", "#4f97c9", "#45adb3", "#4fb98d", "#7cc36a", "#a9cc5a", "#d2c94e", "#e8b04a", "#ec8f45", "#e56b45", "#d14b4b", "#b8364f"];
export function zoneColor(zone) {
  const n = Math.floor(zoneNumber(zone));
  return COLORS[Math.min(Math.max(n, 1), 13) - 1];
}
export const LEGEND = COLORS.map((color, i) => ({ zone: i + 1, color }));
