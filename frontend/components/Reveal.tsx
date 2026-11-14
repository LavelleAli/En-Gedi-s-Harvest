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
//
// An IntersectionObserver watches the hidden items, so each one fades in when it actually reaches
// the screen. (Positions measured once when the page loads go stale as fonts, images or opened
// entries move things around, which left items invisible in the middle of the screen.)
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, reducedMotion, useGSAP } from "@/frontend/lib/motion";

const ENTER = 0.4; // seconds for each item to fade up

type RevealProps = {
  as?: ElementType;
  items?: string;
  refresh?: unknown;
  children?: ReactNode;
  className?: string;
  id?: string;
};

export default function Reveal({ as: Tag = "div", items = ":scope > *", refresh, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      const below = [...ref.current.querySelectorAll(items)].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
      if (!below.length) return;
      below.forEach((el) => el.classList.add("reveal-item"));
      gsap.set(below, { opacity: 0, y: 16 });
      const observer = new IntersectionObserver(
        (changes) => {
          const entering = changes.filter((c) => c.isIntersecting).map((c) => c.target);
          if (!entering.length) return;
          entering.forEach((el) => observer.unobserve(el));
          // Several rows can arrive at once on a fast scroll; cap the whole stagger at 0.2s so none lag behind.
          // Ease out (fast start) rather than in-and-out, so a row is mostly visible within the first 150ms.
          gsap.to(entering, { opacity: 1, y: 0, duration: ENTER, ease: "power2.out", stagger: Math.min(0.05, 0.2 / entering.length), clearProps: "transform" });
        },
        // Start a little before an item scrolls into view (the bottom 10% of a screen early), so it's
        // already fading in as it appears instead of showing an empty gap.
        { rootMargin: "0px 0px 10% 0px" },
      );
      below.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    },
    { scope: ref, dependencies: [refresh], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
