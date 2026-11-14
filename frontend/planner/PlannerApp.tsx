"use client";

// The garden planner page: a 3D yard (three.js) with beds and shade sources, a panel to edit them,
// sun controls for any date and time, and a report on sun, companions, planting and watering.
import { useMemo, useState, useSyncExternalStore } from "react";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { useLocation } from "@/frontend/lib/location";
import { CATALOG } from "@/shared/catalog";
import type { Crop } from "@/shared/crop";
import AddCropDialog from "./addcrop/AddCropDialog";
import type { CropsById } from "./analysis";
import SunControls from "./controls/SunControls";
import { todayString } from "./dates";
import EditPanel from "./editors/EditPanel";
import { fitToYard, useCustomCrops, useGarden, useSnap } from "./model";
import AddPanel from "./palette/AddPanel";
import YardItems from "./palette/YardItems";
import GardenReport from "./report/GardenReport";
import SceneArea from "./scene/SceneArea";
import { sunHoursGrid } from "./shade";
import { compassPoint, daySamples, localToUtc, sunPosition, sunTimes } from "./sun";
import { useGardenActions } from "./useGardenActions";
import Page from "@/frontend/components/ui/Page";

const STEP_MINUTES = 15; // the sun is sampled every 15 minutes for the day's path and the sun-hours map
const noop = () => () => {};

// The layout follows the planner's own width (a container query on the wrapper), not the window's:
//   narrow    stacked: Add to the yard, Sun and shade, the sandbox, the editor, In this yard
//   42rem+    Add to the yard and Sun and shade side by side on top; the sandbox across the full width;
//             the editor (left) and In this yard side by side under it. The two panels in a row are
//             always the same height (the taller one sets it); their contents stay at the top.
//   windows 111rem+ (room beside the page column): Sun and shade fills the empty space left of the sandbox
//             and Add to the yard the space right of it, both as tall as the sandbox (SIDE_PANEL). The
//             sandbox keeps the column's width: the grid reaches out by one side column + gap on each side.
// The sandbox is never smaller than 300px across. Paper: just the report.
const LAYOUT = [
  "grid items-start gap-4 [grid-template-areas:'add'_'sun'_'scene'_'edit'_'items']",
  "@2xl:grid-cols-2 @2xl:items-stretch @2xl:[grid-template-areas:'add_sun'_'scene_scene'_'edit_items']",
  // Beside the sandbox: four columns (side, half, half, side) and the grid widened past the column on both sides.
  // A side column is half the space beside the 69rem column (after the 5.75rem sidebar), less a 1rem gap and 1rem edge.
  // (Marked ! because Tailwind writes container-query rules after window ones, so @2xl would win otherwise.)
  "min-[111rem]:grid-cols-[calc((100vw-74.75rem)/2-2rem)_minmax(0,1fr)_minmax(0,1fr)_calc((100vw-74.75rem)/2-2rem)]!",
  "min-[111rem]:[grid-template-areas:'sun_scene_scene_add'_'._edit_items_.']!",
  "min-[111rem]:mx-[calc((100vw-74.75rem)/-2+1rem)]",
  "print:block",
].join(" ");

