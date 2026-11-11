// USDA plant hardiness zones (1a to 13b) with average frost dates.
// Shared by the frontend (planting dates, suggestions) and the backend (validating requests).
// Canada and Mexico: use the USDA-method zone for your area.

export const ZONES = Array.from({ length: 13 }, (_, i) => [`${i + 1}a`, `${i + 1}b`]).flat();
export const isZone = (zone) => ZONES.includes(zone);

// "8a" -> 8, "8b" -> 8.5, so zones can be compared as numbers.
export function zoneNumber(zone) {
  const match = /^(\d{1,2})([ab])$/.exec(String(zone));
  if (!match) return NaN;
  return Number(match[1]) + (match[2] === "b" ? 0.5 : 0);
}

// Average last spring frost and first fall frost (day of year) by zone. Broad averages: local dates
// vary by a few weeks with elevation, water and cities. Zones 11a and warmer rarely or never freeze.
const FROST = {
  "1a": [166, 222], "1b": [160, 228], "2a": [154, 234], "2b": [148, 240],
  "3a": [142, 247], "3b": [136, 253], "4a": [130, 259], "4b": [124, 265],
  "5a": [118, 272], "5b": [112, 279], "6a": [106, 285], "6b": [100, 291],
  "7a": [95, 297], "7b": [91, 303], "8a": [87, 310], "8b": [80, 317],
  "9a": [70, 326], "9b": [55, 335], "10a": [35, 345], "10b": [15, 355],
};

export const isFrostFree = (zone) => !FROST[zone];

// [last spring frost, first fall frost] as day of year; frost-free zones use the calendar edges.
export function frostDays(zone) {
  return FROST[zone] || [0, 365];
}

export function frostFreeDays(zone) {
  const [spring, fall] = frostDays(zone);
  return fall - spring;
}

// A typical latitude for each zone number, used for sun angles until the reader shares a location.
// Zones don't follow latitude closely (zone 8 runs from Seattle to Georgia), so this is only a start.
const TYPICAL_LATITUDE = { 1: 64, 2: 58, 3: 50, 4: 46, 5: 43, 6: 40, 7: 37, 8: 33.8, 9: 30, 10: 27, 11: 21, 12: 19, 13: 18 };
export function typicalLatitude(zone) {
  return TYPICAL_LATITUDE[Math.floor(zoneNumber(zone))] ?? 38;
}

// Day of year (1 to 365) -> "Apr 10". Days outside the range wrap around the year.
export function formatDay(doy) {
  const day = (((Math.round(doy) - 1) % 365) + 365) % 365;
  const date = new Date(Date.UTC(2025, 0, 1) + day * 86400000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// How far (in days) this zone's spring and fall run from zone 8a, where the book's calendar was written.
export function zoneShift(zone) {
  const [spring, fall] = frostDays(zone);
  const [baseSpring, baseFall] = frostDays("8a");
  return { spring: spring - baseSpring, fall: fall - baseFall };
}

// "about 3 weeks later" / "about 2 weeks earlier" / "at about the same time"
export function describeShift(days) {
  const weeks = Math.round(Math.abs(days) / 7);
  if (weeks === 0) return "at about the same time";
  return `about ${weeks} week${weeks === 1 ? "" : "s"} ${days > 0 ? "later" : "earlier"}`;
}
