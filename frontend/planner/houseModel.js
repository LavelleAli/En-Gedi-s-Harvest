// 3D models for the planner's buildings (used by GardenScene.js).
//
// House: a Dutch Colonial, after the reference photo. All sizes come from the item's footprint
// (w × d) and its wall height (h, the first floor):
//   - a gambrel roof (steep lower slopes, shallow upper ones) whose eaves flare out past the walls
//   - a wide shed dormer across the front of the roof holding the upstairs windows
//   - a small peaked porch roof on two columns over the front door, with brick steps
//   - windows with white trim and blue shutters
// The long side is the front. When the house is deeper than it is wide, the model is turned so the
// long side still faces out (the front then faces the plan's right instead of its bottom).
//
// Shed: a plain gable roof running along its long side, with a door.
//
// The model is built in its own frame: x along the front, y up, z toward the viewer (front at +z),
// with the ground at y = 0 and the footprint centered on the origin.
import * as THREE from "three";
import { roofHeight } from "@/frontend/planner/model";

// The gambrel's shape, as shares of the half-depth `a`: the lower slope breaks at 60% of the way in
// from the wall, 0.86·a above the wall top (about 65°); the ridge is 1.14·a above the wall top.
// roofHeight() in model.js uses the same 1.14 so the sun-hours map shades with the same height.
const BREAK_IN = 0.6;
const BREAK_UP = 0.86;
const EAVE_OUT = 0.6; // ft the eaves reach past the walls
const RAKE = 0.5; // ft the roof reaches past the end walls

function materialCache() {
  const cache = new Map();
  return (color, roughness = 0.85) => {
    const key = `${color}-${roughness}`;
    if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color, roughness }));
    return cache.get(key);
  };
}

function adder(group, mat) {
  // Adds a mesh at (x, y, z) and returns it so callers can rotate it.
  return (geo, color, x, y, z, roughness) => {
    const m = new THREE.Mesh(geo, mat(color, roughness));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
}

// A flat board running the length of the roof (along x), laid between two points of the roof's
// profile (z, y). Used for each slope of the roof.
function slab(add, color, length, [z1, y1], [z2, y2], thickness = 0.35) {
  const dz = z2 - z1;
  const dy = y2 - y1;
  const len = Math.hypot(dz, dy);
  const m = add(new THREE.BoxGeometry(length, thickness, len), color, 0, (y1 + y2) / 2, (z1 + z2) / 2, 0.95);
  m.rotation.x = Math.atan2(-dy, dz);
  return m;
}

// A polygon in the (z, y) profile plane, extruded along x by `length` and centered on x = 0.
function prism(points, length) {
  const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  // The shape is drawn in x/y and extruded along z; turn it so the profile is z/y and length is x.
  geo.rotateY(-Math.PI / 2);
  geo.translate(length / 2, 0, 0);
  return geo;
}

// A window on a wall facing +z at `z`: dark glass, white trim and a blue shutter on each side.
function windowAt(add, p, x, y, z, w, h, shutters = true) {
  add(new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.12), p.trim, x, y, z + 0.06);
  add(new THREE.BoxGeometry(w, h, 0.16), p.glass, x, y, z + 0.1, 0.3);
  // Muntins: one bar across and one down, so it reads as a divided-light window.
  add(new THREE.BoxGeometry(w, 0.12, 0.2), p.trim, x, y + h * 0.1, z + 0.12);
  add(new THREE.BoxGeometry(0.12, h, 0.2), p.trim, x, y, z + 0.12);
  if (!shutters) return;
  const sw = Math.max(0.6, w * 0.42);
  for (const side of [-1, 1]) add(new THREE.BoxGeometry(sw, h, 0.12), p.shutter, x + side * (w / 2 + 0.35 + sw / 2), y, z + 0.08);
}

// Evenly spaced centers for `count` items along a run of `length`.
const spread = (count, length) => Array.from({ length: count }, (_, i) => (count === 1 ? 0 : -length / 2 + (length * i) / (count - 1)));

