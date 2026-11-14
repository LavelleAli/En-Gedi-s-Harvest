// Footprint math for turned items. Every bed and shade source has a center (x, z), a size (w × d) and
// an optional turn, `rot`, in degrees clockwise as seen on the plan from above (0 = as drawn, w running
// left to right). Placement, shade and the neighbor check use these helpers so a turned fence or bed is
// treated the same everywhere. Pure functions, unit-tested in __tests__/rotation.test.ts.

/** What placement math needs: a center (x, z), a footprint (w × d) in feet, and a turn in degrees. */
export type Footprint = { x: number; z: number; w: number; d: number; rot?: number };

export const ROT_STEP = 15; // degrees per click of the turn buttons, or per press of R

// Any angle -> 0 to 359.x, with floating-point dust dropped (so −15 is 345 and 360 is 0).
export function normalizeRot(deg: number): number {
  const r = ((deg % 360) + 360) % 360;
  const tidy = Math.round(r * 1000) / 1000;
  return tidy >= 360 ? 0 : tidy;
}

// True when the item is turned by something other than a quarter turn (so its edges aren't on the grid).
export function isAskew(item: Pick<Footprint, "rot">): boolean {
  return normalizeRot(item.rot ?? 0) % 90 !== 0;
}

// The turn as a cosine and sine pair (clockwise on the plan, where z runs down).
function turn(item: Pick<Footprint, "rot">): { c: number; s: number } {
  const a = (normalizeRot(item.rot ?? 0) * Math.PI) / 180;
  // Snap the quarter turns exactly, so a 90° bed's box is exactly d × w.
  const round = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.abs(Math.abs(v) - 1) < 1e-12 ? Math.sign(v) : v);
  return { c: round(Math.cos(a)), s: round(Math.sin(a)) };
}

// The size of the upright box around a turned footprint (what it covers left to right and top to bottom).
export function extent(item: Footprint): { w: number; d: number } {
  const { c, s } = turn(item);
  return { w: item.w * Math.abs(c) + item.d * Math.abs(s), d: item.w * Math.abs(s) + item.d * Math.abs(c) };
}

// A point on the item, given in its own frame (u along w, v along d, from its center), on the plan.
export function toPlan(item: Footprint, u: number, v: number): [number, number] {
  const { c, s } = turn(item);
  return [item.x + u * c - v * s, item.z + u * s + v * c];
}

// A plan point in the item's own frame: [u along w, v along d], from its center.
export function toLocal(item: Footprint, x: number, z: number): [number, number] {
  const { c, s } = turn(item);
  const dx = x - item.x;
  const dz = z - item.z;
  return [dx * c + dz * s, -dx * s + dz * c];
}

// Whether a plan point is on the item's footprint.
export function covers(item: Footprint, x: number, z: number): boolean {
  const [u, v] = toLocal(item, x, z);
  return Math.abs(u) <= item.w / 2 + 1e-9 && Math.abs(v) <= item.d / 2 + 1e-9;
}

// The footprint's four corners on the plan, going around.
export function corners(item: Footprint): [number, number][] {
  const hw = item.w / 2;
  const hd = item.d / 2;
  return [toPlan(item, -hw, -hd), toPlan(item, hw, -hd), toPlan(item, hw, hd), toPlan(item, -hw, hd)];
}

// The shortest distance from point p to the segment a–b.
function toSegment([px, pz]: [number, number], [ax, az]: [number, number], [bx, bz]: [number, number]): number {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

// The gap between two footprints in feet: 0 when they touch or overlap, otherwise the shortest
// distance between their edges (turned or not).
export function gapBetween(a: Footprint, b: Footprint): number {
  const ca = corners(a);
  const cb = corners(b);
  if (ca.some(([x, z]) => covers(b, x, z)) || cb.some(([x, z]) => covers(a, x, z))) return 0;
  let gap = Infinity;
  for (let i = 0; i < 4; i++) {
    for (const p of cb) gap = Math.min(gap, toSegment(p, ca[i], ca[(i + 1) % 4]));
    for (const p of ca) gap = Math.min(gap, toSegment(p, cb[i], cb[(i + 1) % 4]));
  }
  // Two thin pieces crossing like an X have no corner inside the other but still overlap.
  return gap < 1e-9 ? 0 : crosses(ca, cb) ? 0 : gap;
}

// Whether any edge of one outline crosses an edge of the other.
function crosses(a: [number, number][], b: [number, number][]): boolean {
  const side = (p: [number, number], q: [number, number], r: [number, number]) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const [p1, p2, q1, q2] = [a[i], a[(i + 1) % 4], b[j], b[(j + 1) % 4]];
      if (side(p1, p2, q1) !== side(p1, p2, q2) && side(q1, q2, p1) !== side(q1, q2, p2)) return true;
    }
  }
  return false;
}
