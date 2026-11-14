// One bed's full report as a card. Only printed: on screen the report lists the beds (BedList) and opens
// each one in a window (BedDialog), but paper can't open a window, so the printout keeps every card.
import Card from "@/frontend/components/ui/Card";
import type { CompanionResult } from "../analysis";
import type { Bed } from "../model";
import Badge from "./Badge";
import BedDetails from "./BedDetails";
import { LIGHT_TONE, type BedFacts } from "./bedFacts";

type BedCardProps = { bed: Bed; facts: BedFacts; companions: CompanionResult; zone: string; month: number };

export default function BedCard({ bed, facts, companions, zone, month }: BedCardProps) {
  return (
    // "bed-card" is a test hook.
    <Card as="article" className="bed-card grid content-start gap-4" aria-labelledby={`bed-${bed.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={`bed-${bed.id}`}>{bed.name}</h3>
          <p>
            {facts.kind} · {facts.size}
          </p>
        </div>
        <Badge tone={LIGHT_TONE[facts.light.id]}>
          {facts.light.label} · {facts.hours.toFixed(1)} h
        </Badge>
      </header>
      {/* On paper there's nothing to click, so no edit link is needed. */}
      <BedDetails bed={bed} facts={facts} companions={companions} zone={zone} month={month} onEdit={() => {}} />
    </Card>
  );
}
