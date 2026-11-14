"use client";

// Which gear checklist boxes are ticked, saved in this browser (localStorage "fhb-gear", keyed like
// "bee-3"). The change event lets account sync notice new ticks, and redraws the boxes when a synced
// copy arrives from another device.
import { useSyncExternalStore } from "react";

const KEY = "fhb-gear";
const EVENT = "fhb-gear-change";

function read() {
  try {
    return localStorage.getItem(KEY) || "{}";
  } catch {
    return "{}";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function parse(raw: string): Record<string, true> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Returns whether a box is ticked, and a function to tick or untick it. */
export function useGearChecks() {
  const checks = parse(useSyncExternalStore(subscribe, read, () => "{}"));
  const set = (key: string, on: boolean) => {
    const next = { ...checks };
    if (on) next[key] = true;
    else delete next[key];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  return { isChecked: (key: string) => !!checks[key], set };
}
