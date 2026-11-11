"use client";

// The garden planner page: a 3D yard (three.js) with beds and shade sources, a panel to edit them,
// sun controls for any date and time, and a report on sun, companions, planting and watering.
import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CATALOG } from "@/shared/catalog";
import { useLocation } from "@/frontend/lib/location";
import { OBSTACLES, SNAP_STEPS, clampToYard, fitToYard, newId, snapToGrid, useCustomCrops, useGarden, useSnap, type Bed, type BedType, type Item, type Obstacle, type ObstacleKind } from "@/frontend/planner/model";
import type { Crop } from "@/shared/crop";
import type { CropsById } from "@/frontend/planner/analysis";
import { compassPoint, daySamples, formatClock, localToUtc, sunPosition, sunTimes } from "@/frontend/planner/sun";
import { sunHoursGrid } from "@/frontend/planner/shade";
import { BedEditor, ObstacleEditor, YardEditor } from "@/frontend/planner/Editors";
import ShadePalette from "@/frontend/planner/ShadePalette";
import GardenReport from "@/frontend/planner/Report";
import AddCropDialog from "@/frontend/planner/AddCropDialog";

// three.js only runs in the browser; load the scene on the client, in its own chunk.
const GardenScene = dynamic(() => import("@/frontend/planner/GardenScene"), {
  ssr: false,
  loading: () => <div className="scene scene-loading">Loading the 3D yard…</div>,
});

const STEP_MINUTES = 15;
const noop = () => () => {};
const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function quickDates(year: string): [string, string][] {
  return [
    ["Spring equinox", `${year}-03-20`],
    ["Summer solstice", `${year}-06-21`],
    ["Fall equinox", `${year}-09-22`],
    ["Winter solstice", `${year}-12-21`],
  ];
}

