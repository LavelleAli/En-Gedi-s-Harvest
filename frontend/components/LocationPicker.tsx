"use client";

// The masthead's location button and dialog. Step 1: pick your state on a zone map. Step 2: pick
// your exact zone from that state's range and, optionally, share coordinates for accurate sun angles.
// Everything stays in this browser. Readers outside the U.S. can skip the map and pick a zone directly.
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_LOCATION, estimateFromZone, fromCoordinates, saveLocation, useLocation, type GardenLocation } from "@/frontend/lib/location";
import { useFadeDialog } from "@/frontend/lib/useFadeDialog";
import { stateSummary } from "@/frontend/lib/zone-map";
import { STATE_ZONES } from "@/frontend/data/state-zones";
import ZoneMap from "@/frontend/components/ZoneMap";
import { ZONES } from "@/shared/zones";
import type { StateShape } from "@/frontend/data/us-states";

// What the dialog is editing. Coordinates stay strings while typed; they're checked on save.
type Draft = {
  step: "map" | "details";
  state: { name: string; zones: string[]; range: string } | null; // once a state is picked
  zone: string;
  place: string;
  lat: string;
  lon: string;
  fromDevice: boolean;
  coordsFromState: boolean;
};

const STATE_NAMES = Object.keys(STATE_ZONES);

// True in the browser, false while the static build renders the page (no document there yet).
const noop = () => () => {};
const useInBrowser = () => useSyncExternalStore(noop, () => true, () => false);

