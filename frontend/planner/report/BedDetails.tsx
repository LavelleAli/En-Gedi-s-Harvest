// The body of a bed's report, shared by the bed window and the printed card: each crop's report, the
// companion notes and the watering. A bed with no crops offers to edit it so crops can be added.
import Button from "@/frontend/components/ui/Button";
import { wateringPlan, type CompanionResult } from "../analysis";
import type { Bed } from "../model";
import BedCompanions from "./BedCompanions";
import type { BedFacts } from "./bedFacts";
import CropReport from "./CropReport";

type BedDetailsProps = {
  bed: Bed;
  facts: BedFacts;
  companions: CompanionResult;
  zone: string;
  month: number;
  onEdit: () => void;
};

export default function BedDetails({ bed, facts, companions, zone, month, onEdit }: BedDetailsProps) {
  const water = wateringPlan(bed, facts.crops, month, zone);
  return (
    <>
      {facts.crops.length === 0 ? (
        <p>
          No crops yet.{" "}
          <Button variant="link" onClick={onEdit}>
            Edit this bed
          </Button>{" "}
          to add some.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {facts.crops.map((crop) => (
            <CropReport key={crop.id} crop={crop} bed={bed} sunHours={facts.hours} cropsInBed={facts.crops.length} zone={zone} />
          ))}
        </ul>
      )}
      <BedCompanions pairs={companions} />
      {water && (
        <div className="grid content-start gap-2">
          <h4>Watering</h4>
          <p>{water.text}</p>
        </div>
      )}
    </>
  );
}
