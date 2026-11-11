// The garden plan: yard size and orientation, beds, and the things that cast shade (house, trees,
// fences). Saved in this browser's localStorage. Positions are in feet from the plan's top-left
// corner and mark each item's center; w runs left to right, d top to bottom, h is height.
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { CropSchema, type Crop } from "@/shared/crop";

export const GARDEN_KEY = "fhb-garden";
export const CROPS_KEY = "fhb-crops";
const EVENT = "fhb-garden-change";

export const BED_TYPES = { raised: "Raised bed", "in-ground": "In-ground bed" } as const;
export type BedType = keyof typeof BED_TYPES;
export const OBSTACLE_KINDS = ["house", "shed", "tree", "hedge", "fence"] as const;
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];
/** Each kind's label and the size a new one starts at (feet). */
export const OBSTACLES: Record<ObstacleKind, { label: string; w: number; d: number; h: number }> = {
  house: { label: "House", w: 30, d: 20, h: 12 },
  shed: { label: "Shed", w: 8, d: 10, h: 8 },
  tree: { label: "Tree", w: 16, d: 16, h: 25 },
  hedge: { label: "Hedge", w: 12, d: 3, h: 5 },
  fence: { label: "Fence", w: 20, d: 0.5, h: 6 },
};

const num = (min: number, max: number) => z.number().finite().min(min).max(max);
const id = z.string().regex(/^[a-z0-9-]{1,40}$/);

const BedSchema = z.object({
  id, kind: z.literal("bed"), name: z.string().max(40),
  type: z.enum(["raised", "in-ground"]),
  x: num(-50, 600), z: num(-50, 600), w: num(1, 100), d: num(1, 100), h: num(0, 4),
  crops: z.array(z.string().max(60)).max(12),
});
const ObstacleSchema = z.object({
  id, kind: z.enum(OBSTACLE_KINDS), name: z.string().max(40),
  x: num(-50, 600), z: num(-50, 600), w: num(0.3, 200), d: num(0.3, 200), h: num(1, 120),
});
export const GardenSchema = z.object({
  v: z.literal(1),
  yard: z.object({ w: num(10, 400), d: num(10, 400), north: num(0, 360) }),
  beds: z.array(BedSchema).max(60),
  obstacles: z.array(ObstacleSchema).max(60),
});

// A starter yard: a house along the top edge, a shade tree, and one bed of each kind.
export type Garden = z.infer<typeof GardenSchema>;
export type Yard = Garden["yard"];
export type Bed = Garden["beds"][number];
export type Obstacle = Garden["obstacles"][number];
/** Anything placed in the yard: a bed or a shade source. */
export type Item = Bed | Obstacle;
/** What placement math needs: a center (x, z) and a footprint (w × d), in feet. */
export type Footprint = { x: number; z: number; w: number; d: number };

export const STARTER_GARDEN: Garden = {
  v: 1,
  yard: { w: 60, d: 44, north: 0 },
  obstacles: [
    { id: "house", kind: "house", name: "House", x: 24, z: 7, w: 34, d: 14, h: 12 },
    { id: "oak", kind: "tree", name: "Oak", x: 52, z: 34, w: 18, d: 18, h: 30 },
  ],
  beds: [
    { id: "bed-1", kind: "bed", name: "Raised bed 1", type: "raised", x: 14, z: 30, w: 4, d: 8, h: 1, crops: ["tomato", "basil"] },
    { id: "bed-2", kind: "bed", name: "Kitchen plot", type: "in-ground", x: 30, z: 31, w: 12, d: 8, h: 0, crops: ["green-beans", "summer-squash", "lettuce"] },
  ],
};

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

// Parses a stored string once and keeps the result, so hooks return the same object until it changes.
function cached<T>(parseFn: (data: unknown) => T | null, fallback: T) {
  let memo: { raw: string | null; value: T } = { raw: null, value: fallback };
  return (raw: string): T => {
    if (raw === memo.raw) return memo.value;
    let value = fallback;
    if (raw) {
      try {
        value = parseFn(JSON.parse(raw)) ?? fallback;
      } catch {}
    }
    memo = { raw, value };
    return value;
  };
}

const parseGarden = cached<Garden>((data) => {
  const result = GardenSchema.safeParse(data);
  return result.success ? result.data : null;
}, STARTER_GARDEN);

const parseCrops = cached<Crop[]>((data) => {
  if (!Array.isArray(data)) return [];
  return data.map((c) => CropSchema.safeParse(c)).filter((r) => r.success).map((r) => r.data);
}, []);

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

// [garden, update] — update takes a function from the current garden to the next one.
export function useGarden() {
  const garden = parseGarden(useSyncExternalStore(subscribe, () => read(GARDEN_KEY), () => ""));
  const update = (fn: (current: Garden) => Garden) => {
    const next = GardenSchema.safeParse(fn(parseGarden(read(GARDEN_KEY))));
    if (next.success) write(GARDEN_KEY, next.data);
  };
  const reset = () => write(GARDEN_KEY, null);
  return [garden, update, reset] as const;
}

