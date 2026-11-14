// The calendar page's opening sentence: the zone's average frost dates (or that it rarely freezes),
// and a reminder that local dates vary.
import { formatDay, frostDays, isFrostFree } from "@/shared/zones";

export default function FrostLead({ zone, place }: { zone: string; place?: string }) {
  const [spring, fall] = frostDays(zone);
  return (
    <>
      {isFrostFree(zone)
        ? `Zone ${zone} rarely or never freezes, so the main growing season for cool crops runs through fall, winter and spring.`
        : `In zone ${zone} the last spring frost averages around ${formatDay(spring)} and the first fall frost around ${formatDay(fall)}.`}{" "}
      Local dates vary by a few weeks{place ? ` around ${place}` : ""}, so check the forecast before setting out tender plants.
    </>
  );
}