export default function LocationPicker() {
  const location = useLocation();
  const inBrowser = useInBrowser();
  const [draft, setDraft] = useState<Draft | null>(null);
  // Changes a few fields of the open draft (does nothing once the dialog has closed).
  const patch = (fields: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...fields } : d));
  const [geoStatus, setGeoStatus] = useState("");
  const { ref: dialogRef, open: openDialog, close: closeDialog, onCancel, onClick } = useFadeDialog({ onClosed: () => setDraft(null) });

  const hasExactCoords = ["device", "manual", "default"].includes(location.source);

  const open = () => {
    setDraft({
      step: "map",
      state: null,
      zone: location.zone,
      place: location.source === "zone" ? "" : location.place,
      lat: hasExactCoords ? String(location.lat) : "",
      lon: hasExactCoords ? String(location.lon) : "",
      fromDevice: location.source === "device",
      coordsFromState: false,
    });
    setGeoStatus("");
    openDialog();
  };

  // A state was clicked: suggest the middle of its zone range, its name and its center point.
  const pickState = (shape: StateShape) => {
    const summary = stateSummary(shape.name);
    if (!summary) return;
    setDraft((d) => d && {
      ...d,
      step: "details",
      state: { name: shape.name, zones: summary.zones, range: summary.range },
      zone: summary.zones.includes(d.zone) ? d.zone : summary.zones[Math.floor((summary.zones.length - 1) / 2)],
      place: shape.name,
      lat: String(shape.lat),
      lon: String(shape.lon),
      fromDevice: false,
      coordsFromState: true,
    });
  };

  const pickStateByName = async (name: string) => {
    if (!name) return;
    const { STATE_SHAPES } = await import("@/frontend/data/us-states");
    const shape = STATE_SHAPES.find((s) => s.name === name);
    if (shape) pickState(shape);
  };

  const useDevice = () => {
    if (!navigator.geolocation) {
      setGeoStatus("This browser can't share its location. Type coordinates instead, or leave them as they are.");
      return;
    }
    setGeoStatus("Asking your browser for your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Two decimals (about 1 km) is plenty for sun angles and keeps the exact address private.
        patch({ lat: pos.coords.latitude.toFixed(2), lon: pos.coords.longitude.toFixed(2), fromDevice: true, coordsFromState: false });
        setGeoStatus("Location filled in. It's saved only in this browser.");
      },
      () => setGeoStatus("Location wasn't shared. You can type coordinates or keep the estimate."),
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const lat = parseFloat(draft.lat);
    const lon = parseFloat(draft.lon);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    let next: GardenLocation;
    if (!hasCoords) next = estimateFromZone(draft.zone);
    // A state's center is an estimate, so it's saved as "zone" (estimated) rather than exact coordinates.
    else if (draft.coordsFromState) next = { ...fromCoordinates(draft.zone, lat, lon), source: "zone" };
    else next = fromCoordinates(draft.zone, lat, lon, draft.fromDevice ? "device" : "manual");
    if (draft.place.trim()) next.place = draft.place.trim();
    const unchangedDefault =
      draft.zone === DEFAULT_LOCATION.zone && hasCoords && lat === DEFAULT_LOCATION.lat && lon === DEFAULT_LOCATION.lon && next.place === DEFAULT_LOCATION.place;
    saveLocation(unchangedDefault ? null : next);
    closeDialog();
  };

  const zoneChoices = draft?.state ? draft.state.zones : ZONES;

  return (
    <>
      <button type="button" className="location-button" onClick={open} aria-haspopup="dialog">
        <span className="kicker">Zone {location.zone} · {location.place}</span>
        <span className="location-change">Change</span>
      </button>
      {/* The window is placed at the end of <body>, not inside the dark masthead, so it keeps the
          page's normal text and button colors. */}
      {inBrowser && createPortal(
        <dialog ref={dialogRef} className="dialog dialog-wide fade-dialog" aria-labelledby="loc-title" onCancel={onCancel} onClick={onClick}>
          {draft?.step === "map" && (
            <div className="stack">
              <h2 id="loc-title">Where is your garden?</h2>
              <p className="pmeta">Point at a state to see its zones and frost dates, then click it. Your choice stays in this browser.</p>
              <ZoneMap onPick={pickState} selected={location.place} />
              <div className="two-col">
                <div className="field">
                  <label htmlFor="loc-state">Or choose your state from a list</label>
                  <select id="loc-state" defaultValue="" onChange={(e) => pickStateByName(e.target.value)}>
                    <option value="" disabled>Pick a state…</option>
                    {STATE_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="row-actions dialog-actions">
                <button type="button" className="link-button" onClick={() => patch({ step: "details", state: null })}>
                  Outside the U.S.? Pick your zone directly
                </button>
                <button type="button" onClick={closeDialog}>Cancel</button>
              </div>
            </div>
          )}

          {draft?.step === "details" && (
            <form className="stack" onSubmit={save}>
              <h2 id="loc-title">{draft.state ? draft.state.name : "Your garden's location"}</h2>
              <div className="field">
                <label htmlFor="loc-zone">Your USDA hardiness zone</label>
                <select id="loc-zone" value={draft.zone} onChange={(e) => setDraft({ ...draft, zone: e.target.value })} aria-describedby="loc-zone-hint">
                  {zoneChoices.map((z) => <option key={z} value={z}>Zone {z}</option>)}
                </select>
                <p className="hint" id="loc-zone-hint">
                  {draft.state ? `${draft.state.name} runs from zone ${draft.state.range}. ` : ""}
                  Confirm yours by ZIP code on the{" "}
                  <a href="https://planthardiness.ars.usda.gov/" target="_blank" rel="noopener noreferrer">USDA zone map</a>.
                  {!draft.state && (
                    <>
                      {" "}In Canada, use the USDA-method zone from the{" "}
                      <a href="https://planthardiness.gc.ca/" target="_blank" rel="noopener noreferrer">hardiness maps</a>.
                    </>
                  )}
                </p>
              </div>
              <div className="field">
                <label htmlFor="loc-place">Name for this garden <span className="optional">(optional)</span></label>
                <input id="loc-place" type="text" maxLength={60} autoComplete="address-level2" value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} placeholder="Backyard, Calgary" />
              </div>
              <fieldset className="field">
                <legend>Coordinates <span className="optional">(optional, for sun angles)</span></legend>
                <div className="row-actions">
                  <button type="button" onClick={useDevice}>Use my location</button>
                </div>
                <p className="hint" role="status">{geoStatus}</p>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="loc-lat">Latitude</label>
                    <input id="loc-lat" type="number" inputMode="decimal" step="0.01" min="-90" max="90" value={draft.lat} onChange={(e) => setDraft({ ...draft, lat: e.target.value, fromDevice: false, coordsFromState: false })} />
                  </div>
                  <div className="field">
                    <label htmlFor="loc-lon">Longitude</label>
                    <input id="loc-lon" type="number" inputMode="decimal" step="0.01" min="-180" max="180" value={draft.lon} onChange={(e) => setDraft({ ...draft, lon: e.target.value, fromDevice: false, coordsFromState: false })} />
                  </div>
                </div>
                <p className="hint">
                  {draft.coordsFromState ? "Filled in with the middle of the state. Use my location for a closer estimate." : "Left blank, the planner estimates them from your zone and time zone."}
                </p>
              </fieldset>
              <div className="row-actions dialog-actions">
                <button type="submit" className="btn-primary">Save location</button>
                <button type="button" onClick={() => patch({ step: "map" })}>Back to the map</button>
                <button type="button" className="link-button" onClick={() => { saveLocation(null); closeDialog(); }}>Reset to Fulton County, GA</button>
              </div>
            </form>
          )}
        </dialog>,
        document.body,
      )}
    </>
  );
}
