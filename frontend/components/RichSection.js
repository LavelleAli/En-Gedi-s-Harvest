"use client";

import { useEffect, useRef } from "react";

const KEY = "fhb-gear";
const EVENT = "fhb-gear-change"; // lets account sync see changes, and redraw when a synced copy arrives

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// Renders a long-form guide (trusted HTML from lib/animals.js) and remembers
// which gear checklist boxes are ticked in this browser.
export default function RichSection({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const showChecks = () => {
      const checks = load();
      root.querySelectorAll(".gear input[data-k]").forEach((box) => {
        box.checked = !!checks[box.dataset.k];
      });
    };
    showChecks();
    const onChange = (e) => {
      const box = e.target;
      if (!box.matches?.(".gear input[data-k]")) return;
      const next = load();
      if (box.checked) next[box.dataset.k] = true;
      else delete next[box.dataset.k];
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
