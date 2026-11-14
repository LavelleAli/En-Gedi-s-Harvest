"use client";

// Starred plants ("My garden"), saved in localStorage and shared by every entry on the page. The change
// event also lets account sync notice new stars, and keeps other tabs in step (the storage event).
import { useMemo, useSyncExternalStore } from "react";

const STAR_KEY = "fhb-stars";
const STAR_EVENT = "fhb-stars-change";

function readStars() {
  try {
    return localStorage.getItem(STAR_KEY) || "{}";
  } catch {
    return "{}";
  }
}

function subscribeStars(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STAR_EVENT, callback);
  };
}

/** Returns the starred titles and a function that stars or unstars one. */
export function useStars() {
  const raw = useSyncExternalStore(subscribeStars, readStars, () => "{}");
  const stars = useMemo((): Record<string, true> => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);
  const toggle = (name: string) => {
    const next = { ...stars };
    if (next[name]) delete next[name];
    else next[name] = true;
    try {
      localStorage.setItem(STAR_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(STAR_EVENT));
  };
  return [stars, toggle] as const;
}
