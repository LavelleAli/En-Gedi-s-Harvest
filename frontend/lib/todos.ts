"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MonthLists } from "@/frontend/data/calendar";

// Monthly to-do checklist. Ticks live in localStorage as { "<month>|<group>|<item>": true }.
const KEY = "fhb-todo";
const EVENT = "fhb-todo-change";

export const GROUPS = [
  { id: "plant", index: 0, tone: "g", title: "Plant or sow" },
  { id: "harvest", index: 1, tone: "y", title: "Harvest" },
  { id: "tasks", index: 2, tone: "k", title: "Other tasks" },
] as const;

export type ChecklistItem = { key: string; label: string };
export type ChecklistGroup = (typeof GROUPS)[number] & { items: ChecklistItem[] };
/** Ticked items, by storage key. */
export type Done = Record<string, true>;

// The checklist for one month of a (zone-shifted) calendar: each group with its items and storage keys.
export function monthChecklist(month: number, calendar: MonthLists): ChecklistGroup[] {
  return GROUPS.map((g) => ({
    ...g,
    items: calendar[month][g.index].map((text) => ({
      key: `${month}|${g.id}|${text}`,
      label: text[0].toUpperCase() + text.slice(1),
    })),
  }));
}

function read() {
  try {
    return localStorage.getItem(KEY) || "{}";
  } catch {
    return "{}";
  }
}

function write(next: Done) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useTodos() {
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  const done = useMemo((): Done => {
    try {
      return JSON.parse(raw) as Done;
    } catch {
      return {};
    }
  }, [raw]);

  const toggle = (key: string) => {
    const next = { ...done };
    if (next[key]) delete next[key];
    else next[key] = true;
    write(next);
  };

  // Clears every tick for one month.
  const clearMonth = (month: number) => {
    const prefix = `${month}|`;
    write(Object.fromEntries(Object.entries(done).filter(([k]) => !k.startsWith(prefix))));
  };

  return { done, toggle, clearMonth };
}
