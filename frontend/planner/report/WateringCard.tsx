// The week's watering schedule: for each growing bed, how many gallons on which days. Out of season it
// says so instead.
import Card from "@/frontend/components/ui/Card";
import Hint from "@/frontend/components/ui/Hint";
import TableCard from "@/frontend/components/ui/TableCard";
import type { WateringPlan } from "../analysis";
import type { Bed } from "../model";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// The bed names down the side: row headings in body text, not the column headings' small capitals.
const ROW_HEADING = "bg-transparent font-body text-sm tracking-normal text-fg normal-case";

// A bed's schedule while it's growing (not dormant): which days, and how many gallons.
export type GrowingPlan = Extract<WateringPlan, { dormant: false }>;

type WateringCardProps = {
  monthName: string;
  active: { bed: Bed; p: GrowingPlan }[]; // beds with a growing-season schedule
  restingNote?: string; // what to do when nothing is growing (from a dormant plan)
};

export default function WateringCard({ monthName, active, restingNote }: WateringCardProps) {
  return (
    <Card className="grid content-start gap-2">
      <h3>Watering schedule for {monthName}</h3>
      {active.length > 0 ? (
        <>
          <p className="text-sm text-muted">Gallons per watering, by day</p>
          {/* Compact: tight cells, so the whole week fits the card. */}
          <TableCard fit>
            <table className="[&_:is(th,td)]:px-2">
              <caption className="sr-only">Gallons of water per bed for each day of the week</caption>
              <thead>
                <tr>
                  <th scope="col">Bed</th>
                  {DAYS.map((d) => (
                    <th key={d} scope="col">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.map(({ bed, p }) => (
                  <tr key={bed.id}>
                    <th scope="row" className={ROW_HEADING}>
                      {bed.name}
                    </th>
                    {DAYS.map((d) => (
                      <td key={d} className="text-center font-normal">
                        {p.days.includes(d) ? (
                          <span className="inline-block rounded-full bg-blue-soft px-2 py-0.5 text-xs font-bold whitespace-nowrap text-blue-ink" aria-label={`${p.gallonsPerSession} gallons`}>
                            {p.gallonsPerSession}
                          </span>
                        ) : (
                          <span aria-label="no watering">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </>
      ) : (
        <p>{restingNote || "Add crops to your beds to get a schedule."}</p>
      )}
      <Hint>Amounts count rain: skip a day after a soaking rain of ½ in or more. Check by pushing a finger 2 in into the soil.</Hint>
    </Card>
  );
}
