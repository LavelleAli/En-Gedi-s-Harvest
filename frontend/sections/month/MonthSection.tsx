"use client";

// The home page: what to do in the garden this month. A year calendar to pick a month (right on wide
// screens, sticky; above the list on phones), that month's checklists, crops to plant now, and a tip.
import { useMemo, useState, useSyncExternalStore } from "react";
import Callout from "@/frontend/components/ui/Callout";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { MONTHS, shiftedCalendar } from "@/frontend/data/calendar";
import { useLocation } from "@/frontend/lib/location";
import { monthChecklist, useTodos } from "@/frontend/lib/todos";
import { zoneShift } from "@/shared/zones";
import ChecklistPacket from "./ChecklistPacket";
import ChecklistSummary from "./ChecklistSummary";
import Suggestions from "./Suggestions";
import YearCalendar from "./YearCalendar";
import ZoneNote from "./ZoneNote";
import { countDone } from "./progress";
import Page from "@/frontend/components/ui/Page";

// Two columns from 48rem: the checklists, and the calendar in a 17–21rem column on the right.
const LAYOUT = "grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_clamp(17rem,30vw,21rem)] md:gap-x-8";

// useSyncExternalStore needs a subscribe function; the month doesn't change while the page is open.
const noop = () => () => {};
const currentMonth = () => new Date().getMonth();

export default function MonthSection() {
  // The static build renders November; the browser swaps in the real current month.
  const today = useSyncExternalStore(noop, currentMonth, () => 10);
  const [picked, setMonth] = useState<number | null>(null);
  const month = picked ?? today;
  const { done, toggle, clearMonth } = useTodos();
  const { zone } = useLocation();

  // The calendar is written for zone 8a; other zones get it shifted by their frost dates.
  const all = useMemo(() => {
    const calendar = shiftedCalendar(zoneShift(zone));
    return MONTHS.map((_, m) => monthChecklist(m, calendar));
  }, [zone]);
  const groups = all[month];
  const isEmpty = groups.every((g) => g.items.length === 0);
  const progress = useMemo(() => countDone(groups, done), [groups, done]);

  return (
    <Page>
      <SectionHeader kicker="What to do now" title={<>{month === today ? "This month: " : ""}{MONTHS[month]}</>} />
      <ZoneNote zone={zone} />
      {/* The calendar comes first in the page so phones show it above the list; wide screens move it right. */}
      <div className={LAYOUT}>
        <div className="md:sticky md:top-20 md:col-start-2 md:row-start-1">
          <YearCalendar all={all} month={month} today={today} done={done} onPick={setMonth} />
        </div>
        <div className="grid min-w-0 gap-6 md:col-start-1 md:row-start-1">
          <ChecklistSummary monthName={MONTHS[month]} progress={progress} onClear={() => clearMonth(month)} />
          {isEmpty ? (
            <Callout tone="blue" title={`A quiet month in zone ${zone}`}>
              <p>Nothing to plant or pick outdoors. Clean and sharpen tools, plan next year&apos;s beds in the garden planner, and order seeds.</p>
            </Callout>
          ) : (
            <div className="grid gap-4">
              {groups
                .filter((g) => g.items.length)
                .map((g) => (
                  <ChecklistPacket key={g.id} group={g} done={done} onToggle={toggle} />
                ))}
            </div>
          )}
          <Suggestions zone={zone} month={month} />
          <Callout tone="yellow" title="Keep the harvest steady">
            <p>
              Sow a short row of lettuce, radishes, squash or beans every 2–3 weeks while each is in season, and put a new crop into each bed the
              week the old one comes out.
            </p>
          </Callout>
        </div>
      </div>
    </Page>
  );
}
