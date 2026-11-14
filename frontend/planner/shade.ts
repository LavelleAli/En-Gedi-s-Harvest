// The yard's sun-hours map: for every cell of a grid over the yard, how many hours of direct sun it
// gets on a given day, after shade from the house, trees, sheds, hedges and fences. Each sample of the
// sun's position casts a ray from the cell toward the sun; if it hits an obstacle, the cell is shaded.
// A turned building, hedge or fence is a turned box: the ray is turned into the box's own frame first.
import { roofHeight } from "@/frontend/planner/model";
import { sunVector, type SunPosition, type Vec3 } from "@/frontend/planner/sun";
import type { Garden, Obstacle } from "@/frontend/planner/model";
import { covers, extent, isAskew, toLocal, type Footprint } from "@/frontend/planner/footprint";

/** A shape the shade test checks rays against: a box (buildings, hedges, fences) or a sphere (a tree's canopy). */
// A turned box keeps its bounds as drawn (around its center) plus `turn`, the item it was made from.
export type Box = { type: "box"; minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number; turn?: Footprint };
export type Sphere = { type: "sphere"; cx: number; cy: number; cz: number; r: number };
export type Shape = Box | Sphere;
/** Sun hours for every cell of a grid over the yard (row by row), and the most any cell could get. */
export type SunGrid = { cell: number; cols: number; rows: number; hours: Float32Array; maxHours: number };
export type LightClass = { id: "full" | "part-sun" | "part-shade" | "shade"; label: string; range: string };

const MAX_CELLS_ACROSS = 120;

// Obstacles as shapes the ray test understands. Houses and sheds count their roof as extra height.
export function shadeShapes(obstacles: readonly Obstacle[]): Shape[] {
  return obstacles.map((o): Shape => {
    if (o.kind === "tree") {
      const r = Math.max(o.w, o.d) / 2;
      const canopyR = Math.min(r, o.h / 2);
      return { type: "sphere", cx: o.x, cy: o.h - canopyR, cz: o.z, r: canopyR };
    }
    // A roof's shadow is drawn as a box at its average height: about 75% of the way up a gambrel
    // (it's steep and full most of the way across) and 60% for a shed's gable.
    const roof = roofHeight(o) * (o.kind === "house" ? 0.75 : 0.6);
    const box: Box = { type: "box", minX: o.x - o.w / 2, maxX: o.x + o.w / 2, minY: 0, maxY: o.h + roof, minZ: o.z - o.d / 2, maxZ: o.z + o.d / 2 };
    return o.rot ? { ...box, turn: { x: o.x, z: o.z, w: o.w, d: o.d, rot: o.rot } } : box;
  });
}

function hitsBox(px: number, py: number, pz: number, dx: number, dy: number, dz: number, b: Box): boolean {
  if (b.turn) {
    // Turn the ray's start and direction into the box's own frame (around its center).
    const t = b.turn;
    const [u, v] = toLocal(t, px, pz);
    const [du, dv] = toLocal({ ...t, x: 0, z: 0 }, dx, dz);
    [px, pz, dx, dz] = [t.x + u, t.z + v, du, dv];
  }
  let tmin = 0;
  let tmax = Infinity;
  const axes = [
    [px, dx, b.minX, b.maxX],
    [py, dy, b.minY, b.maxY],
    [pz, dz, b.minZ, b.maxZ],
  ];
  for (const [p, d, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return tmax > 0;
}

function hitsSphere(px: number, py: number, pz: number, dx: number, dy: number, dz: number, s: Sphere): boolean {
  const ox = px - s.cx;
  const oy = py - s.cy;
  const oz = pz - s.cz;
  const b = ox * dx + oy * dy + oz * dz;
  const c = ox * ox + oy * oy + oz * oz - s.r * s.r;
  const disc = b * b - c;
  if (disc < 0) return false;
  return -b + Math.sqrt(disc) > 0;
}

export function isShaded(px: number, py: number, pz: number, dir: Vec3, shapes: readonly Shape[]): boolean {
  for (const s of shapes) {
    if (s.type === "box" ? hitsBox(px, py, pz, dir.x, dir.y, dir.z, s) : hitsSphere(px, py, pz, dir.x, dir.y, dir.z, s)) return true;
  }
  return false;
}

// samples: [{ altitude, azimuth }] spaced `stepMinutes` apart (from daySamples).
// Returns { cell, cols, rows, hours: Float32Array, maxHours }.
export function sunHoursGrid(garden: Pick<Garden, "yard" | "obstacles">, samples: readonly SunPosition[], stepMinutes: number): SunGrid {
  const { w, d, north } = garden.yard;
  const cell = Math.max(0.5, Math.max(w, d) / MAX_CELLS_ACROSS);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(d / cell);
  const hours = new Float32Array(cols * rows);
  const shapes = shadeShapes(garden.obstacles);
  const stepHours = stepMinutes / 60;
  for (const s of samples) {
    const dir = sunVector(s.altitude, s.azimuth, north);
    for (let r = 0; r < rows; r++) {
      const pz = (r + 0.5) * cell;
      for (let c = 0; c < cols; c++) {
        const px = (c + 0.5) * cell;
        if (!isShaded(px, 0.3, pz, dir, shapes)) hours[r * cols + c] += stepHours;
      }
    }
  }
  return { cell, cols, rows, hours, maxHours: samples.length * stepHours };
}

// Average and lowest sun hours over a bed's footprint. For a bed turned off the grid, only the cells
// whose middles fall on the bed count (or the cell under its center, for a bed smaller than a cell).
export function bedSunHours(bed: Footprint, grid: SunGrid): { avg: number; min: number } {
  const { cell, cols, rows, hours } = grid;
  const box = extent(bed);
  const askew = isAskew(bed);
  const c0 = Math.max(0, Math.floor((bed.x - box.w / 2) / cell));
  const c1 = Math.min(cols - 1, Math.floor((bed.x + box.w / 2 - 1e-6) / cell));
  const r0 = Math.max(0, Math.floor((bed.z - box.d / 2) / cell));
  const r1 = Math.min(rows - 1, Math.floor((bed.z + box.d / 2 - 1e-6) / cell));
  let sum = 0;
  let min = Infinity;
  let n = 0;
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (askew && !covers(bed, (c + 0.5) * cell, (r + 0.5) * cell)) continue;
      const h = hours[r * cols + c];
      sum += h;
      min = Math.min(min, h);
      n++;
    }
  }
  if (!n && askew) {
    const c = Math.min(cols - 1, Math.max(0, Math.floor(bed.x / cell)));
    const r = Math.min(rows - 1, Math.max(0, Math.floor(bed.z / cell)));
    return { avg: hours[r * cols + c], min: hours[r * cols + c] };
  }
  if (!n) return { avg: 0, min: 0 };
  return { avg: sum / n, min };
}

// Light categories gardeners use, from sun hours.
export function lightClass(hours: number): LightClass {
  if (hours >= 6) return { id: "full", label: "Full sun", range: "6+ hours" };
  if (hours >= 4) return { id: "part-sun", label: "Part sun", range: "4–6 hours" };
  if (hours >= 2) return { id: "part-shade", label: "Part shade", range: "2–4 hours" };
  return { id: "shade", label: "Shade", range: "under 2 hours" };
}
