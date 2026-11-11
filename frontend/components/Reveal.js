"use client";

// A list whose items fade up into place, a few at a time, as they scroll into view (GSAP ScrollTrigger).
//
//   <Reveal as="ul" className="shop-grid">…items…</Reveal>
//   <Reveal className="entries" items=".entry" refresh={filter}>…</Reveal>
//
//   as       the element to render (div by default); it takes the place of the list's own wrapper
//   items    which elements inside animate (default: the direct children)
//   refresh  change this when the list's contents change (a filter, a search) to pick up new items
//
// Items already on screen when the page loads are left alone, so nothing blinks out and back in;
// the page's own fade covers them. Nothing is hidden without JavaScript, when the reader prefers
// reduced motion, or when printing (see .reveal-item in the print styles of globals.css).
import { useRef } from "react";
import { EASE, FADE, ScrollTrigger, gsap, reducedMotion, useGSAP } from "@/frontend/lib/motion";

export default function Reveal({ as: Tag = "div", items = ":scope > *", refresh, children, ...rest }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      const below = [...ref.current.querySelectorAll(items)].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
      if (!below.length) return;
      below.forEach((el) => el.classList.add("reveal-item"));
      gsap.set(below, { opacity: 0, y: 16 });
      ScrollTrigger.batch(below, {
        start: "top 95%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: FADE, ease: EASE, stagger: 0.07, clearProps: "transform" }),
      });
    },
    { scope: ref, dependencies: [refresh], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
