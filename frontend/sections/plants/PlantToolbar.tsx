// The encyclopedia's search and filters: a search box, the type dropdown, and two chips that narrow
// whatever type is picked (e.g. herbs that grow in my zone). Not printed.
import { useRef } from "react";
import Chip from "@/frontend/components/ui/Chip";
import { useEarlyInput } from "@/frontend/lib/useEarlyInput";
import type { Filters } from "./filterEntries";
import TypeFilter from "./TypeFilter";

type PlantToolbarProps = {
  filters: Filters;
  zone: string;
  onChange: (patch: Partial<Filters>) => void;
};

export default function PlantToolbar({ filters, zone, onChange }: PlantToolbarProps) {
  // A search typed while the page was still loading counts too.
  const searchRef = useRef<HTMLInputElement>(null);
  useEarlyInput(searchRef, filters.q, (q) => onChange({ q }));
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden" data-tour="plant-tools">
      <input
        ref={searchRef}
        type="search"
        id="psearch"
        placeholder="Search plants, nutrients, problems"
        aria-label="Search plants"
        value={filters.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />
      <TypeFilter value={filters.type} onChange={(type) => onChange({ type })} />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Narrow the list">
        <Chip pressed={filters.zoneOnly} onClick={() => onChange({ zoneOnly: !filters.zoneOnly })}>
          Grows in zone {zone}
        </Chip>
        <Chip pressed={filters.starOnly} onClick={() => onChange({ starOnly: !filters.starOnly })}>
          ★ My garden
        </Chip>
      </div>
    </div>
  );
}
