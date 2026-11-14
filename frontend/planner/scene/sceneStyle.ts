// The sandbox: the 3D view's box (GardenScene.tsx) and its placeholder while three.js loads, so the page
// doesn't jump when the scene arrives. At least 300 × 300px; it fills its column's width and grows to 62%
// of the window's height (up to 40rem).
export const SCENE_BOX = "relative h-[clamp(300px,62vh,40rem)] min-w-[300px] overflow-hidden rounded-lg border border-line bg-surface shadow-card";
