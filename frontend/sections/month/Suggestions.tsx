// "Plant now in zone X": stock crops whose planting window in this zone is open this month, up to 12.
import { useMemo } from "react";
import Link from "next/link";
import Card from "@/frontend/components/ui/Card";
import { MONTHS } from "@/frontend/data/calendar";
import { CATALOG } from "@/shared/catalog";
import { suggestionsFor, windowText } from "@/shared/planting";

const SHOWN = 12;

export default function Suggestions({ zone, month }: { zone: string; month: number }) {
  const list = useMemo(() => suggestionsFor(zone, month, CATALOG), [zone, month]);
  return (
    <Card as="section" className="grid content-start gap-2" aria-labelledby="suggest-title" data-tour="suggestions">
      <h3 id="suggest-title">Plant now in zone {zone}</h3>
      {list.length === 0 ? (
        <p>No outdoor planting windows open in {MONTHS[month]} for zone {zone}. Start seeds indoors, plan beds, and order seed.</p>
      ) : (
        // As many 15rem columns as fit, each crop underlined by a hairline.
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-x-4 gap-y-2 p-0">
          {list.slice(0, SHOWN).map(({ crop, window, method, fit }) => (
            <li key={crop.id} className="grid gap-0.5 border-b border-line py-1">
              <b>{crop.name}</b>
              <span>
                {method} · {window.season === "spring" ? "spring" : "fall"} window {windowText(window)}
              </span>
              {!fit.ok && <span>Needs a head start indoors in your short season.</span>}
            </li>
          ))}
        </ul>
      )}
      <p>
        {list.length > SHOWN ? `${list.length - SHOWN} more in the ` : "Details in the "}
        <Link href="/plants/">plant encyclopedia</Link>. Lay out beds in the <Link href="/planner/">garden planner</Link>.
      </p>
    </Card>
  );
}
