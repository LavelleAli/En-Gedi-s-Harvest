"use client";

// A clickable U.S. map colored by hardiness zone. Hovering (or tabbing to) a state fades in a card
// with its zones and frost dates over 500ms, and fades it out the same way. Clicking a state calls
// onPick(state). The outlines (about 160 KB) load only when the map is first shown.
import { useEffect, useRef, useState } from "react";
import { LEGEND, middleZone, stateSummary, zoneColor } from "@/frontend/lib/zone-map";
import { STATE_ZONES } from "@/frontend/data/state-zones";

export default function ZoneMap({ onPick, selected }) {
  const [map, setMap] = useState(null); // { MAP_SIZE, STATE_SHAPES } once loaded
  const [card, setCard] = useState(null); // { summary, x, y }: kept during fade-out so the text doesn't vanish first
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("@/frontend/data/us-states").then((m) => !cancelled && setMap(m));
    return () => {
      cancelled = true;
    };
  }, []);

  // Place the card near the pointer (or the state's center for keyboard focus), inside the map box.
  function show(name, clientX, clientY) {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    setCard({ summary: stateSummary(name), x: clientX - box.left, y: clientY - box.top, width: box.width });
    setVisible(true);
  }

  function showForElement(name, el) {
    const r = el.getBoundingClientRect();
    show(name, r.left + r.width / 2, r.top + r.height / 2);
  }

  if (!map) return <div className="zone-map zone-map-loading" role="status">Loading the map…</div>;

  const { MAP_SIZE, STATE_SHAPES } = map;
  const flipLeft = card && card.x > card.width * 0.6; // keep the card on screen near the right edge

  return (
    <div className="zone-map" ref={wrapRef} onPointerLeave={() => setVisible(false)}>
      <svg viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`} role="group" aria-label="Map of U.S. states colored by hardiness zone">
        {STATE_SHAPES.map((s) => {
          const [coldest, warmest] = STATE_ZONES[s.name].range;
          const label = `${s.name}, zones ${coldest} to ${warmest}`;
          return (
            <path
              key={s.fips}
              d={s.d}
              fill={zoneColor(middleZone(coldest, warmest))}
              className={selected === s.name ? "is-selected" : undefined}
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
          className={`zone-card${visible ? " is-visible" : ""}`}
          style={{ left: card.x, top: card.y, transform: `translate(${flipLeft ? "calc(-100% - 14px)" : "14px"}, -50%)` }}
          aria-hidden="true"
        >
          <strong>{card.summary.name}</strong>
          <dl>
            <dt>Zones</dt>
            <dd>{card.summary.range}</dd>
            <dt>Last spring frost</dt>
            <dd>{card.summary.lastFrost}</dd>
            <dt>First fall frost</dt>
            <dd>{card.summary.firstFrost}</dd>
            <dt>Growing season</dt>
            <dd>{card.summary.season}</dd>
          </dl>
          <span className="zone-card-hint">Click to choose</span>
        </div>
      )}

      <ol className="zone-legend" aria-label="Zone colors">
        {LEGEND.map((l) => (
          <li key={l.zone}>
            <i style={{ background: l.color }} aria-hidden="true" />
            {l.zone}
          </li>
        ))}
      </ol>
    </div>
  );
}