export default function PlannerApp() {
  const [garden, updateGarden, resetGarden] = useGarden();
  const [customCrops, saveCrop, removeCrop] = useCustomCrops();
  const location = useLocation();
  const today = useSyncExternalStore(noop, todayString, () => "2026-06-21");
  const [pickedDate, setDate] = useState<string | null>(null);
  const date = pickedDate ?? today;
  const [minutes, setMinutes] = useState(13 * 60);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The toolbar's camera buttons. `n` counts presses, so pressing Top again after orbiting resets the view.
  const [view, setView] = useState<{ mode: "3d" | "top"; n: number }>({ mode: "3d", n: 0 });
  const resetView = (mode: "3d" | "top") => setView((v) => ({ mode, n: v.n + 1 }));
  const [showHeat, setShowHeat] = useState(false);
  const [snap, setSnap] = useSnap();
  const snapStep = snap.on ? snap.step : 0; // 0 = no grid snapping (positions still round to 0.5 ft)
  const [cropDialogFor, setCropDialogFor] = useState<string | null>(null); // bed id the Add crop dialog adds to

  const crops = useMemo((): Crop[] => [...CATALOG, ...customCrops.filter((c) => !CATALOG.some((s) => s.id === c.id))], [customCrops]);
  const cropsById = useMemo((): CropsById => Object.fromEntries(crops.map((c) => [c.id, c])), [crops]);

  const { lat, lon, tz } = location;
  const times = useMemo(() => sunTimes(date, lat, lon, tz), [date, lat, lon, tz]);
  const samples = useMemo(() => daySamples(date, lat, lon, tz, STEP_MINUTES), [date, lat, lon, tz]);
  const sun = useMemo(() => sunPosition(localToUtc(date, minutes, tz), lat, lon), [date, minutes, lat, lon, tz]);
  const shadeKey = JSON.stringify([garden.yard, garden.obstacles]);
  // Recomputed only when the yard, its shade sources, the date or the location change.
  const grid = useMemo(() => sunHoursGrid(garden, samples, STEP_MINUTES), [shadeKey, samples]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = [...garden.beds, ...garden.obstacles];
  const selected = items.find((i) => i.id === selectedId) || null;

  // Edits from the side panel. The patch only ever holds fields of the selected item's own kind.
  const patchItem = (id: string, patch: Partial<Bed> | Partial<Obstacle>) =>
    updateGarden((g) => {
      const fix = <T extends Item>(item: T): T => (item.id === id ? clampToYard({ ...item, ...patch } as T, g.yard) : item);
      return { ...g, beds: g.beds.map(fix), obstacles: g.obstacles.map(fix) };
    });
  // A move from the 3D view (drag or arrow keys). `step` is the grid it was snapped to, or 0.
  const moveItem = (id: string, x: number, z: number, step: number) =>
    updateGarden((g) => {
      const fix = <T extends Item>(item: T): T => (item.id === id ? snapToGrid({ ...item, x, z }, g.yard, step) : item);
      return { ...g, beds: g.beds.map(fix), obstacles: g.obstacles.map(fix) };
    });
  const deleteItem = (id: string) => {
    updateGarden((g) => ({ ...g, beds: g.beds.filter((b) => b.id !== id), obstacles: g.obstacles.filter((o) => o.id !== id) }));
    setSelectedId(null);
  };
  const addBed = (type: BedType) => {
    const bed = snapToGrid<Bed>(
      { id: newId("bed"), kind: "bed", name: `${type === "raised" ? "Raised bed" : "In-ground bed"} ${garden.beds.length + 1}`, type, x: garden.yard.w / 2, z: garden.yard.d * 0.65, w: type === "raised" ? 4 : 8, d: type === "raised" ? 8 : 10, h: type === "raised" ? 1 : 0, crops: [] },
      garden.yard,
      snapStep,
    );
    updateGarden((g) => ({ ...g, beds: [...g.beds, bed] }));
    setSelectedId(bed.id);
  };
  const addObstacle = (kind: ObstacleKind) => {
    const preset = OBSTACLES[kind];
    const item = snapToGrid<Obstacle>({ id: newId(kind), kind, name: preset.label, x: garden.yard.w / 2, z: garden.yard.d / 3, w: preset.w, d: preset.d, h: preset.h }, garden.yard, snapStep);
    updateGarden((g) => ({ ...g, obstacles: [...g.obstacles, item] }));
    setSelectedId(item.id);
  };
  // Adds copies made in the Shade sources panel; selects one of them when asked.
  const addObstacles = (newItems: Obstacle[], selectId?: string) => {
    updateGarden((g) => ({ ...g, obstacles: [...g.obstacles, ...newItems] }));
    if (selectId) setSelectedId(selectId);
  };
  const addCropToBed = (bedId: string, cropId: string) =>
    updateGarden((g) => ({ ...g, beds: g.beds.map((b) => (b.id === bedId && !b.crops.includes(cropId) ? { ...b, crops: [...b.crops, cropId] } : b)) }));

  const year = date.slice(0, 4);
  const sunLabel = sun.altitude > 0 ? `Sun ${Math.round(sun.altitude)}° up in the ${compassPoint(sun.azimuth)}` : "Sun below the horizon";
  const sceneLabel = `3D view of the yard, ${garden.yard.w} by ${garden.yard.d} feet, with ${garden.beds.length} beds. ${sunLabel}. ${
    selected ? `${selected.name} is selected: arrow keys move it, Delete removes it, Escape deselects.` : "Select an item in the panel or click it to move it."
  }`;

  return (
    <section className="view planner">
      <div>
        <div className="kicker">Plan your beds</div>
        <h2>Garden planner</h2>
      </div>
      <p className="lead">
        Lay out raised and in-ground beds, add the house, trees and fences that shade your yard, and pick crops for each bed. The planner
        traces the sun for zone {location.zone} at {location.place} and reports sun hours, companion plants, planting steps and a watering
        schedule. Your plan is saved in this browser.
      </p>

      <div className="planner-toolbar" role="toolbar" aria-label="Planner tools">
        <div className="tool-group">
          <button type="button" onClick={() => addBed("raised")}>+ Raised bed</button>
          <button type="button" onClick={() => addBed("in-ground")}>+ In-ground bed</button>
        </div>
        <div className="tool-group segmented" role="group" aria-label="Camera">
          <button type="button" aria-pressed={view.mode === "3d"} onClick={() => resetView("3d")} title="Starting 3D view (Home)">3D</button>
          <button type="button" aria-pressed={view.mode === "top"} onClick={() => resetView("top")} title="Look straight down (7)">Top</button>
        </div>
        <div className="tool-group snap-tools" role="group" aria-label="Snap to grid">
          <button type="button" aria-pressed={snap.on} onClick={() => setSnap({ on: !snap.on })} title="Hold Ctrl while dragging to do the opposite">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 4v8a6 6 0 0 0 12 0V4M6 8h4M14 8h4" />
            </svg>
            Snap to grid
          </button>
          <label className="sr-only" htmlFor="snap-step">Grid size</label>
          <select id="snap-step" value={snap.step} onChange={(e) => setSnap({ step: Number(e.target.value), on: true })}>
            {SNAP_STEPS.map((n) => <option key={n} value={n}>{n} ft</option>)}
          </select>
        </div>
        <button type="button" aria-pressed={showHeat} onClick={() => setShowHeat(!showHeat)}>Sun-hours map</button>
      </div>

      <div className="planner-sun" role="group" aria-label="Date and time for the sun">
        <div className="field">
          <label htmlFor="sun-date">Date</label>
          <input id="sun-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </div>
        <div className="chips">
          {quickDates(year).map(([label, d]) => (
            <button key={label} type="button" className="chip" aria-pressed={date === d} onClick={() => setDate(d)}>{label}</button>
          ))}
          <button type="button" className="chip" aria-pressed={date === today} onClick={() => setDate(null)}>Today</button>
        </div>
        <div className="field time-field">
          <label htmlFor="sun-time">
            Time: <b>{formatClock(localToUtc(date, minutes, tz), tz)}</b> · {sunLabel}
          </label>
          <input id="sun-time" type="range" min={0} max={1425} step={STEP_MINUTES} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-valuetext={formatClock(localToUtc(date, minutes, tz), tz)} />
          <p className="hint">Sunrise {formatClock(times.sunrise, tz)} · sunset {formatClock(times.sunset, tz)} · {times.dayHours.toFixed(1)} hours of daylight</p>
        </div>
      </div>

      <div className="planner-main">
        <ShadePalette garden={garden} selectedId={selectedId} onSelect={setSelectedId} onAdd={addObstacle} onAddItems={addObstacles} />
        <div className="scene-wrap">
          <GardenScene
            garden={garden}
            cropsById={cropsById}
            sun={sun}
            path={samples}
            heat={showHeat ? grid : null}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={moveItem}
            snapStep={snapStep}
            gridSize={snap.step}
            onDelete={deleteItem}
            view={view.mode}
            viewTick={view.n}
            label={sceneLabel}
          />
          {showHeat && (
            <div className="heat-legend" aria-label="Sun-hours map colors">
              <span><i style={{ background: "rgb(46 64 120)" }} />Shade (&lt;2 h)</span>
              <span><i style={{ background: "rgb(40 130 140)" }} />Part shade (2–4 h)</span>
              <span><i style={{ background: "rgb(230 200 70)" }} />Part sun (4–6 h)</span>
              <span><i style={{ background: "rgb(240 140 40)" }} />Full sun (6+ h)</span>
            </div>
          )}
          <details className="pmeta scene-help">
            <summary>Moving around (works like Blender)</summary>
            <ul>
              <li><b>Orbit:</b> drag empty ground, middle-drag, or Option/Alt + drag anywhere. On a trackpad, Option + two-finger swipe.</li>
              <li><b>Pan:</b> Shift + drag, right-drag, Shift + scroll, or drag the hand button.</li>
              <li><b>Zoom:</b> scroll, pinch, Ctrl + middle-drag, + and −, or drag the magnifier.</li>
              <li><b>Views</b> (click the yard first): 1 front, 3 right, 7 top, Option/Ctrl + 1 or 3 for back or left, 5 perspective or orthographic, 2 4 6 8 to orbit in steps, H to see the whole yard, F or . to zoom to the selected item. Or click an X, Y or Z ball in the corner.</li>
              <li><b>Axes:</b> X (red) runs across the plan, Y (green) toward the top of the plan, Z (blue) is up.</li>
              <li><b>Beds:</b> click one to select it, drag it to move it, arrow keys to nudge one grid square (Shift for five), Delete to remove.</li>
              <li><b>Snap to grid:</b> with it on, dragged and nudged items line their top-left corner up with the grid. Hold Ctrl while dragging to do the opposite. Positions you type in the editor are kept as typed.</li>
            </ul>
          </details>
        </div>
        <aside className="planner-panel" aria-label="Edit the plan">
          {selected?.kind === "bed" && (
            <BedEditor
              bed={selected}
              crops={crops}
              cropsById={cropsById}
              zone={location.zone}
              month={Number(date.slice(5, 7)) - 1}
              onChange={(patch) => patchItem(selected.id, patch)}
              onDelete={() => deleteItem(selected.id)}
              onClose={() => setSelectedId(null)}
              onAddNewCrop={() => setCropDialogFor(selected.id)}
            />
          )}
          {selected && selected.kind !== "bed" && (
            <ObstacleEditor item={selected} onChange={(patch) => patchItem(selected.id, patch)} onDelete={() => deleteItem(selected.id)} onClose={() => setSelectedId(null)} />
          )}
          {!selected && (
            <YardEditor
              garden={garden}
              // fitToYard moves beds and shade sources back inside when the yard gets smaller.
              onYard={(patch) => updateGarden((g) => fitToYard({ ...g, yard: { ...g.yard, ...patch } }))}
              onSelect={setSelectedId}
              onReset={() => {
                resetGarden();
                setSelectedId(null);
              }}
            />
          )}
        </aside>
      </div>

      <GardenReport
        garden={garden}
        crops={crops}
        cropsById={cropsById}
        grid={grid}
        times={times}
        date={date}
        location={location}
        customCrops={customCrops}
        onRemoveCrop={removeCrop}
        onSelect={setSelectedId}
      />

      <AddCropDialog
        open={!!cropDialogFor}
        bedName={garden.beds.find((b) => b.id === cropDialogFor)?.name || "this bed"}
        zone={location.zone}
        crops={crops}
        onClose={() => setCropDialogFor(null)}
        onAdd={(crop) => {
          if (!CATALOG.some((c) => c.id === crop.id)) saveCrop(crop);
          if (cropDialogFor) addCropToBed(cropDialogFor, crop.id);
          setCropDialogFor(null);
        }}
      />
    </section>
  );
}
