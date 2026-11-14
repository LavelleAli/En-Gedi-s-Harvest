"use client";

// Text typed into a box (or an option picked) before the page has finished loading stays in the box, but
// React never saw it happen, so the page doesn't react to it, and typing the same text again isn't a change
// either. Once the page is live, this reads the control once and hands anything already in it to `onEarly`.
//   const ref = useRef<HTMLInputElement>(null);
//   useEarlyInput(ref, q, setQ);
//   <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} />
import { useEffect, type RefObject } from "react";

export function useEarlyInput(ref: RefObject<HTMLInputElement | HTMLSelectElement | null>, value: string, onEarly: (value: string) => void) {
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== value) onEarly(el.value);
    // Only once, right after the page comes alive: after that React sees every change itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