function buildDutchColonial(o, p) {
  const group = new THREE.Group();
  const add = adder(group, materialCache());
  const turned = o.d > o.w;
  const L = turned ? o.d : o.w; // length of the front
  const D = turned ? o.w : o.d; // depth, front to back
  const a = D / 2;
  const h = o.h;
  const R = roofHeight({ ...o, w: L, d: D });
  const zb = a * BREAK_IN; // where the slope breaks, measured from the middle
  const yb = h + a * BREAK_UP;
  const lowerSlope = (a * BREAK_UP) / (a - zb); // rise per foot of the steep lower slope
  const eave = [a + EAVE_OUT, h - EAVE_OUT * lowerSlope * 0.6]; // flares out a little flatter
  const roofLen = L + RAKE * 2;

  // First floor walls.
  add(new THREE.BoxGeometry(L, h, D), p.houseWall, 0, h / 2, 0);
  // The upper story inside the roof: the gambrel shape, which also makes the end walls.
  add(prism([[-a, h], [a, h], [zb, yb], [0, h + R], [-zb, yb]], L), p.houseWall, 0, 0, 0);

  // Roof: four slopes, front and back, steep below the break and shallow above it.
  for (const s of [1, -1]) {
    slab(add, p.houseRoof, roofLen, [s * eave[0], eave[1]], [s * zb, yb]);
    slab(add, p.houseRoof, roofLen, [s * zb, yb], [0, h + R]);
  }
  // White trim along the eaves and the ridge.
  for (const s of [1, -1]) add(new THREE.BoxGeometry(roofLen, 0.35, 0.3), p.trim, 0, eave[1] - 0.05, s * (eave[0] + 0.05));
  add(new THREE.BoxGeometry(roofLen, 0.25, 0.5), p.houseRoof, 0, h + R + 0.12, 0);

  // Front shed dormer: a wall set just back from the first floor, up to the break, under a lip of roof.
  const big = L >= 14 && a >= 4;
  const dormerFace = a * 0.88;
  const dormerW = Math.min(L * 0.8, L - 2);
  if (big) {
    add(new THREE.BoxGeometry(dormerW, yb - h, dormerFace), p.houseWall, 0, h + (yb - h) / 2, dormerFace / 2);
    slab(add, p.houseRoof, dormerW + 0.8, [zb - 0.2, yb + 0.25], [dormerFace + 0.6, yb - 0.05], 0.3);
    add(new THREE.BoxGeometry(dormerW + 0.8, 0.3, 0.25), p.trim, 0, yb - 0.2, dormerFace + 0.62);
    // Upstairs windows: where the lower roof meets the dormer face up to just under its lip.
    const roofAtFace = h + (a - dormerFace) * lowerSlope;
    const room = yb - 0.4 - roofAtFace;
    const wh = Math.min(4.5, room * 0.78);
    if (wh > 1.2) {
      // About one window per 11 ft of front, never fewer than 2.
      const count = Math.max(2, Math.round(L / 11));
      for (const x of spread(count, dormerW * (count === 2 ? 0.55 : 0.8))) windowAt(add, p, x, roofAtFace + room / 2 + 0.1, dormerFace, wh * 0.68, wh);
    }
  }

  // Front of the first floor: windows either side of a door under a peaked porch roof.
  const porch = L >= 12 && h >= 8;
  const stoop = porch ? 0.6 : 0; // the porch floor's height; the door sits on it
  const doorH = Math.min(7, h * 0.62 - stoop);
  const doorW = doorH * 0.45;
  if (L >= 10) {
    add(new THREE.BoxGeometry(doorW + 0.5, doorH + 0.3, 0.12), p.trim, 0, stoop + (doorH + 0.3) / 2, a + 0.06);
    add(new THREE.BoxGeometry(doorW, doorH, 0.2), p.door, 0, stoop + doorH / 2, a + 0.1, 0.6);
  }
  if (L >= 16) {
    // Windows either side of the door, about one per 10 ft of wall.
    const wh = Math.min(5, h * 0.42);
    const perSide = Math.max(1, Math.round((L / 2 - 4) / 10));
    const reach = (wh * 0.66) / 2 + 0.35 + Math.max(0.6, wh * 0.66 * 0.42); // half a window with its shutters
    const from = doorW / 2 + 1.5 + reach + 2; // clear of the porch columns
    const to = L / 2 - reach - 1; // clear of the corners
    for (let i = 0; i < perSide; i++) {
      const x = perSide === 1 ? L * 0.3 : from + ((to - from) * i) / (perSide - 1);
      for (const side of [-1, 1]) windowAt(add, p, side * x, h * 0.52, a, wh * 0.66, wh);
    }
  }
  if (porch) {
    // Two columns, a flat ceiling and a small gable (pediment) facing the front.
    const pw = doorW + 3; // porch width
    const depth = Math.min(4, a * 0.5);
    const top = Math.min(h - 0.3, stoop + doorH + 1.6);
    // Brick porch floor and one step down in front of it.
    add(new THREE.BoxGeometry(pw + 0.6, stoop, depth), p.brick, 0, stoop / 2, a + depth / 2, 0.95);
    add(new THREE.BoxGeometry(pw - 0.4, stoop / 2, 1.1), p.brick, 0, stoop / 4, a + depth + 0.55, 0.95);
    for (const x of [-1, 1]) add(new THREE.CylinderGeometry(0.22, 0.25, top - stoop, 12), p.trim, (x * pw) / 2, stoop + (top - stoop) / 2, a + depth - 0.35);
    add(new THREE.BoxGeometry(pw + 0.6, 0.5, depth + 0.2), p.trim, 0, top + 0.25, a + depth / 2);
    const peak = pw * 0.32;
    const pediment = new THREE.Shape([new THREE.Vector2(-pw / 2 - 0.3, 0), new THREE.Vector2(pw / 2 + 0.3, 0), new THREE.Vector2(0, peak)]);
    add(new THREE.ExtrudeGeometry(pediment, { depth: depth + 0.2, bevelEnabled: false }), p.trim, 0, top + 0.5, a);
    // The porch roof: two boards running front to back, meeting at the peak.
    for (const s of [-1, 1]) {
      const run = pw / 2 + 0.5;
      const len = Math.hypot(run, peak + 0.1);
      const board = add(new THREE.BoxGeometry(len, 0.22, depth + 0.6), p.houseRoof, (s * run) / 2, top + 0.6 + peak / 2, a + (depth + 0.2) / 2, 0.95);
      board.rotation.z = -s * Math.atan2(peak + 0.1, run);
    }
  }

  // A pair of upstairs windows in each end wall, in the gambrel.
  if (big) {
    const wh = Math.min(4, (yb - h) * 0.55);
    for (const s of [-1, 1]) {
      const end = new THREE.Group();
      const addEnd = adder(end, materialCache());
      for (const z of [-a * 0.3, a * 0.3]) windowAt(addEnd, p, z, h + (yb - h) * 0.5, 0, wh * 0.66, wh, false);
      end.rotation.y = (s * Math.PI) / 2;
      end.position.x = (s * L) / 2;
      group.add(end);
    }
  }

  if (turned) group.rotation.y = Math.PI / 2;
  return group;
}

