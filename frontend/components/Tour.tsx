"use client";

// The optional walkthrough. On a reader's first visit a small card offers it; after that it only
// starts from Tools → Take the tour (startTour() in frontend/lib/tour.ts).
//
// Each step (frontend/data/tour.ts) can open another page and point at an element marked with
// data-tour="…". A "spotlight" box sits over that element; its huge shadow dims the rest of the
// screen. The card with the step's text sits below the element, or above it when there's no room.
// The page underneath still works while the tour runs: nothing is blocked, only dimmed.
//
// Keys while the card has focus: → next, ← back, Esc ends the tour.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { TOUR } from "@/frontend/data/tour";
import { TOUR_START_EVENT, markTourSeen, tourSeen } from "@/frontend/lib/tour";
import { EASE, duration, gsap, reducedMotion } from "@/frontend/lib/motion";
import { normalizePath } from "@/frontend/lib/paths";
import Button from "@/frontend/components/ui/Button";
import Kicker from "@/frontend/components/ui/Kicker";

const PAD = 8; // px of room around the highlighted element
const GAP = 12; // px between the highlight and the card
const EDGE = 16; // keep the card at least this far from the screen edges
const WAIT_MS = 3000; // how long to wait for a step's element to appear after a page change

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// On phones the sidebar is a bar along the bottom of the screen; the card must stay above it.
function bottomBarHeight(): number {
  const bar = document.querySelector("[data-sidebar]")?.getBoundingClientRect();
  return bar && bar.top > window.innerHeight / 2 ? window.innerHeight - bar.top : 0;
}

/** The element a step points at, once looked for. `el` is null when the step has none or it wasn't found. */
type Found = { step: number; el: Element | null };

