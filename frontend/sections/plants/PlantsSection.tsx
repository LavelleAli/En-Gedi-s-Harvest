"use client";

// The plant encyclopedia: every plant A to Z as a list. Each row opens into the full entry: a facts
// box, growing notes, planting dates for the reader's zone, what a healthy plant looks like, problems
// and companions. A link to #plant-… (from a companion name, another page or the tour) opens that row.
// The Whole book page passes `allOpen` so every entry prints in full.
import { useMemo, useState } from "react";
import Reveal from "@/frontend/components/Reveal";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { useLocation } from "@/frontend/lib/location";
import AboutNotes from "./AboutNotes";
import EntryRow from "./EntryRow";
import LetterGroup from "./LetterGroup";
import LetterIndex from "./LetterIndex";
import ListStatus from "./ListStatus";
import PlantToolbar from "./PlantToolbar";
import { ENTRIES, type Entry } from "./entries";
import { filterEntries, type Filters } from "./filterEntries";
import { useOpenEntries } from "./useOpenEntries";
import { useStars } from "./useStars";
import Page from "@/frontend/components/ui/Page";

const NO_FILTERS: Filters = { q: "", type: "all", zoneOnly: false, starOnly: false };

export default function PlantsSection({ allOpen = false }: { allOpen?: boolean }) {
  const { zone } = useLocation();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [stars, toggleStar] = useStars();
  const { open, clicked, toggle, setAll } = useOpenEntries(allOpen, () => setFilters(NO_FILTERS));

  const shown = useMemo(() => filterEntries(ENTRIES, filters, stars, zone), [filters, stars, zone]);
  const byLetter = useMemo(() => {
    const groups = new Map<string, Entry[]>();
    for (const e of shown) groups.set(e.letter, [...(groups.get(e.letter) || []), e]);
    return groups;
  }, [shown]);

  return (
    <Page>
      <SectionHeader
        kicker="Fruits · vegetables · herbs · flowers, A to Z"
        title="Plant encyclopedia"
        lead={
          <>
            {ENTRIES.length} plants for North American gardens. Each entry gives the plant&apos;s family and hardiness, how to grow it, when to
            plant in zone {zone}, what a healthy plant looks like, the problems to watch for, and its companions. Star the ones you grow.
          </>
        }
      />
      <LetterIndex has={(l) => byLetter.has(l)} />
      <PlantToolbar filters={filters} zone={zone} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
      <ListStatus
        shown={shown.length}
        total={ENTRIES.length}
        emptyStarred={filters.starOnly && shown.length === 0}
        anyOpen={open.size > 0}
        onOpenAll={() => setAll(shown.map((e) => e.id))}
        onCloseAll={() => setAll(null)}
      />
      {/* Rows lower on the page fade up as they scroll into view; a new filter picks up the new rows. */}
      <Reveal className="grid gap-8" items=".entry" refresh={`${filters.type}|${filters.zoneOnly}|${filters.starOnly}|${filters.q}`}>
        {[...byLetter.entries()].map(([letter, entries]) => (
          <LetterGroup key={letter} letter={letter}>
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                zone={zone}
                starred={!!stars[entry.title]}
                onStar={toggleStar}
                open={open.has(entry.id)}
                onToggle={toggle}
                animate={clicked === entry.id}
              />
            ))}
          </LetterGroup>
        ))}
      </Reveal>
      <AboutNotes />
    </Page>
  );
}
