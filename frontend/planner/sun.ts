// Sun position from the NOAA solar calculator equations (accurate to about a minute of arc for
// 1800–2100), plus sunrise, sunset and day length. Angles in degrees; azimuth is measured clockwise
// from true north. Times are handled as UTC instants and shown in the garden's time zone.

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Where the sun is: degrees above the horizon, and compass bearing (0 = north, 90 = east). */
export type SunPosition = { altitude: number; azimuth: number };
/** One point on the day's sun path: a UTC instant (ms) and the sun's position then. */
export type SunSample = SunPosition & { ms: number };
export type SunTimes = { sunrise: number | null; sunset: number | null; solarNoon: number; dayHours: number; polar: "day" | "night" | null };
export type Vec3 = { x: number; y: number; z: number };

// Declination and the equation of time for a UTC instant.
function solarTerms(ms: number): { decl: number; eqTime: number } {
  const jc = (ms / 86400000 + 2440587.5 - 2451545) / 36525;
  const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const C =
    Math.sin(rad(M)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * jc) +
    Math.sin(rad(3 * M)) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const appLong = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const meanObliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const obliq = meanObliq + 0.00256 * Math.cos(rad(omega));
  const decl = deg(Math.asin(Math.sin(rad(obliq)) * Math.sin(rad(appLong))));
  const y = Math.tan(rad(obliq / 2)) ** 2;
  const eqTime =
    4 *
    deg(
      y * Math.sin(2 * rad(L0)) -
        2 * e * Math.sin(rad(M)) +
        4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
        0.5 * y * y * Math.sin(4 * rad(L0)) -
        1.25 * e * e * Math.sin(2 * rad(M)),
    );
  return { decl, eqTime };
}

// { altitude, azimuth } of the sun at a UTC instant (ms) for a latitude and longitude.
export function sunPosition(ms: number, lat: number, lon: number): SunPosition {
  const { decl, eqTime } = solarTerms(ms);
  const d = new Date(ms);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  const trueSolar = (((minutes + eqTime + 4 * lon) % 1440) + 1440) % 1440;
  const hourAngle = trueSolar / 4 < 0 ? trueSolar / 4 + 180 : trueSolar / 4 - 180;
  const cosZen = Math.sin(rad(lat)) * Math.sin(rad(decl)) + Math.cos(rad(lat)) * Math.cos(rad(decl)) * Math.cos(rad(hourAngle));
  const zenith = deg(Math.acos(Math.min(1, Math.max(-1, cosZen))));
  const denom = Math.cos(rad(lat)) * Math.sin(rad(zenith));
  let azimuth: number;
  if (Math.abs(denom) < 1e-9) azimuth = lat > 0 ? 180 : 0;
  else {
    const a = deg(Math.acos(Math.min(1, Math.max(-1, (Math.sin(rad(lat)) * Math.cos(rad(zenith)) - Math.sin(rad(decl))) / denom))));
    azimuth = hourAngle > 0 ? (a + 180) % 360 : (540 - a) % 360;
  }
  return { altitude: 90 - zenith, azimuth };
}

// Minutes east of UTC for a time zone at an instant (e.g. -240 for New York in summer).
export function tzOffsetMinutes(tz: string, ms: number): number {
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric",
      }).formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
    );
    const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute);
    return Math.round((asUtc - Math.floor(ms / 60000) * 60000) / 60000);
  } catch {
    return Math.round(-new Date(ms).getTimezoneOffset());
  }
}

// UTC instant for a local date ("2026-06-21") and minutes after local midnight, in a time zone.
export function localToUtc(dateStr: string, minutes: number, tz: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d) + minutes * 60000;
  const first = guess - tzOffsetMinutes(tz, guess) * 60000;
  return guess - tzOffsetMinutes(tz, first) * 60000;
}

// Sunrise, solar noon and sunset (UTC ms) for a local date, and the day length in hours.
// `polar` is "day" (midnight sun) or "night" (no sunrise) near the poles.
export function sunTimes(dateStr: string, lat: number, lon: number, tz: string): SunTimes {
  const noonGuess = localToUtc(dateStr, 12 * 60, tz);
  const { decl, eqTime } = solarTerms(noonGuess);
  const [y, m, d] = dateStr.split("-").map(Number);
  const midnightUtc = Date.UTC(y, m - 1, d);
  const solarNoon = midnightUtc + (720 - 4 * lon - eqTime) * 60000;
  const cosH = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) - Math.tan(rad(lat)) * Math.tan(rad(decl));
  if (cosH > 1) return { sunrise: null, sunset: null, solarNoon, dayHours: 0, polar: "night" };
  if (cosH < -1) return { sunrise: null, sunset: null, solarNoon, dayHours: 24, polar: "day" };
  const halfDay = deg(Math.acos(cosH)) * 4 * 60000;
  return { sunrise: solarNoon - halfDay, sunset: solarNoon + halfDay, solarNoon, dayHours: (2 * halfDay) / 3600000, polar: null };
}

export function formatClock(ms: number | null | undefined, tz: string): string {
  if (ms == null) return "none";
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const compassPoint = (azimuth: number): string => COMPASS[Math.round((((azimuth % 360) + 360) % 360) / 22.5) % 16];

// Unit vector pointing from the garden toward the sun, in plan coordinates:
// x to the right of the plan, z toward the bottom of the plan, y up.
// `north` is the compass bearing of the plan's "up" direction (0 = the top of the plan faces north).
export function sunVector(altitude: number, azimuth: number, north = 0): Vec3 {
  const bearing = rad(azimuth - north);
  const flat = Math.cos(rad(altitude));
  return { x: Math.sin(bearing) * flat, y: Math.sin(rad(altitude)), z: -Math.cos(bearing) * flat };
}

// Sun positions through a day, every `step` minutes from sunrise to sunset, for drawing the sun's
// path and adding up sun hours. Each sample: { ms, altitude, azimuth }.
export function daySamples(dateStr: string, lat: number, lon: number, tz: string, step = 15): SunSample[] {
  const times = sunTimes(dateStr, lat, lon, tz);
  let start = times.sunrise;
  let end = times.sunset;
  if (times.polar === "night") return [];
  if (times.polar === "day") {
    start = localToUtc(dateStr, 0, tz);
    end = start + 24 * 3600000;
  }
  if (start == null || end == null) return [];
  const samples: SunSample[] = [];
  for (let ms = start + (step * 60000) / 2; ms < end; ms += step * 60000) {
    const p = sunPosition(ms, lat, lon);
    if (p.altitude > 0) samples.push({ ms, ...p });
  }
  return samples;
}
