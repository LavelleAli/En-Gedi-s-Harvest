"use client";

// A template (unlike a layout) remounts on every navigation, so each new page fades in over 500ms
// (GSAP, frontend/lib/motion.js). The very first page of a visit appears as soon as it loads; only
// moves between pages fade, so a slow connection never leaves a blank page waiting for scripts.
import { useRef } from "react";
import { EASE, FADE, duration, gsap, useGSAP } from "@/frontend/lib/motion";

let firstPage = true;

export default function Template({ children }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (firstPage) {
      firstPage = false;
      return;
    }
    gsap.fromTo(ref.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: duration(FADE), ease: EASE, clearProps: "transform" });
  });
  return (
    <div className="page-fade" ref={ref}>
      {children}
    </div>
  );
}
