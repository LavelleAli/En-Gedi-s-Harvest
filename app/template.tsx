"use client";

// A template (unlike a layout) remounts on every navigation, so each new page fades in over 500ms
// (GSAP, frontend/lib/motion.ts). The very first page of a visit is skipped here: it fades in with a CSS
// keyframe on <main> instead (animate-page-in, app/layout.tsx), which starts with the first paint. A GSAP
// fade would only start once the scripts load, so the page would show, vanish, then fade back in.
import { useRef, type ReactNode } from "react";
import { EASE, FADE, duration, gsap, useGSAP } from "@/frontend/lib/motion";

let firstPage = true;

export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
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