// Crops the reader added (researched or typed in), kept alongside the stock catalog.
export function useCustomCrops() {
  const crops = parseCrops(useSyncExternalStore(subscribe, () => read(CROPS_KEY), () => ""));
  const save = (crop: Crop) => {
    const current = parseCrops(read(CROPS_KEY));
    write(CROPS_KEY, [...current.filter((c) => c.id !== crop.id), crop]);
  };
  const remove = (cropId: string) => write(CROPS_KEY, parseCrops(read(CROPS_KEY)).filter((c) => c.id !== cropId));
  return [crops, save, remove] as const;
}

// Keep an item inside the yard.
export function clampToYard<T extends Footprint>(item: T, yard: Yard): T {
  const halfW = Math.min(item.w, yard.w) / 2;
  const halfD = Math.min(item.d, yard.d) / 2;
  const snap = (v: number) => Math.round(v * 2) / 2;
  return {
    ...item,
    x: Math.min(yard.w - halfW, Math.max(halfW, snap(item.x))),
    z: Math.min(yard.d - halfD, Math.max(halfD, snap(item.z))),
  };
}

// ---------- Roof height ----------
// How far a building's roof rises above its walls, in feet. The house is a Dutch Colonial: its
// gambrel roof holds the upstairs, so it rises 1.14 × half its depth (see houseModel.ts). Sheds get a
// low gable. Shared by the 3D model and the sun-hours map so the shade matches what you see.
export function roofHeight(o: { kind: string; w: number; d: number }): number {
  const depth = Math.min(o.w, o.d);
  if (o.kind === "house") return depth * 0.57;
  if (o.kind === "shed") return depth * 0.3;
  return 0;
}

// ---------- Snap to grid ----------
// Dragging, arrow-key nudges and new items line up on a grid, like Blender's increment snapping.
// The item's top-left corner lands on a grid line (so its edges line up, not its middle), then it's
// kept inside the yard. Typing a position in the editor isn't snapped: a typed number is kept.
export const SNAP_KEY = "fhb-snap";
export const SNAP_STEPS = [0.5, 1, 2, 5]; // feet
export type Snap = { on: boolean; step: number };
export const DEFAULT_SNAP: Snap = { on: true, step: 1 };

export function snapToGrid<T extends Footprint>(item: T, yard: Yard, step: number): T {
  if (!step) return clampToYard(item, yard);
  const w = Math.min(item.w, yard.w);
  const d = Math.min(item.d, yard.d);
  const onGrid = (v: number) => Math.round(v / step) * step;
  const round = (v: number) => Math.round(v * 1000) / 1000; // drops floating-point dust like 12.000000001
  return {
    ...item,
    x: round(Math.min(yard.w - w / 2, Math.max(w / 2, onGrid(item.x - w / 2) + w / 2))),
    z: round(Math.min(yard.d - d / 2, Math.max(d / 2, onGrid(item.z - d / 2) + d / 2))),
  };
}

const parseSnap = cached<Snap>((data) => {
  const d = data as Partial<Snap> | null;
  const ok = typeof d?.on === "boolean" && typeof d.step === "number" && SNAP_STEPS.includes(d.step);
  return ok ? { on: d.on!, step: d.step! } : null;
}, DEFAULT_SNAP);

// [snap, setSnap] — the snap setting, kept in this browser. snap.on is the switch, snap.step the size.
export function useSnap() {
  const snap = parseSnap(useSyncExternalStore(subscribe, () => read(SNAP_KEY), () => ""));
  const setSnap = (patch: Partial<Snap>) => write(SNAP_KEY, { ...parseSnap(read(SNAP_KEY)), ...patch });
  return [snap, setSnap] as const;
}

// ---------- Yard size in acres ----------
// The planner stores the yard as width × depth in feet. These helpers turn an acreage into a
// square yard and back. 1 acre = 43,560 square feet, so 1 acre is about 209 × 209 ft.
export const SQ_FT_PER_ACRE = 43_560;
export const YARD_SIDE = { min: 10, max: 400 }; // same limits as GardenSchema's yard.w and yard.d
export const MAX_SQUARE_ACRES = (YARD_SIDE.max * YARD_SIDE.max) / SQ_FT_PER_ACRE; // about 3.67

// Acres -> { w, d } of a square yard, rounded to whole feet and kept within the planner's limits.
export function squareYardForAcres(acres: number): { w: number; d: number } {
  const side = Math.round(Math.sqrt(Math.max(0, acres) * SQ_FT_PER_ACRE));
  const clamped = Math.min(YARD_SIDE.max, Math.max(YARD_SIDE.min, side));
  return { w: clamped, d: clamped };
}

export function yardAcres(yard: Pick<Yard, "w" | "d">): number {
  return (yard.w * yard.d) / SQ_FT_PER_ACRE;
}

// After the yard changes size, move every bed and shade source back inside it.
export function fitToYard(garden: Garden): Garden {
  const fit = <T extends Footprint>(item: T) => clampToYard(item, garden.yard);
  return { ...garden, beds: garden.beds.map(fit), obstacles: garden.obstacles.map(fit) };
}

