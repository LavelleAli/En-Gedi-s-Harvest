"use client";

// The Tools button in the sidebar and the menu of every page that opens from it.
//
//   Mouse      pointing at Tools opens it. Leaving the button, the gap and the menu closes it after a
//              150ms grace period, so crossing the gap doesn't close it.
//   Touch      tapping Tools opens or closes it; tapping anywhere else closes it.
//   Keyboard   Enter or Space opens it and moves focus to the first page. Esc closes it and puts focus
//              back on Tools. Tabbing out of it closes it.
//
// The menu fades and slides 8px over 300ms (GSAP, frontend/lib/motion.ts), or appears at once when the
// reader prefers reduced motion. It's a solid panel, not glass: the sidebar behind it is already glass,
// and a blurred panel inside another one can't blur.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type FocusEvent } from "react";
import { EASE, duration, gsap, useGSAP } from "@/frontend/lib/motion";
import SidebarIcon from "./SidebarIcon";
import ToolsLinks from "./ToolsLinks";
import { ITEM } from "./itemStyle";

const GRACE_MS = 150; // how long the mouse can be outside before the menu closes
const FADE_S = 0.3; // seconds for the fade and slide
const SLIDE_PX = 8;
const DESKTOP = "(min-width: 48rem)"; // Tailwind's md: the sidebar is a column on the left

// How the menu was opened decides how it closes: only a hover-opened menu closes when the mouse leaves.
type Opener = "hover" | "tap" | "keyboard";

// The menu panel's classes, grouped by job.
const PANEL = [
  // A solid window with a soft shadow, above the page.
  "absolute z-30 overflow-auto rounded-lg border border-line bg-panel-solid p-2 shadow-raised print:hidden",
  // Hidden until opened. GSAP takes over when it fades in, but this keeps it hidden before scripts load.
  "invisible opacity-0",
  // Phones: a sheet just above the bottom bar, nearly as wide as the screen.
  "inset-x-2 bottom-full mb-2 max-h-[calc(100dvh-6rem)]",
  // Wider screens: beside the sidebar, its top level with the Tools button.
  "md:inset-x-auto md:top-0 md:bottom-auto md:left-full md:mb-0 md:ms-4 md:w-[26rem] md:max-h-[calc(100dvh-2rem)]",
].join(" ");

export default function ToolsMenu({ pathname }: { pathname: string }) {
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The page the menu was opened on, or null when it's closed. Moving to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const opener = useRef<Opener>("hover");
  const lastPointer = useRef("mouse"); // the kind of pointer that last pressed Tools: mouse, touch or pen
  const focusFirst = useRef(false); // move focus into the menu once it's showing (keyboard)
  const closeTimer = useRef<number | undefined>(undefined);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const show = (by: Opener) => {
    cancelClose();
    opener.current = by;
    setOpenOn(pathname);
  };
  const hide = () => {
    cancelClose();
    setOpenOn(null);
  };

  // Fade the menu in or out whenever `open` changes.
  const firstRun = useRef(true);
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      // It slides out from the sidebar: sideways from the left column, upward from the bottom bar.
      const offset = window.matchMedia(DESKTOP).matches ? { x: -SLIDE_PX, y: 0 } : { x: 0, y: SLIDE_PX };
      if (firstRun.current) {
        firstRun.current = false;
        gsap.set(panel, { autoAlpha: 0, ...offset });
        return;
      }
      if (open) {
        // Make it visible right away (at opacity 0) so focus can move into it, then fade it up.
        gsap.set(panel, { visibility: "inherit" });
        gsap.to(panel, { autoAlpha: 1, x: 0, y: 0, duration: duration(FADE_S), ease: EASE, overwrite: true });
        if (focusFirst.current) {
          focusFirst.current = false;
          panel.querySelector<HTMLElement>("a, button")?.focus();
        }
      } else {
        gsap.to(panel, { autoAlpha: 0, ...offset, duration: duration(FADE_S), ease: EASE, overwrite: true });
      }
    },
    { dependencies: [open], scope: wrapRef },
  );

  // While it's open, a tap or click anywhere outside closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  });

  // Don't leave a close timer running after the sidebar unmounts.
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Mouse: pointing at the Tools button opens it. (The button's own event, not the wrapper's: after a
  // page change the pointer may still count as inside the wrapper, over the now-hidden menu.)
  const onButtonPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelClose();
    if (!open) show("hover");
  };
  // Coming back to the button or menu within the grace period keeps it open.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === "mouse") cancelClose();
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || opener.current !== "hover") return;
    closeTimer.current = window.setTimeout(hide, GRACE_MS);
  };

  // A click on Tools: the mouse has already opened it by hovering, so a click keeps it open.
  // A tap toggles it. (Enter and Space are handled in onKeyDown instead.)
  const onClick = () => {
    if (lastPointer.current === "mouse") show("hover");
    else if (open) hide();
    else show("tap");
  };

  const onButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // stop the browser from also sending a click
    if (open) panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    else {
      focusFirst.current = true;
      show("keyboard");
    }
  };

  // Esc anywhere in the button or menu closes it and returns focus to Tools.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !open) return;
    hide();
    buttonRef.current?.focus();
  };

  // Focus moving out of the button and menu (Tab, Shift+Tab) closes it. relatedTarget is where focus
  // went; it's null when focus went nowhere in particular (a click on blank space), which only closes a
  // keyboard-opened menu, so clicking the menu's padding doesn't close a hover-opened one.
  const onBlur = (e: FocusEvent) => {
    if (!open) return;
    const to = e.relatedTarget as Node | null;
    if (to ? !wrapRef.current?.contains(to) : opener.current === "keyboard") hide();
  };

  return (
    // Phones: not positioned, so the menu is placed against the whole bottom bar. Wider screens: the
    // menu is placed against this item, to line up with Tools.
    <div ref={wrapRef} className="md:relative" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={`${ITEM} w-full aria-expanded:bg-surface aria-expanded:text-fg`}
        aria-expanded={open}
        aria-controls={panelId}
        data-tour="tools"
        onPointerEnter={onButtonPointerEnter}
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onClick={onClick}
        onKeyDown={onButtonKeyDown}
      >
        <SidebarIcon name="tools" />
        <span>Tools</span>
      </button>
      {/* data-tools-menu: the tests find the menu by it. */}
      <div ref={panelRef} id={panelId} className={PANEL} data-tools-menu>
        <ToolsLinks pathname={pathname} onPick={hide} />
      </div>
    </div>
  );
}
