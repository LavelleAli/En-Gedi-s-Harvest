"use client";

import { useState, useSyncExternalStore } from "react";
import { MONTHS, CAL, ORDER } from "@/lib/calendar";

// Splits "A, B (x, y); C" into ["A", "B (x, y)", "C"].
function items(text) {
  return text.split(/;\s*|,\s*(?![^()]*\))/).map((s) => s.trim()).filter(Boolean);
}

function Packet({ tone, title, tag, text }) {
  return (
    <div className={`packet ${tone}`}>
      <header>
        <h3>{title}</h3>
        <span className="mono">{tag}</span>
      </header>
      <div className="body">
        <ul>{items(text).map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </div>
  );
}

const noop = () => () => {};
const currentMonth = () => new Date().getMonth();

export default function MonthSection() {
  // The static build renders November; the browser swaps in the real current month.
  const today = useSyncExternalStore(noop, currentMonth, () => 10);
  const [picked, setMonth] = useState(null);
  const month = picked ?? today;

  const [plant, harvest, tasks] = CAL[month];
  return (
    <section className="view">
      <div>
        <div className="kicker">What to do now</div>
        <h2>{month === today ? "This month: " : ""}{MONTHS[month]}</h2>
      </div>
      <div className="months" role="group" aria-label="Pick a month">
        {ORDER.map((m) => (
          <button key={m} type="button" aria-pressed={m === month} onClick={() => setMonth(m)}>
            {MONTHS[m].slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="trio">
        <Packet tone="g" title="Plant or sow" tag={MONTHS[month].slice(0, 3).toUpperCase()} text={plant} />
        <Packet tone="y" title="Harvest" tag="PICK" text={harvest} />
        <Packet tone="k" title="Other tasks" tag="DO" text={tasks} />
      </div>
      <div className="callout y">
        <strong>Keep the harvest steady</strong>
        <p>Sow a short row of lettuce, radishes, squash or beans every 2–3 weeks while each is in season, and put a new crop into each bed the week the old one comes out.</p>
      </div>
    </section>
  );
}
