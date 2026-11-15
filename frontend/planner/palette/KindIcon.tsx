// The small line icon for each kind of yard item: shade sources (house, shed, tree, hedge, fence), animals
// (chicken coop, fish farm, beehive) and water (tank, filter).
import type { ReactNode } from "react";
import type { ObstacleKind } from "../model";

// Small icons for each kind, on a 24×24 grid.
const ICONS: Record<ObstacleKind, ReactNode> = {
  // A Dutch Colonial seen from the front: gambrel roof (shallow on top, steep below), the wide
  // upstairs dormer, the peaked porch roof over the door, and a window on each side.
  house: (
    <>
      <path d="M2.5 13.5 4.6 8 8.5 4.5h7L19.4 8l2.1 5.5z" />
      <path d="M6.3 8.2v2.9h11.4V8.2" />
      <path d="M4 13.5v7h16v-7" />
      <path d="M9.3 15.6 12 13.6l2.7 2" />
      <path d="M10.8 20.5v-3.4h2.4v3.4M6.4 16.4v2.2M16.6 16.4v2.2" />
    </>
  ),
  shed: <path d="M5 9h14v11H5z M5 9l7-4 7 4 M9 20v-6h6v6" />,
  tree: <><circle cx="12" cy="10" r="6" /><path d="M12 16v5" /></>,
  hedge: <path d="M3 15c0-3 2-5 4.5-5S12 12 12 15c0-3 2-5 4.5-5S21 12 21 15v3H3z" />,
  fence: <path d="M5 6v14M12 6v14M19 6v14M3 10h18M3 16h18" />,
  // A coop on legs with a pitched roof, its door, and the ramp down to the ground.
  coop: <path d="M3 10l8-5 8 5M5 9v7h12V9M9 16v-4h4v4M5 16v4M17 16v4M13 16l6 4" />,
  // A fish.
  fishfarm: <><path d="M3 12c3-4.5 9-5 13 0-4 5-10 4.5-13 0zM16 12l5-3.5v7z" /><circle cx="8" cy="11.3" r="0.6" /></>,
  // A stacked hive box with its entrance slot.
  hive: <path d="M5 5h14v4H5zM4 9h16v5H4zM5 14h14v6H5zM10 17.5h4" />,
  // A round tank seen from the side.
  tank: <path d="M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3v12c0 1.7-3.1 3-7 3s-7-1.3-7-3zM5 6c0 1.7 3.1 3 7 3s7-1.3 7-3M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />,
  // A funnel with a drop under it.
  filter: <path d="M4 4h16l-6 7v5l-4 2v-7zM12 20.5v.5" />,
};

export default function KindIcon({ kind }: { kind: ObstacleKind }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  );
}