function buildShed(o, p) {
  const group = new THREE.Group();
  const add = adder(group, materialCache());
  const turned = o.d > o.w;
  const L = turned ? o.d : o.w;
  const D = turned ? o.w : o.d;
  const a = D / 2;
  const R = roofHeight({ ...o, w: L, d: D });
  add(new THREE.BoxGeometry(L, o.h, D), p.wall, 0, o.h / 2, 0);
  add(prism([[-a, o.h], [a, o.h], [0, o.h + R]], L), p.wall, 0, 0, 0);
  const over = 0.4;
  const slope = R / a;
  for (const s of [1, -1]) slab(add, p.roof, L + 0.6, [s * (a + over), o.h - over * slope], [0, o.h + R], 0.25);
  const doorH = Math.min(6, o.h * 0.8);
  const doorW = Math.min(3.5, L * 0.4);
  add(new THREE.BoxGeometry(doorW, doorH, 0.15), p.wood, 0, doorH / 2, a + 0.08);
  add(new THREE.BoxGeometry(doorW + 0.3, 0.2, 0.2), p.trim, 0, doorH, a + 0.1);
  if (turned) group.rotation.y = Math.PI / 2;
  return group;
}

export function buildBuilding(o, palette) {
  return o.kind === "house" ? buildDutchColonial(o, palette) : buildShed(o, palette);
}
