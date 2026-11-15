// "Beds": every bed in the plan as one list, a row each (BedRow). A row opens that bed's full report in a
// window (BedDialog). Not printed: the printout has every bed's card instead (GardenReport).
import Card from "@/frontend/components/ui/Card";
import type { Bed } from "../model";
import type { BedFacts } from "./bedFacts";
import BedRow from "./BedRow";

type BedListProps = { beds: { bed: Bed; facts: BedFacts }[]; onOpen: (id: string) => void };

export default function BedList({ beds, onOpen }: BedListProps) {
  return (
    <Card as="section" className="grid content-start gap-2 print:hidden" aria-labelledby="bed-list-title">
      <h3 id="bed-list-title">
        Beds <span className="font-normal text-muted">({beds.length})</span>
      </h3>
      {/* Hairlines between rows; the row buttons fill the card's width. Past about six beds the list scrolls
          inside the card; it's focusable so it scrolls from the keyboard too. */}
      <ul
        className="-mx-3 m-0 grid max-h-[26rem] list-none divide-y divide-line overflow-y-auto overscroll-contain p-0"
        tabIndex={0}
        aria-label="Beds, scrolls"
      >
        {beds.map(({ bed, facts }) => (
          <li key={bed.id} className="py-0.5">
            <BedRow bed={bed} facts={facts} onOpen={() => onOpen(bed.id)} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
