// Planting windows and suggestions for a zone. Windows come from each crop's weeks-from-frost
// numbers and the zone's average frost dates, so the same crop record works everywhere.
import { suitsZone, zoneRangeText, METHOD_LABEL } from "@/shared/crop";
import { formatDay, frostDays, frostFreeDays, isFrostFree, zoneNumber } from "@/shared/zones";

// First day of each month (non-leap year), plus the day after Dec 31.
const MONTH_START = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

// Planting windows for a crop in a zone, as [{ season, start, end }] in days of the year.
// Starts may be below 1 (late in the previous year); callers wrap with formatDay.
export function plantingWindows(crop, zone) {
  const zoneNum = zoneNumber(zone);
  const [lastFrost, firstFrost] = frostDays(zone);
  const windows = [];
  if (crop.spring) windows.push({ season: "spring", start: lastFrost + crop.spring[0] * 7, end: lastFrost + crop.spring[1] * 7 });
  if (crop.fall && (!crop.fallMinZone || zoneNum >= crop.fallMinZone)) {
    windows.push({ season: "fall", start: firstFrost + crop.fall[0] * 7, end: firstFrost + crop.fall[1] * 7 });
  }
  // Frost-free zones grow cool crops through fall and winter; their "spring" and "fall" windows meet.
  return windows;
}

// Warm-season crops need enough frost-free days to ripen; short-season zones get a head-start note.
export function seasonFit(crop, zone) {
  if (crop.season !== "warm" || !crop.days || isFrostFree(zone)) return { ok: true, note: "" };
  const season = frostFreeDays(zone);
  const needed = crop.days[0] + (crop.method === "transplant" ? 0 : 14);
  if (season >= needed + 14) return { ok: true, note: "" };
  return {
    ok: false,
    note: `Your season is about ${season} frost-free days. Start it indoors early, pick a fast variety, or use row cover.`,
  };
}

function overlaps(window, start, end) {
  // Compare on the year's circle so windows that cross New Year still match.
  for (const shift of [-365, 0, 365]) {
    if (window.start + shift <= end && window.end + shift >= start) return true;
  }
  return false;
}

const wrap = (doy) => (((Math.round(doy) - 1) % 365) + 365) % 365 + 1;
export const windowText = (w) => `${formatDay(wrap(w.start))} – ${formatDay(wrap(w.end))}`;

// Crops to plant in a given month (0 = January) for a zone, best matches first.
// Each result: { crop, window, method, fit } where fit.ok is false for crops that need a head start.
export function suggestionsFor(zone, month, crops) {
  const zoneNum = zoneNumber(zone);
  const start = MONTH_START[month];
  const end = MONTH_START[month + 1] - 1;
  const results = [];
  for (const crop of crops) {
    if (!suitsZone(crop, zoneNum)) continue;
    const window = plantingWindows(crop, zone).find((w) => overlaps(w, start, end));
    if (!window) continue;
    results.push({ crop, window, method: METHOD_LABEL[crop.method], fit: seasonFit(crop, zone) });
  }
  // Crops that fit the season first, then by how soon the window closes.
  return results.sort((a, b) => Number(b.fit.ok) - Number(a.fit.ok) || wrap(a.window.end) - wrap(b.window.end));
}

// One line about where a crop grows, e.g. "Zones 3 to 11 · grows in your zone".
export function zoneFitText(crop, zone) {
  const fits = suitsZone(crop, zoneNumber(zone));
  return `${zoneRangeText(crop)} · ${fits ? "grows in your zone" : `not a good fit for zone ${zone}`}`;
}
