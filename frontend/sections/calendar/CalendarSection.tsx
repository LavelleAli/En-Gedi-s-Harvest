"use client";

// The calendar page: the whole year for the reader's zone in one table, starting with January.
// The calendar is written for zone 8a and shifted by the zone's frost dates (frontend/data/calendar.ts).
import { useMemo } from "react";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import TableCard from "@/frontend/components/ui/TableCard";
import { MONTHS, shiftedCalendar } from "@/frontend/data/calendar";
import { useLocation } from "@/frontend/lib/location";
import { zoneShift } from "@/shared/zones";
import CalendarRow from "./CalendarRow";
import FrostLead from "./FrostLead";
import Page from "@/frontend/components/ui/Page";

export default function CalendarSection() {
  const { zone, place } = useLocation();
  const calendar = useMemo(() => shiftedCalendar(zoneShift(zone)), [zone]);
  return (
    <Page>
      <SectionHeader kicker={<>Twelve months · zone {zone}</>} title="Planting and harvest calendar" lead={<FrostLead zone={zone} place={place} />} />
      <TableCard data-tour="calendar">
        <table>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Plant or sow</th>
              <th scope="col">Harvest</th>
              <th scope="col">Other tasks</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((name, m) => (
              <CalendarRow key={name} month={name} plant={calendar[m][0]} harvest={calendar[m][1]} tasks={calendar[m][2]} />
            ))}
          </tbody>
        </table>
      </TableCard>
    </Page>
  );
}
