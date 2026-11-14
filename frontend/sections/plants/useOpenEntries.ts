"use client";

// Which entries are open. A link to #plant-… (a companion name, another page, the tour) opens that
// entry; `onReveal` then clears the search and filters, in case they hide it.
import { useCallback, useEffect, useState } from "react";
import { ENTRIES } from "./entries";

export function useOpenEntries(allOpen: boolean, onReveal: () => void) {
  // The Whole book page starts with every entry open, so they all print.
  const [open, setOpen] = useState<Set<string>>(() => new Set(allOpen ? ENTRIES.map((e) => e.id) : []));
  // The row the reader just clicked: only that one animates (bulk open/close and links don't).
  const [clicked, setClicked] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setClicked(id);
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Open every listed entry, or close them all.
  const setAll = (ids: string[] | null) => {
    setClicked(null);
    setOpen(new Set(ids ?? []));
  };

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!ENTRIES.some((e) => e.id === id)) return;
      setClicked(null);
      setOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      onReveal();
      // Once it's open, bring the row back to the top (opening other rows above may have moved it).
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
    // onReveal only resets filters; it doesn't need to re-run this when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { open, clicked, toggle, setAll };
}
