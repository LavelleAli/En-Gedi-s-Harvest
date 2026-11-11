"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { MONTHS, shiftedCalendar } from "@/frontend/data/calendar";
import { useLocation } from "@/frontend/lib/location";
import { describeShift, zoneShift } from "@/shared/zones";
import { monthChecklist, useTodos, type ChecklistGroup, type ChecklistItem, type Done } from "@/frontend/lib/todos";
import { CATALOG } from "@/shared/catalog";
import { suggestionsFor, windowText } from "@/shared/planting";
import Link from "next/link";

const count = (groups: ChecklistGroup[], done: Done) => {
  const keys = groups.flatMap((g) => g.items.map((i) => i.key));
  return { done: keys.filter((k) => done[k]).length, total: keys.length };
};

// Twelve month tiles; each is a radio button, so arrow keys move between months.
type YearCalendarProps = { all: ChecklistGroup[][]; month: number; today: number; done: Done; onPick: (month: number) => void };

function YearCalendar({ all, month, today, done, onPick }: YearCalendarProps) {
  return (
    <fieldset className="yearcal noprint">
      <legend className="sr-only">Pick a month</legend>
      <div className="yearcal-grid">
        {MONTHS.map((name, m) => {
          const c = count(all[m], done);
          const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
          const complete = c.total > 0 && c.done === c.total;
          return (
            <label key={name} className={`mtile${m === today ? " is-now" : ""}${complete ? " is-done" : ""}`}>
              <input type="radio" name="month" className="sr-only" checked={m === month} onChange={() => onPick(m)} />
              {/* One clean name for screen readers, e.g. "March, 3 of 10 done, this month" */}
              <span className="sr-only">
                {`${name}, ${c.done} of ${c.total} done${m === today ? ", this month" : ""}`}
              </span>
              <span className="mtile-top" aria-hidden="true">
                <span className="mtile-name">{name.slice(0, 3)}</span>
                {m === today && <span className="mtile-now">Now</span>}
              </span>
              <span className="mtile-count" aria-hidden="true">{complete ? "✓ Done" : `${c.done}/${c.total}`}</span>
              <span className="mtile-bar" aria-hidden="true">
                <span style={{ inlineSize: `${pct}%` }} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChecklistPacket({ group, done, onToggle }: { group: ChecklistGroup; done: Done; onToggle: (key: string) => void }) {
  const c = count([group], done);
  return (
    <div className={`packet ${group.tone}`}>
      <header>
        <h3>{group.title}</h3>
        <span className="mono">
          <span aria-hidden="true">{c.done}/{c.total}</span>
          <span className="sr-only">{c.done} of {c.total} done</span>
        </span>
      </header>
      <div className="body">
        <ul className="todo">
          {group.items.map((item: ChecklistItem) => (
            <li key={item.key}>
              <label>
                <input type="checkbox" checked={!!done[item.key]} onChange={() => onToggle(item.key)} />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Crops whose planting window in this zone overlaps the month, from the stock catalog.
function Suggestions({ zone, month }: { zone: string; month: number }) {
  const list = useMemo(() => suggestionsFor(zone, month, CATALOG), [zone, month]);
  return (
    <section className="card stack-sm suggestions" aria-labelledby="suggest-title">
      <h3 id="suggest-title">Plant now in zone {zone}</h3>
      {list.length === 0 ? (
        <p className="pmeta">No outdoor planting windows open in {MONTHS[month]} for zone {zone}. Start seeds indoors, plan beds, and order seed.</p>
      ) : (
        <ul className="suggest-list">
          {list.slice(0, 12).map(({ crop, window, method, fit }) => (
            <li key={crop.id}>
              <b>{crop.name}</b>
              <span className="pmeta">{method} · {window.season === "spring" ? "spring" : "fall"} window {windowText(window)}</span>
              {!fit.ok && <span className="pmeta">Needs a head start indoors in your short season.</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="pmeta">
        {list.length > 12 ? `${list.length - 12} more in the ` : "Details in the "}
        <Link href="/plants/">plant encyclopedia</Link>. Lay out beds in the <Link href="/planner/">garden planner</Link>.
      </p>
    </section>
  );
}

const noop = () => () => {};
const currentMonth = () => new Date().getMonth();

export default function MonthSection() {
  // The static build renders November; the browser swaps in the real current month.
  const today = useSyncExternalStore(noop, currentMonth, () => 10);
  const [picked, setMonth] = useState<number | null>(null);
  const month = picked ?? today;
  const { done, toggle, clearMonth } = useTodos();
  const location = useLocation();

  // The calendar is written for zone 8a; other zones get it shifted by their frost dates.
  const shift = zoneShift(location.zone);
  const all = useMemo(() => {
    const calendar = shiftedCalendar(zoneShift(location.zone));
    return MONTHS.map((_, m) => monthChecklist(m, calendar));
  }, [location.zone]);
  const groups = all[month];
  const isEmpty = groups.every((g) => g.items.length === 0);
  // The shift is least reliable in the coldest and the frost-free zones.
  const roughZone = /^(1|2|3|4|10|11|12|13)[ab]$/.test(location.zone);
  const total = useMemo(() => count(groups, done), [groups, done]);
  const pct = total.total ? Math.round((total.done / total.total) * 100) : 0;

  return (
    <section className="view">
      <div>
        <div className="kicker">What to do now</div>
        <h2>{month === today ? "This month: " : ""}{MONTHS[month]}</h2>
      </div>
      {location.zone !== "8a" && (
        <p className="pmeta zone-note">
          Adjusted for zone {location.zone}. Compared with zone 8a, where this calendar was written, spring work runs{" "}
          {describeShift(shift.spring)} and fall work {describeShift(shift.fall)}.
          {roughZone ? " Dates this far from zone 8a are rough, so go by your local frost dates and extension service." : ""}
        </p>
      )}
      {/* Calendar comes first in the DOM so phones show it above the list; wide screens move it to the right. */}
      <div className="month-layout">
        <div className="month-cal">
          <YearCalendar all={all} month={month} today={today} done={done} onPick={setMonth} />
        </div>
        <div className="month-main">
          <div className="todo-summary">
            <div className="todo-progress">
              <p>
                <b>{total.done} of {total.total} done</b> in {MONTHS[month]}
              </p>
              <span className="mtile-bar" aria-hidden="true">
                <span style={{ inlineSize: `${pct}%` }} />
              </span>
            </div>
            <button type="button" className="noprint" disabled={total.done === 0} onClick={() => clearMonth(month)}>
              Clear {MONTHS[month]}
            </button>
          </div>
          {isEmpty ? (
            <div className="callout b">
              <strong>A quiet month in zone {location.zone}</strong>
              <p>Nothing to plant or pick outdoors. Clean and sharpen tools, plan next year&apos;s beds in the garden planner, and order seeds.</p>
            </div>
          ) : (
            <div className="trio">
              {groups.filter((g) => g.items.length).map((g) => (
                <ChecklistPacket key={g.id} group={g} done={done} onToggle={toggle} />
              ))}
            </div>
          )}
          <Suggestions zone={location.zone} month={month} />
          <div className="callout y">
            <strong>Keep the harvest steady</strong>
            <p>Sow a short row of lettuce, radishes, squash or beans every 2–3 weeks while each is in season, and put a new crop into each bed the week the old one comes out.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
