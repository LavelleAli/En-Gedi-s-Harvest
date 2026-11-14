// The facts shown about a bed wherever it appears in the report (the Beds list, the bed window, the
// printed card): its kind and size, its sun hours and light, its crops, and how many things need a look
// (crops short of sun, crops that shouldn't share the bed, clashes with a bed close by).
import { bedCrops, sunFit, type CompanionResult, type CropsById } from "../analysis";
import type { Bed } from "../model";
import { bedSunHours, lightClass, type LightClass, type SunGrid } from "../shade";
import type { BadgeTone } from "./Badge";
import type { Crop } from "@/shared/crop";

// Each light category's badge color.
export const LIGHT_TONE: Record<LightClass["id"], BadgeTone> = { full: "yellow", "part-sun": "green", "part-shade": "blue", shade: "quiet" };

export type BedFacts = { kind: string; size: string; hours: number; light: LightClass; crops: Crop[]; problems: number };

export function bedFacts(bed: Bed, cropsById: CropsById, grid: SunGrid, companions: CompanionResult): BedFacts {
  const crops = bedCrops(bed, cropsById);
  const hours = bedSunHours(bed, grid).avg;
  const short = crops.filter((c) => sunFit(hours, c).level === "poor").length;
  return {
    kind: bed.type === "raised" ? `Raised bed, ${Math.round(bed.h * 12)} in deep` : "In-ground bed",
    size: `${bed.w} × ${bed.d} ft (${Math.round(bed.w * bed.d)} sq ft)`,
    hours,
    light: lightClass(hours),
    crops,
    problems: short + companions.bad.length + companions.nearby.length,
  };
}
