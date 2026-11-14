// The garden report under the 3D view: the sun on the chosen day and a week-at-a-glance watering schedule
// (side by side, the same height), then the Beds list (a row per bed; a row opens that bed's light, crops,
// companions and watering in a window), and the crops the reader added. On paper the list is swapped for
// every bed's full card, since a window can't be printed.
import { useMemo, useState } from "react";
import Callout from "@/frontend/components/ui/Callout";
import type { GardenLocation } from "@/frontend/lib/location";
import type { Crop } from "@/shared/crop";
import { bedCrops, companionReport, wateringPlan, type CropsById, type WateringPlan } from "../analysis";
import type { Bed, Garden } from "../model";
import type { SunGrid } from "../shade";
import type { SunTimes } from "../sun";
import BedCard from "./BedCard";
import BedDialog from "./BedDialog";
import BedList from "./BedList";
import { bedFacts } from "./bedFacts";
import CustomCropsCard from "./CustomCropsCard";
import SunCard from "./SunCard";
import WateringCard, { type GrowingPlan } from "./WateringCard";

type GardenReportProps = {
  garden: Garden;
  crops: Crop[]; // every crop the planner knows: stock plus added
  cropsById: CropsById;
  grid: SunGrid;
  times: SunTimes;
  date: string; // "2026-06-21"
  location: GardenLocation;
  customCrops: Crop[];
  onRemoveCrop: (id: string) => void;
  onSelect: (id: string) => void;
};

// The report's title, centered, with a short accent line under it a quarter of the title's width (the
// heading shrinks to its text, so after:w-1/4 measures against the words, not the page).
const TITLE = [
  "justify-self-center text-center text-xl",
  "after:mx-auto after:mt-2 after:block after:h-0.5 after:w-1/4 after:rounded-full after:bg-accent after:content-['']",
].join(" ");

// The sun and watering cards side by side when there's room for 20rem each, stretched to the same height.
const CARDS_20 = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-stretch gap-4";
// The printed bed cards: side by side when there's room for 24rem each, lined up at the top. Paper only.
const PRINT_CARDS = "hidden grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] items-start gap-4 print:grid";

// After "Edit this bed": brings the bed's editor into view and puts the cursor in its Name box.
// (The editor is the planner's "Edit the plan" panel, above the report.)
function goToEditor() {
  const editor = document.querySelector<HTMLElement>('[aria-label="Edit the plan"]');
  editor?.scrollIntoView({ block: "start" });
  editor?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
}

export default function GardenReport({ garden, crops, cropsById, grid, times, date, location, customCrops, onRemoveCrop, onSelect }: GardenReportProps) {
  const month = Number(date.slice(5, 7)) - 1;
  const companions = useMemo(() => companionReport(garden.beds, cropsById, crops), [garden.beds, cropsById, crops]);
  const plans = garden.beds.map((bed): [Bed, WateringPlan | null] => [bed, wateringPlan(bed, bedCrops(bed, cropsById), month, location.zone)]);
  // Beds with a growing-season schedule, for the week table.
  const active = plans.flatMap(([bed, p]): { bed: Bed; p: GrowingPlan }[] => (p && !p.dormant ? [{ bed, p }] : []));
  const facts = useMemo(
    () => Object.fromEntries(garden.beds.map((bed) => [bed.id, bedFacts(bed, cropsById, grid, companions[bed.id])])),
    [garden.beds, cropsById, grid, companions],
  );
  const [openId, setOpenId] = useState<string | null>(null); // the bed shown in the window
  const [editing, setEditing] = useState<string | null>(null); // set by "Edit this bed": go there once the window has faded
  const openBed = garden.beds.find((b) => b.id === openId);
  const monthName = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return (
    <section className="grid gap-6" aria-labelledby="report-title">
      <h2 id="report-title" className={TITLE}>
        Garden report
      </h2>
      <div className={CARDS_20}>
        <SunCard times={times} location={location} date={date} />
        <WateringCard monthName={monthName} active={active} restingNote={plans.find(([, p]) => p?.dormant)?.[1]?.text} />
      </div>
      {garden.beds.length === 0 && (
        // Kept to a paragraph's width.
        <Callout tone="blue" title="No beds yet" className="max-w-[68ch]">
          {" "}
          Add a raised or in-ground bed from “Add to the yard” to start.
        </Callout>
      )}
      {garden.beds.length > 0 && <BedList beds={garden.beds.map((bed) => ({ bed, facts: facts[bed.id] }))} onOpen={setOpenId} />}
      <div className={PRINT_CARDS}>
        {garden.beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} facts={facts[bed.id]} companions={companions[bed.id]} zone={location.zone} month={month} />
        ))}
      </div>
      <BedDialog
        open={!!openBed}
        shown={openBed ? { bed: openBed, facts: facts[openBed.id], companions: companions[openBed.id] } : null}
        zone={location.zone}
        month={month}
        onEdit={setEditing}
        onClose={() => {
          setOpenId(null);
          if (editing) {
            onSelect(editing);
            setEditing(null);
            requestAnimationFrame(goToEditor); // after the editor for the newly selected bed has rendered
          }
        }}
      />
      <CustomCropsCard crops={customCrops} onRemove={onRemoveCrop} />
    </section>
  );
}
