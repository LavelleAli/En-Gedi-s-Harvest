// One crop in a bed's report: its name, how many plants fit, whether the bed's light suits it, and its
// planting notes for the zone.
import type { Crop } from "@/shared/crop";
import { KIND_LABEL } from "@/shared/crop";
import { plantCount, plantingNotes, sunFit, type SunFit } from "../analysis";
import type { Bed } from "../model";
import Badge, { type BadgeTone } from "./Badge";

const FIT: Record<SunFit["level"], { label: string; tone: BadgeTone }> = {
  good: { label: "Good light", tone: "green" },
  ok: { label: "Part shade OK", tone: "yellow" },
  poor: { label: "Too shady", tone: "red" },
};

type CropReportProps = { crop: Crop; bed: Bed; sunHours: number; cropsInBed: number; zone: string };

export default function CropReport({ crop, bed, sunHours, cropsInBed, zone }: CropReportProps) {
  const fit = sunFit(sunHours, crop);
  return (
    <li className="grid content-start gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <b>{crop.name}</b>
        <span>
          {KIND_LABEL[crop.kind]} · about {plantCount(bed, crop, cropsInBed)} plants · {crop.spacingIn} in apart
        </span>
        <Badge tone={FIT[fit.level].tone} title={fit.text}>
          {FIT[fit.level].label}
        </Badge>
      </div>
      {fit.level !== "good" && <p>{fit.text}.</p>}
      <ul className="m-0 grid gap-1 ps-[1.1rem] text-sm">
        {plantingNotes(crop, bed, zone).map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>{crop.how}</li>
        {crop.zoneNote && <li>Zone note: {crop.zoneNote}</li>}
      </ul>
    </li>
  );
}
