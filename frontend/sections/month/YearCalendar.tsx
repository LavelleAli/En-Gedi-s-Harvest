// The year at a glance: twelve month tiles. They're radio buttons, so the arrow keys move between
// months. The grid sizes itself to the space it gets (a container query), not the window: 3 across
// in the narrow column, 4 or 6 when it has more room. Hidden when printing.
import { MONTHS } from "@/frontend/data/calendar";
import type { ChecklistGroup, Done } from "@/frontend/lib/todos";
import MonthTile from "./MonthTile";
import { countDone } from "./progress";

type YearCalendarProps = {
  all: ChecklistGroup[][]; // each month's checklist groups
  month: number; // the chosen month, 0–11
  today: number; // the current month
  done: Done;
  onPick: (month: number) => void;
};

export default function YearCalendar({ all, month, today, done, onPick }: YearCalendarProps) {
  return (
    <fieldset className="@container m-0 min-w-0 rounded-lg border border-line bg-surface p-2 print:hidden" data-tour="months">
      <legend className="sr-only">Pick a month</legend>
      <div className="grid grid-cols-3 gap-2 @lg:grid-cols-4 @3xl:grid-cols-6">
        {MONTHS.map((name, m) => (
          <MonthTile key={name} name={name} progress={countDone(all[m], done)} chosen={m === month} now={m === today} onPick={() => onPick(m)} />
        ))}
      </div>
    </fieldset>
  );
}
