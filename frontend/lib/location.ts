// The reader's location: hardiness zone (drives planting dates and suggestions) and coordinates
// (drive the sun math in the garden planner). Saved in localStorage; nothing is sent to a server.
// Defaults to Fulton County, Georgia (zone 8a), where the book was written.
import { useSyncExternalStore } from "react";
import { isZone, typicalLatitude } from "@/shared/zones";

export const LOCATION_KEY = "fhb-location";
const EVENT = "fhb-location-change";

/** "default" = the book's home; "zone" = zone picked, coordinates estimated; "device" or "manual" = exact. */
export type LocationSource = "default" | "zone" | "device" | "manual";
export type GardenLocation = { zone: string; lat: number; lon: number; tz: string; place: string; source: LocationSource };

export const DEFAULT_LOCATION: GardenLocation = {
  zone: "8a",
  lat: 33.79,
  lon: -84.39,
  tz: "America/New_York",
  place: "Fulton County, GA",
  // "default" = the book's home; "zone" = zone picked, coordinates estimated; "device" or "manual" = exact.
  source: "default",
};

export const isDefaultLocation = (loc: GardenLocation): boolean => loc.source === "default";

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_LOCATION.tz;
  } catch {
    return DEFAULT_LOCATION.tz;
  }
}

// Standard-time UTC offset (hours) of a time zone, read in January so daylight time doesn't count.
function standardOffsetHours(tz: string): number {
  try {
    const jan = new Date(Date.UTC(2025, 0, 15, 12));
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false, day: "numeric" }).formatToParts(jan);
    const hour = Number(parts.find((p) => p.type === "hour")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    if (!Number.isFinite(hour) || !Number.isFinite(day)) return -5;
    return hour - 12 + (day - 15) * 24;
  } catch {
    return -5;
  }
}

// Picking a zone without sharing a location: estimate coordinates from the zone's typical latitude
// and the middle of the browser's time zone, so sun angles are roughly right.
export function estimateFromZone(zone: string): GardenLocation {
  const tz = browserTimeZone();
  return {
    zone,
    lat: typicalLatitude(zone),
    lon: Math.max(-170, Math.min(-50, standardOffsetHours(tz) * 15)),
    tz,
    place: `Zone ${zone}`,
    source: "zone",
  };
}

export function fromCoordinates(zone: string, lat: number, lon: number, source: LocationSource = "device"): GardenLocation {
  return { zone, lat, lon, tz: browserTimeZone(), place: "My garden", source };
}

// Anything read back from storage is checked field by field; a bad value falls back to the default.
function sanitize(raw: Partial<Record<keyof GardenLocation, unknown>>): GardenLocation {
  const loc = { ...DEFAULT_LOCATION, ...raw } as Record<keyof GardenLocation, unknown>;
  const sources: LocationSource[] = ["default", "zone", "device", "manual"];
  const zone = String(loc.zone);
  const lat = Number(loc.lat);
  const lon = Number(loc.lon);
  return {
    zone: isZone(zone) ? zone : DEFAULT_LOCATION.zone,
    lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : DEFAULT_LOCATION.lat,
    lon: Number.isFinite(lon) && Math.abs(lon) <= 180 ? lon : DEFAULT_LOCATION.lon,
    place: String(loc.place || "").slice(0, 60) || "My garden",
    tz: typeof loc.tz === "string" && loc.tz.length < 64 ? loc.tz : DEFAULT_LOCATION.tz,
    source: sources.includes(loc.source as LocationSource) ? (loc.source as LocationSource) : "manual",
  };
}

function readRaw() {
  try {
    return localStorage.getItem(LOCATION_KEY) || "";
  } catch {
    return "";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

// Parse once per stored string so the hook returns a stable object.
let cache = { raw: "", value: DEFAULT_LOCATION };
function parse(raw: string): GardenLocation {
  if (raw === cache.raw) return cache.value;
  let value = DEFAULT_LOCATION;
  try {
    if (raw) value = sanitize(JSON.parse(raw));
  } catch {}
  cache = { raw, value };
  return value;
}

// The static build renders the default location; the browser swaps in the saved one after hydration.
export function useLocation() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  return parse(raw);
}

// Pass null to go back to the book's default location.
export function saveLocation(next: GardenLocation | null): void {
  try {
    if (next === null) localStorage.removeItem(LOCATION_KEY);
    else localStorage.setItem(LOCATION_KEY, JSON.stringify(sanitize(next)));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
