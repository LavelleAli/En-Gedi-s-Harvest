// The yard's sun-hours map: for every cell of a grid over the yard, how many hours of direct sun it
// gets on a given day, after shade from the house, trees, sheds, hedges and fences. Each sample of the
// sun's position casts a ray from the cell toward the sun; if it hits an obstacle, the cell is shaded.
import { roofHeight } from "@/frontend/planner/model";
import { sunVector } from "@/frontend/planner/sun";

const MAX_CELLS_ACROSS = 120;

// Obstacles as shapes the ray test understands. Houses and sheds count their roof as extra height.
export function shadeShapes(obstacles) {
  return obstacles.map((o) => {
    if (o.kind === "tree") {
      const r = Math.max(o.w, o.d) / 2;
      const canopyR = Math.min(r, o.h / 2);
      return { type: "sphere", cx: o.x, cy: o.h - canopyR, cz: o.z, r: canopyR };
    }
    // A roof's shadow is drawn as a box at its average height: about 75% of the way up a gambrel
    // (it's steep and full most of the way across) and 60% for a shed's gable.
    const roof = roofHeight(o) * (o.kind === "house" ? 0.75 : 0.6);
    return { type: "box", minX: o.x - o.w / 2, maxX: o.x + o.w / 2, minY: 0, maxY: o.h + roof, minZ: o.z - o.d / 2, maxZ: o.z + o.d / 2 };
  });
}

function hitsBox(px, py, pz, dx, dy, dz, b) {
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

function hitsSphere(px, py, pz, dx, dy, dz, s) {
  const ox = px - s.cx;
  const oy = py - s.cy;
  const oz = pz - s.cz;
  const b = ox * dx + oy * dy + oz * dz;
  const c = ox * ox + oy * oy + oz * oz - s.r * s.r;
  const disc = b * b - c;
  if (disc < 0) return false;
  return -b + Math.sqrt(disc) > 0;
}

export function isShaded(px, py, pz, dir, shapes) {
  for (const s of shapes) {
    if (s.type === "box" ? hitsBox(px, py, pz, dir.x, dir.y, dir.z, s) : hitsSphere(px, py, pz, dir.x, dir.y, dir.z, s)) return true;
  }
  return false;
}

// samples: [{ altitude, azimuth }] spaced `stepMinutes` apart (from daySamples).
// Returns { cell, cols, rows, hours: Float32Array, maxHours }.
export function sunHoursGrid(garden, samples, stepMinutes) {
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

// Average and lowest sun hours over a bed's footprint.
export function bedSunHours(bed, grid) {
  const { cell, cols, rows, hours } = grid;
  const c0 = Math.max(0, Math.floor((bed.x - bed.w / 2) / cell));
  const c1 = Math.min(cols - 1, Math.floor((bed.x + bed.w / 2 - 1e-6) / cell));
  const r0 = Math.max(0, Math.floor((bed.z - bed.d / 2) / cell));
  const r1 = Math.min(rows - 1, Math.floor((bed.z + bed.d / 2 - 1e-6) / cell));
  let sum = 0;
  let min = Infinity;
  let n = 0;
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const h = hours[r * cols + c];
      sum += h;
      min = Math.min(min, h);
      n++;
    }
  }
  if (!n) return { avg: 0, min: 0 };
  return { avg: sum / n, min };
}

// Light categories gardeners use, from sun hours.
export function lightClass(hours) {
  if (hours >= 6) return { id: "full", label: "Full sun", range: "6+ hours" };
  if (hours >= 4) return { id: "part-sun", label: "Part sun", range: "4–6 hours" };
  if (hours >= 2) return { id: "part-shade", label: "Part shade", range: "2–4 hours" };
  return { id: "shade", label: "Shade", range: "under 2 hours" };
}