export default function PlannerApp() {
  const [garden, updateGarden, resetGarden] = useGarden();
  const [customCrops, saveCrop, removeCrop] = useCustomCrops();
  const location = useLocation();
  const today = useSyncExternalStore(noop, todayString, () => "2026-06-21");
  const [pickedDate, setDate] = useState<string | null>(null);
  const date = pickedDate ?? today;
  const [minutes, setMinutes] = useState(13 * 60);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The camera buttons. `n` counts presses, so pressing Top again after orbiting resets the view.
  const [view, setView] = useState<{ mode: "3d" | "top"; n: number }>({ mode: "3d", n: 0 });
  const [showHeat, setShowHeat] = useState(false);
  const [snap, setSnap] = useSnap();
  const snapStep = snap.on ? snap.step : 0; // 0 = no grid snapping (positions still round to 0.5 ft)
  const [cropDialogFor, setCropDialogFor] = useState<string | null>(null); // the bed the Add a crop window adds to
  const actions = useGardenActions(garden, updateGarden, setSelectedId, snapStep);

  const crops = useMemo((): Crop[] => [...CATALOG, ...customCrops.filter((c) => !CATALOG.some((s) => s.id === c.id))], [customCrops]);
  const cropsById = useMemo((): CropsById => Object.fromEntries(crops.map((c) => [c.id, c])), [crops]);

  const { lat, lon, tz } = location;
  const times = useMemo(() => sunTimes(date, lat, lon, tz), [date, lat, lon, tz]);
  const samples = useMemo(() => daySamples(date, lat, lon, tz, STEP_MINUTES), [date, lat, lon, tz]);
  const sun = useMemo(() => sunPosition(localToUtc(date, minutes, tz), lat, lon), [date, minutes, lat, lon, tz]);
  const shadeKey = JSON.stringify([garden.yard, garden.obstacles]);
  // Recomputed only when the yard, its shade sources, the date or the location change.
  const grid = useMemo(() => sunHoursGrid(garden, samples, STEP_MINUTES), [shadeKey, samples]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = [...garden.beds, ...garden.obstacles].find((i) => i.id === selectedId) || null;
  const sunLabel = sun.altitude > 0 ? `Sun ${Math.round(sun.altitude)}° up in the ${compassPoint(sun.azimuth)}` : "Sun below the horizon";
  const sceneLabel = `3D view of the yard, ${garden.yard.w} by ${garden.yard.d} feet, with ${garden.beds.length} beds. ${sunLabel}. ${
    selected ? `${selected.name} is selected: arrow keys move it, R turns it, Delete removes it, Escape deselects.` : "Select an item in the panel or click it to move it."
  }`;

  return (
    <Page>
      <SectionHeader
        kicker="Plan your beds"
        title="Garden planner"
        lead={
          <>
            Lay out raised and in-ground beds, add the house, trees and fences that shade your yard, and pick crops for each bed. The planner
            traces the sun for zone {location.zone} at {location.place} and reports sun hours, companion plants, planting steps and a watering
            schedule. Your plan is saved in this browser.
          </>
        }
      />

      <div className="@container">
        <div className={LAYOUT}>
          <AddPanel
            garden={garden}
            selectedId={selectedId}
            onAddBed={actions.addBed}
            onAdd={actions.addObstacle}
            onAddItems={actions.addObstacles}
          />
          <SceneArea
            onView={(mode) => setView((v) => ({ mode, n: v.n + 1 }))}
            garden={garden}
            cropsById={cropsById}
            sun={sun}
            path={samples}
            heat={showHeat ? grid : null}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={actions.moveItem}
            snapStep={snapStep}
            gridSize={snap.step}
            onDelete={actions.deleteItem}
            onRotate={actions.rotateItem}
            view={view.mode}
            viewTick={view.n}
            label={sceneLabel}
          />
          <YardItems garden={garden} selectedId={selectedId} onSelect={setSelectedId} onAddItems={actions.addObstacles} />
          <SunControls
            date={date}
            today={today}
            onDate={setDate}
            minutes={minutes}
            onMinutes={setMinutes}
            tz={tz}
            times={times}
            sunLabel={sunLabel}
            showHeat={showHeat}
            onHeat={setShowHeat}
          />
          <EditPanel
            garden={garden}
            selected={selected}
            crops={crops}
            cropsById={cropsById}
            zone={location.zone}
            month={Number(date.slice(5, 7)) - 1}
            onPatch={actions.patchItem}
            onDelete={actions.deleteItem}
            onSelect={setSelectedId}
            onAddNewCrop={setCropDialogFor}
            // fitToYard moves beds and shade sources back inside when the yard gets smaller.
            onYard={(patch) => updateGarden((g) => fitToYard({ ...g, yard: { ...g.yard, ...patch } }))}
            onReset={() => {
              resetGarden();
              setSelectedId(null);
            }}
            snap={snap}
            onSnap={setSnap}
          />
        </div>
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
          if (cropDialogFor) actions.addCropToBed(cropDialogFor, crop.id);
          setCropDialogFor(null);
        }}
      />
    </Page>
  );
}
