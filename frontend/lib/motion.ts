"use client";

// Shared animation settings for GSAP, so every animation in the app moves the same way.
//   - FADE: page and window fades, 0.5s (the same 500ms as the --fade token in globals.css)
//   - EASE: ease in and out, matching the --ease-in-out token used by CSS hover transitions
//   - reducedMotion(): true when the reader asked their system for less motion; animations then
//     jump straight to their end state
// Simple hover effects stay in CSS (globals.css); GSAP is for fades, entrances and the planner camera.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

export const FADE = 0.5; // seconds
export const EASE = "power2.inOut";

export function reducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// The duration to use: `seconds`, or 0 when the reader prefers reduced motion.
export const duration = (seconds = FADE) => (reducedMotion() ? 0 : seconds);

export { gsap, ScrollTrigger, useGSAP };
