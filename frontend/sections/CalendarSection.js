"use client";

import { useMemo } from "react";
import { MONTHS, shiftedCalendar } from "@/frontend/data/calendar";
import { useLocation } from "@/frontend/lib/location";
import { formatDay, frostDays, isFrostFree, zoneShift } from "@/shared/zones";

const join = (items) => (items.length ? items.join(", ") : "—");

// The year's calendar for the reader's zone, starting with January.
export default function CalendarSection() {
  const { zone, place } = useLocation();
  const calendar = useMemo(() => shiftedCalendar(zoneShift(zone)), [zone]);
  const [spring, fall] = frostDays(zone);
  return (
    <section className="view">
      <div>
        <div className="kicker">Twelve months · zone {zone}</div>
        <h2>Planting and harvest calendar</h2>
      </div>
      <p className="lead">
        {isFrostFree(zone)
          ? `Zone ${zone} rarely or never freezes, so the main growing season for cool crops runs through fall, winter and spring.`
          : `In zone ${zone} the last spring frost averages around ${formatDay(spring)} and the first fall frost around ${formatDay(fall)}.`}{" "}
        Local dates vary by a few weeks{place ? ` around ${place}` : ""}, so check the forecast before setting out tender plants.
      </p>
      <div className="tbl">
        <table className="cal">
          <thead>
            <tr><th scope="col">Month</th><th scope="col">Plant or sow</th><th scope="col">Harvest</th><th scope="col">Other tasks</th></tr>
          </thead>
          <tbody>
            {MONTHS.map((name, m) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{join(calendar[m][0])}</td>
                <td>{join(calendar[m][1])}</td>
                <td>{join(calendar[m][2])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
