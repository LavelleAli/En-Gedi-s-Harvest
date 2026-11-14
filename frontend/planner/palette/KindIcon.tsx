// The small line icon for each kind of shade source (house, shed, tree, hedge, fence).
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
};

export default function KindIcon({ kind }: { kind: ObstacleKind }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  );
}
