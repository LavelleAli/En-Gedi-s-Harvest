"use client";

import { useEffect, useRef } from "react";

const KEY = "fhb-gear";
const EVENT = "fhb-gear-change"; // lets account sync see changes, and redraw when a synced copy arrives

function load(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// Renders a long-form guide (trusted HTML from data/animals.ts) and remembers
// which gear checklist boxes are ticked in this browser.
export default function RichSection({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const showChecks = () => {
      const checks = load();
      root.querySelectorAll<HTMLInputElement>(".gear input[data-k]").forEach((box) => {
        box.checked = !!checks[box.dataset.k ?? ""];
      });
    };
    showChecks();
    const onChange = (e: Event) => {
      const box = e.target as HTMLInputElement;
      const key = box.dataset?.k;
      if (!box.matches?.(".gear input[data-k]") || !key) return;
      const next = load();
      if (box.checked) next[key] = true;
      else delete next[key];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    };
    root.addEventListener("change", onChange);
    window.addEventListener(EVENT, showChecks);
    return () => {
      root.removeEventListener("change", onChange);
      window.removeEventListener(EVENT, showChecks);
    };
  }, [html]);

  return <section className="view" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
