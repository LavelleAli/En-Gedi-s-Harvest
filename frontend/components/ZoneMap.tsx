"use client";

// A clickable U.S. map colored by hardiness zone. Hovering (or tabbing to) a state fades in a card
// with its zones and frost dates over 500ms, and fades it out the same way. Clicking a state calls
// onPick(state). The outlines (about 160 KB) load only when the map is first shown.
import { useEffect, useRef, useState } from "react";
import { LEGEND, middleZone, stateSummary, zoneColor, type StateSummary } from "@/frontend/lib/zone-map";
import type { StateShape } from "@/frontend/data/us-states";
import { STATE_ZONES } from "@/frontend/data/state-zones";

type MapData = typeof import("@/frontend/data/us-states");
type Card = { summary: StateSummary; x: number; y: number; width: number };

// A state's outline: a thin line in the window's color, darker and thicker on hover or keyboard focus,
// thickest on the chosen state. (The focus ring is the thicker outline, not a box.)
const STATE = "cursor-pointer stroke-panel-solid stroke-1 transition-[opacity,stroke,stroke-width] focus-visible:outline-none";
const STATE_ACTIVE = "hover:stroke-fg hover:stroke-2 focus-visible:stroke-fg focus-visible:stroke-2";
const STATE_SELECTED = "stroke-fg stroke-[2.5]";

// The floating card (zone-card and is-visible are test hooks). It fades over 500ms, and is hidden from
// the pointer and from screen readers (the state's own label says the same).
const CARD = "zone-card pointer-events-none absolute z-[2] w-[15.5rem] rounded-md border border-line-strong bg-panel px-4 py-3 text-sm text-fg shadow-raised";
// Fading out, `visibility` waits for the fade to finish before hiding the card.
const CARD_SHOWN = "is-visible visible opacity-100 [transition:opacity_var(--fade)_var(--ease-in-out),visibility_0s]";
const CARD_HIDDEN = "invisible opacity-0 [transition:opacity_var(--fade)_var(--ease-in-out),visibility_0s_linear_var(--fade)]";

export default function ZoneMap({ onPick, selected }: { onPick: (state: StateShape) => void; selected?: string }) {
  const [map, setMap] = useState<MapData | null>(null); // { MAP_SIZE, STATE_SHAPES } once loaded
  const [card, setCard] = useState<Card | null>(null); // kept during fade-out so the text doesn't vanish first
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/frontend/data/us-states").then((m) => !cancelled && setMap(m));
    return () => {
      cancelled = true;
    };
  }, []);

  // Place the card near the pointer (or the state's center for keyboard focus), inside the map box.
  function show(name: string, clientX: number, clientY: number) {
    const box = wrapRef.current?.getBoundingClientRect();
    const summary = stateSummary(name);
    if (!box || !summary) return;
    setCard({ summary, x: clientX - box.left, y: clientY - box.top, width: box.width });
    setVisible(true);
  }

  function showForElement(name: string, el: Element) {
    const r = el.getBoundingClientRect();
    show(name, r.left + r.width / 2, r.top + r.height / 2);
  }

  if (!map)
    return (
      <div className="grid min-h-64 place-content-center gap-3 text-muted" role="status">
        Loading the map…
      </div>
    );

  const { MAP_SIZE, STATE_SHAPES } = map;
  const flipLeft = card && card.x > card.width * 0.6; // keep the card on screen near the right edge

  return (
    <div className="relative grid gap-3" ref={wrapRef} onPointerLeave={() => setVisible(false)}>
      <svg className="block h-auto w-full max-w-full" viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`} role="group" aria-label="Map of U.S. states colored by hardiness zone">
        {STATE_SHAPES.map((s) => {
          const [coldest, warmest] = STATE_ZONES[s.name].range;
          const label = `${s.name}, zones ${coldest} to ${warmest}`;
          return (
            <path
              key={s.fips}
              d={s.d}
              fill={zoneColor(middleZone(coldest, warmest))}
              className={`${STATE} ${selected === s.name ? STATE_SELECTED : STATE_ACTIVE}`}
              tabIndex={0}
              role="button"
              aria-label={label}
              onPointerMove={(e) => e.pointerType === "mouse" && show(s.name, e.clientX, e.clientY)}
              onFocus={(e) => showForElement(s.name, e.currentTarget)}
              onBlur={() => setVisible(false)}
              onClick={() => onPick(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(s);
                }
              }}
            />
          );
        })}
      </svg>

      {card?.summary && (
        <div
          className={`${CARD} ${visible ? CARD_SHOWN : CARD_HIDDEN}`}
          style={{ left: card.x, top: card.y, transform: `translate(${flipLeft ? "calc(-100% - 14px)" : "14px"}, -50%)` }}
          aria-hidden="true"
        >
          <strong className="font-display text-md">{card.summary.name}</strong>
          <dl className="my-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-[0.15rem] [&_dt]:font-semibold [&_dt]:text-muted">
            <dt>Zones</dt>
            <dd>{card.summary.range}</dd>
            <dt>Last spring frost</dt>
            <dd>{card.summary.lastFrost}</dd>
            <dt>First fall frost</dt>
            <dd>{card.summary.firstFrost}</dd>
            <dt>Growing season</dt>
            <dd>{card.summary.season}</dd>
          </dl>
          <span className="text-xs font-semibold text-green-ink">Click to choose</span>
        </div>
      )}

      {/* The key: "Zone" then each zone's color swatch. */}
      <ol className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-xs text-muted before:font-semibold before:content-['Zone']" aria-label="Zone colors">
        {LEGEND.map((l) => (
          <li key={l.zone} className="inline-flex items-center gap-[0.3rem] tabular-nums">
            <i className="size-[0.9rem] rounded-[3px]" style={{ background: l.color }} aria-hidden="true" />
            {l.zone}
          </li>
        ))}
      </ol>
    </div>
  );
}
