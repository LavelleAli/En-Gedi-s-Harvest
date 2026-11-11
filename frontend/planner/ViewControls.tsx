"use client";

// The Blender-style overlay on the 3D view:
//   - top left: the view's name ("Top Orthographic", "User Perspective") and where the camera is,
//     in Blender's X / Y / Z (feet from the middle of the yard, Z up)
//   - top right: the axis gizmo (click a ball to look along that axis; drag it to orbit) and the
//     hand (drag to pan), magnifier (drag to zoom), perspective/orthographic and frame-all buttons
// Styled with Tailwind utility classes (the first part of the app moved off globals.css). The colors
// are the site's tokens (bg-surface, text-muted, text-fg…), so light and dark mode just work.
// "view-name" and "view-pos" are kept only as names for the tests to find.
// GardenScene owns the camera; it hands this component a ref to a `hub` holding the navigation
// (blenderNav.ts) and a set of listeners it calls after every camera move.
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { gizmoAxes, toBlender, viewLabel, type BlenderNav, type GizmoTip, type NavHub, type ViewName } from "@/frontend/planner/blenderNav";

const SIZE = 84;
const C = SIZE / 2;
const R = 29;

type ViewInfo = { label: string; ortho: boolean; pos: { x: number; y: number; z: number }; tips: GizmoTip[] };

function read(nav: BlenderNav | null): ViewInfo | null {
  if (!nav) return null;
  const cam = nav.camera;
  return {
    label: viewLabel(nav.direction(), nav.orthographic),
    ortho: nav.orthographic,
    pos: toBlender(cam.position.toArray()),
    tips: gizmoAxes(cam.quaternion.toArray() as [number, number, number, number]),
  };
}

// One round button in the right-hand column. min-h-0 and p-0 undo the site-wide button size;
// hover/aria-pressed colors come after the base color so they win.
const BTN = "grid size-9 min-h-0 place-items-center rounded-full p-0 touch-none bg-surface/80 hover:bg-surface aria-pressed:bg-blue aria-pressed:text-bg aria-pressed:border-blue";

const VIEW_NAMES: Record<ViewName, string> = { right: "Right", left: "Left", back: "Back", front: "Front", top: "Top" };

const ft = (n: number) => `${Math.round(n)}`.replace("-", "−");

// Drag on a button: calls onDelta(dx, dy, height) with the pointer's movement in pixels.
function useDrag(onDelta: (dx: number, dy: number) => void) {
  const last = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  return {
    onPointerDown(e: PointerEvent<Element>) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      last.current = { x: e.clientX, y: e.clientY, moved: false };
    },
    onPointerMove(e: PointerEvent<Element>) {
      if (!last.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      if (!dx && !dy) return;
      last.current = { x: e.clientX, y: e.clientY, moved: true };
      onDelta(dx, dy);
    },
    onPointerUp() {
      last.current = null;
    },
    onPointerCancel() {
      last.current = null;
    },
  };
}

export default function ViewControls({ hubRef }: { hubRef: RefObject<NavHub> }) {
  const [info, setInfo] = useState<ViewInfo | null>(null);

  useEffect(() => {
    const hub = hubRef.current;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setInfo(read(hub.nav));
      });
    };
    hub.listeners.add(update);
    update();
    return () => {
      hub.listeners.delete(update);
      cancelAnimationFrame(frame);
    };
  }, [hubRef]);

  // Dragging the gizmo or hand/magnifier: 300 px of movement is a full turn, a full screen or 4× zoom.
  const gizmoDrag = useDrag((dx, dy) => hubRef.current.nav?.orbit((-2 * Math.PI * dx) / 300, (-2 * Math.PI * dy) / 300));
  const panDrag = useDrag((dx, dy) => hubRef.current.nav?.panScreen(-dx / 300, dy / 300));
  const zoomDrag = useDrag((dx, dy) => hubRef.current.nav?.zoom(Math.pow(4, -dy / 300)));

  if (!info) return null;

  return (
    <>
      <div className="pointer-events-none absolute top-2 left-2 grid gap-0.5 rounded-md bg-surface/80 px-2 py-1 text-xs leading-snug" aria-live="polite">
        <span className="view-name font-bold">{info.label}</span>
        <span className="view-pos text-muted tabular-nums">
          Camera <b className="text-[#c8283d]">X</b> {ft(info.pos.x)} · <b className="text-[#4f8a26]">Y</b> {ft(info.pos.y)} · <b className="text-[#2470c8]">Z</b> {ft(info.pos.z)} ft
        </span>
      </div>

      <div className="absolute top-2 right-2 grid justify-items-center gap-2">
        <svg className="group cursor-grab touch-none select-none" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="group" aria-label="Axis views: click an axis to look along it, drag to orbit" {...gizmoDrag}>
          <circle className="fill-surface/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" cx={C} cy={C} r={C - 1} />
          {info.tips.map((t) => {
            const x = C + t.sx * R;
            const y = C + t.sy * R;
            const label = t.positive ? t.axis : "";
            const ball = (
              <>
                {t.positive && <line x1={C} y1={C} x2={x} y2={y} stroke={t.color} strokeWidth="2.5" />}
                <circle cx={x} cy={y} r={t.positive ? 8.5 : 6.5} fill={t.positive ? t.color : "var(--surface)"} stroke={t.color} strokeWidth={t.positive ? 0 : 2} fillOpacity={t.positive ? 1 : 0.85} />
                {label && <text x={x} y={y + 3.6} textAnchor="middle" className="pointer-events-none fill-white text-[10px] font-bold">{label}</text>}
              </>
            );
            const view = t.view;
            if (!view) return <g key={t.key} aria-hidden="true">{ball}</g>;
            const name = VIEW_NAMES[view];
            return (
              <g
                key={t.key}
                className="cursor-pointer outline-none [&_circle]:transition-[stroke,stroke-width] hover:[&_circle]:stroke-fg hover:[&_circle]:stroke-2 focus-visible:[&_circle]:stroke-fg focus-visible:[&_circle]:stroke-2"
                role="button"
                tabIndex={0}
                aria-label={`${name} view (looking along ${t.positive ? "−" : "+"}${t.axis})`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => hubRef.current.nav?.setView(view)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    hubRef.current.nav?.setView(view);
                  }
                }}
              >
                {ball}
              </g>
            );
          })}
        </svg>
        <div className="grid gap-1">
          <button type="button" className={BTN} title="Drag to pan (Shift + middle-drag)" aria-label="Pan: drag this button" {...panDrag}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-8a1.5 1.5 0 0 1 3 0V12M14 11.5V5a1.5 1.5 0 0 1 3 0v8M17 8.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.3 14a1.6 1.6 0 0 1 2.6-1.8L8 13.5" />
            </svg>
          </button>
          <button type="button" className={BTN} title="Drag up or down to zoom (scroll or pinch)" aria-label="Zoom: drag this button up or down" {...zoomDrag}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5M10.5 8v5M8 10.5h5" />
            </svg>
          </button>
          <button type="button" className={BTN} aria-pressed={info.ortho} title="Perspective / orthographic (5)" aria-label="Orthographic view" onClick={() => hubRef.current.nav?.toggleOrtho()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {info.ortho ? <path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16M15 4v16" /> : <path d="M7 5h10l3 15H4zM5.5 12.5h13M10 5l-1.5 15M14 5l1.5 15" />}
            </svg>
          </button>
          <button type="button" className={BTN} title="Frame the whole yard (Home or H)" aria-label="Frame the whole yard" onClick={() => hubRef.current.nav?.frameAll()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