export default function Tour() {
  const pathname = normalizePath(usePathname());
  const router = useRouter();
  const [offer, setOffer] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [found, setFound] = useState<Found | null>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const offerRef = useRef<HTMLElement>(null);

  // First visit: offer the tour a moment after the page settles.
  useEffect(() => {
    if (tourSeen()) return;
    const timer = window.setTimeout(() => setOffer(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (offer && offerRef.current) gsap.fromTo(offerRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: duration(), ease: EASE });
  }, [offer]);

  // Tools → Take the tour.
  useEffect(() => {
    const begin = () => {
      markTourSeen();
      setOffer(false);
      setFound(null);
      setStep(0);
    };
    window.addEventListener(TOUR_START_EVENT, begin);
    return () => window.removeEventListener(TOUR_START_EVENT, begin);
  }, []);

  const end = useCallback(() => {
    markTourSeen();
    const parts = [spotRef.current, cardRef.current].filter(Boolean);
    gsap.to(parts, { opacity: 0, duration: duration(0.3), ease: EASE, onComplete: () => {
      setStep(null);
      setFound(null);
    } });
  }, []);

  const go = useCallback((next: number) => {
    if (next < 0) return;
    if (next >= TOUR.length) return end();
    // Fade the card out; it fades back in with the new text once the next element is in place.
    if (cardRef.current) gsap.to(cardRef.current, { opacity: 0, duration: duration(0.15), ease: EASE });
    setStep(next);
  }, [end]);

  // For each step: open its page if needed, then look for its element (it may take a moment to appear).
  useEffect(() => {
    if (step === null) return;
    const { route, target } = TOUR[step];
    if (route && route !== pathname) {
      router.push(route);
      return; // this runs again once the new page is showing
    }
    let frame = 0;
    const started = performance.now();
    const look = () => {
      const el = target ? document.querySelector(`[data-tour="${target}"]`) : null;
      const visible = !!el && el.getClientRects().length > 0;
      // An open window (e.g. the location picker) makes the rest of the page unclickable; wait for it to close.
      const blocked = !!document.querySelector("dialog[open]");
      if (((target && !visible) || blocked) && performance.now() - started < WAIT_MS) {
        frame = requestAnimationFrame(look);
        return;
      }
      if (visible) el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
      setFound({ step, el: visible ? el : null });
    };
    frame = requestAnimationFrame(look);
    return () => cancelAnimationFrame(frame);
  }, [step, pathname, router]);

  // Place the spotlight and the card, and keep them in place while the page scrolls or resizes.
  const current = found && found.step === step ? found : null;
  useEffect(() => {
    const spot = spotRef.current;
    const card = cardRef.current;
    if (!current || !spot || !card) return;

    const place = (animate: boolean) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - bottomBarHeight();
      const r = current.el?.getBoundingClientRect();
      // No element: shrink the spotlight to nothing in the middle, which leaves the whole screen dimmed.
      const box = r ? { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 } : { x: vw / 2, y: vh / 2, w: 0, h: 0 };
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      let x = (vw - cw) / 2;
      let y = (vh - ch) / 2;
      if (r) {
        x = clamp(r.left + r.width / 2 - cw / 2, EDGE, vw - cw - EDGE);
        const beside = clamp(box.y, EDGE, vh - ch - EDGE);
        if (box.y + box.h + GAP + ch <= vh - EDGE) y = box.y + box.h + GAP; // below
        else if (box.y - GAP - ch >= EDGE) y = box.y - GAP - ch; // above
        else if (box.x + box.w + GAP + cw <= vw - EDGE) [x, y] = [box.x + box.w + GAP, beside]; // right
        else if (box.x - GAP - cw >= EDGE) [x, y] = [box.x - GAP - cw, beside]; // left
        else y = vh - ch - EDGE; // a big element on a small screen: over its bottom edge
      }
      const time = animate ? duration(0.4) : 0;
      gsap.to(spot, { x: box.x, y: box.y, width: box.w, height: box.h, opacity: 1, duration: time, ease: EASE, overwrite: true });
      gsap.to(card, { x, y, duration: time, ease: EASE, overwrite: "auto" });
    };

    place(true);
    gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: duration(0.3), ease: EASE });
    card.focus({ preventScroll: true });

    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => place(false));
    };
    window.addEventListener("scroll", follow, { capture: true, passive: true });
    window.addEventListener("resize", follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", follow, { capture: true });
      window.removeEventListener("resize", follow);
    };
  }, [current]);

  // Esc ends the tour from anywhere, unless a window (dialog) is open: then Esc closes that first.
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) end();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, end]);

  const onCardKey = (e: KeyboardEvent) => {
    if (step === null) return;
    if (e.key === "ArrowRight") go(step + 1);
    else if (e.key === "ArrowLeft") go(step - 1);
    else return;
    e.preventDefault();
  };

  const answerOffer = (take: boolean) => {
    markTourSeen();
    setOffer(false);
    if (take) {
      setFound(null);
      setStep(0);
    }
  };

  if (typeof document === "undefined") return null;

  if (step === null) {
    if (!offer) return null;
    return createPortal(
      <aside
        ref={offerRef}
        aria-labelledby="tour-offer-title"
        className="fixed right-4 bottom-[calc(3.75rem+1rem)] z-40 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-line-strong bg-panel p-4 text-fg shadow-raised md:bottom-4 print:hidden"
      >
        <h2 id="tour-offer-title" className="m-0 font-display text-lg">New here?</h2>
        <p className="mt-2 mb-3 text-sm text-muted">A two-minute tour shows you around the book. You can also take it later from Tools.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => answerOffer(true)}>
            Show me around
          </Button>
          <Button onClick={() => answerOffer(false)}>No thanks</Button>
        </div>
      </aside>,
      document.body,
    );
  }

  // Show the text of the step that's in place; while the next one is being found, keep the old text.
  const shown = current?.step ?? found?.step ?? step;
  const { title, body } = TOUR[shown];
  const last = shown === TOUR.length - 1;
  return createPortal(
    <div className="print:hidden">
      {/* The spotlight: a see-through box whose shadow dims everything else. It never blocks clicks. */}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-40 rounded-md opacity-0 shadow-[0_0_0_200vmax_rgb(0_0_0/0.55)] outline-2 outline-focus"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        onKeyDown={onCardKey}
        className="fixed top-0 left-0 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-line-strong bg-panel p-4 text-fg opacity-0 shadow-raised outline-none"
      >
        <Kicker aria-live="polite">
          Step {shown + 1} of {TOUR.length}
        </Kicker>
        <h2 id="tour-title" className="mt-1 mb-0 font-display text-xl">{title}</h2>
        <p id="tour-body" className="mt-2 mb-4 text-sm">{body}</p>
        <div className="flex items-center gap-2">
          {!last && (
            <Button variant="quiet" className="mr-auto" onClick={end}>
              End tour
            </Button>
          )}
          {shown > 0 && (
            <Button className={last ? "mr-auto" : undefined} onClick={() => go(shown - 1)}>
              Back
            </Button>
          )}
          <Button variant="primary" onClick={() => go(shown + 1)}>
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