// ---------- Copying shade sources: duplicates, rows and edge lines ----------
// Used by the Shade sources panel (ShadePalette.tsx) to build fence borders and treelines.
export const MAX_OBSTACLES = 60; // same as GardenSchema's obstacles limit
const MAX_PIECE_FT = 200; // the longest single piece GardenSchema allows (w and d)
const STRETCHY = new Set(["fence", "hedge"]); // these stretch along an edge instead of repeating

// "Oak" -> "Oak 2", or "Oak 3" when "Oak 2" exists.
export function nextName(name: string, items: readonly { name: string }[]): string {
  const base = name.replace(/ \d+$/, "");
  const taken = items.map((i) => i.name).filter((n) => n === base || n.startsWith(base + " "));
  const highest = taken.reduce((n, t) => Math.max(n, Number(t.slice(base.length + 1)) || 1), 1);
  return `${base} ${highest + 1}`.slice(0, 40);
}

const inside = (item: Footprint, yard: Yard): boolean => item.x - item.w / 2 >= -0.01 && item.x + item.w / 2 <= yard.w + 0.01 && item.z - item.d / 2 >= -0.01 && item.z + item.d / 2 <= yard.d + 0.01;

// One copy placed end to end with the original along its long side (a fence or hedge continues
// its line; a tree goes beside it). If there's no room on that side, it goes on the other side.
export function duplicateNextTo(item: Obstacle, yard: Yard, items: readonly Item[]): Obstacle {
  const across = item.w >= item.d;
  const step = across ? item.w : item.d;
  const tryAt = (dir: number): Obstacle => ({ ...item, ...(across ? { x: item.x + dir * step } : { z: item.z + dir * step }) });
  const placed = [tryAt(1), tryAt(-1)].find((c) => inside(c, yard)) ?? tryAt(1);
  return clampToYard({ ...placed, id: newId(item.kind), name: nextName(item.name, items) }, yard);
}

// `count` copies in a straight line after the original, `gap` feet apart, going "across" (left to
// right) or "down" (top to bottom). Copies that would leave the yard, or go past the limit, are skipped.
/** Copies made for a row or an edge, and how many didn't fit. */
export type Copies = { added: Obstacle[]; skipped: number };
export type Edge = "top" | "bottom" | "left" | "right";

export function rowOf(item: Obstacle, { count, direction, gap = 0 }: { count: number; direction: "across" | "down"; gap?: number }, yard: Yard, items: readonly Item[]): Copies {
  const room = MAX_OBSTACLES - items.filter((i) => i.kind !== "bed").length;
  const step = (direction === "across" ? item.w : item.d) + Math.max(0, gap);
  const added: Obstacle[] = [];
  let all: Item[] = [...items];
  for (let i = 1; i <= count && added.length < room; i++) {
    const copy = { ...item, ...(direction === "across" ? { x: item.x + i * step } : { z: item.z + i * step }) };
    if (!inside(copy, yard)) break;
    const named = { ...copy, id: newId(item.kind), name: nextName(item.name, all) };
    added.push(named);
    all = [...all, named];
  }
  return { added, skipped: Math.max(0, count - added.length) };
}

// Lines a whole edge of the yard ("top", "bottom", "left" or "right") with copies of the item.
// Fences and hedges become as few long pieces as possible (200 ft at most each); trees, sheds and
// houses repeat side by side, `gap` feet apart. The original stays where it is.
export function lineEdge(item: Obstacle, edge: Edge, yard: Yard, items: readonly Item[], gap = 0): Copies {
  const room = MAX_OBSTACLES - items.filter((i) => i.kind !== "bed").length;
  const horizontal = edge === "top" || edge === "bottom";
  const length = horizontal ? yard.w : yard.d;
  const thick = STRETCHY.has(item.kind) ? Math.min(item.w, item.d) : horizontal ? item.d : item.w;
  const along = STRETCHY.has(item.kind) ? null : horizontal ? item.w : item.d;
  // Where each piece's center sits across the edge: just inside the yard boundary.
  const offset = edge === "top" || edge === "left" ? thick / 2 : (horizontal ? yard.d : yard.w) - thick / 2;

  const pieces: { center: number; size: number }[] = [];
  if (along === null) {
    const n = Math.ceil(length / MAX_PIECE_FT);
    const size = length / n;
    for (let i = 0; i < n; i++) pieces.push({ center: size * (i + 0.5), size });
  } else {
    const n = Math.max(1, Math.floor((length + gap) / (along + gap)));
    const used = n * along + (n - 1) * gap;
    const start = (length - used) / 2 + along / 2; // centered along the edge
    for (let i = 0; i < n; i++) pieces.push({ center: start + i * (along + gap), size: along });
  }

  const added: Obstacle[] = [];
  let all: Item[] = [...items];
  for (const p of pieces.slice(0, room)) {
    const footprint = horizontal ? { w: p.size, d: thick, x: p.center, z: offset } : { w: thick, d: p.size, x: offset, z: p.center };
    const piece = clampToYard({ ...item, ...footprint, id: newId(item.kind), name: nextName(item.name, all) }, yard);
    added.push(piece);
    all = [...all, piece];
  }
  return { added, skipped: pieces.length - added.length };
}
