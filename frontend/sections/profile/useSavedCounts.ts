"use client";

// How many things of each kind are saved in this browser (stars, gear ticks, to-dos, beds), recounted
// whenever a store (or account sync) changes something. Null until the first count.
import { useEffect, useState } from "react";
import { SYNCED } from "@/shared/saved-data";

export type SavedCount = { label: string; value: number };

// Reads one saved key and counts its entries with `pick`; 0 if it's missing or unreadable.
function count(key: string, pick: (value: Record<string, unknown>) => number): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? pick(JSON.parse(raw)) : 0;
  } catch {
    return 0;
  }
}

function readSaved(): SavedCount[] {
  return [
    { label: "Starred plants", value: count("fhb-stars", (v) => Object.keys(v).length) },
    { label: "Gear checklist ticks", value: count("fhb-gear", (v) => Object.keys(v).length) },
    { label: "Monthly to-dos done", value: count("fhb-todo", (v) => Object.keys(v).length) },
    { label: "Garden beds planned", value: count("fhb-garden", (v) => (Array.isArray(v?.beds) ? v.beds.length : 0)) },
  ];
}

export function useSavedCounts() {
  const [saved, setSaved] = useState<SavedCount[] | null>(null);
  useEffect(() => {
    const refresh = () => setSaved(readSaved());
    refresh();
    const events = [...new Set(Object.values(SYNCED))];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => {
      events.forEach((e) => window.removeEventListener(e, refresh));
    };
  }, []);
  return saved;
}
