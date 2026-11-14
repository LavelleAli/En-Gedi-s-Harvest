// Outside zone 8a: a note saying the calendar has been shifted, and by how much.
import { describeShift, zoneShift } from "@/shared/zones";

// The shift is least reliable in the coldest and the frost-free zones.
const ROUGH = /^(1|2|3|4|10|11|12|13)[ab]$/;

export default function ZoneNote({ zone }: { zone: string }) {
  if (zone === "8a") return null;
  const shift = zoneShift(zone);
  return (
    <p className="max-w-[72ch]">
      Adjusted for zone {zone}. Compared with zone 8a, where this calendar was written, spring work runs {describeShift(shift.spring)} and fall
      work {describeShift(shift.fall)}.
      {ROUGH.test(zone) ? " Dates this far from zone 8a are rough, so go by your local frost dates and extension service." : ""}
    </p>
  );
}
