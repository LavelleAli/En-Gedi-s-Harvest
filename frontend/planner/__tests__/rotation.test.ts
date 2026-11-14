// Turning beds and shade sources: the footprint math, keeping turned items in the yard, copies that
// follow the turn, turned shadows, and the neighbor check for turned beds.
import { describe, expect, it } from "vitest";
import { corners, covers, extent, gapBetween, normalizeRot } from "@/frontend/planner/footprint";
import { GardenSchema, clampToYard, duplicateNextTo, lineEdge, snapToGrid } from "@/frontend/planner/model";
import { bedSunHours, isShaded, shadeShapes } from "@/frontend/planner/shade";
import { sunVector } from "@/frontend/planner/sun";
import { companionReport } from "@/frontend/planner/analysis";
import { CATALOG, CATALOG_BY_ID } from "@/shared/catalog";
import { makeBed, makeGarden, makeObstacle } from "@/frontend/planner/__tests__/fixtures";

const yard = { w: 60, d: 44, north: 0 };

describe("turn angles", () => {
  it("keeps angles between 0 and 360", () => {
    expect(normalizeRot(-15)).toBe(345);
    expect(normalizeRot(360)).toBe(0);
    expect(normalizeRot(375)).toBe(15);
  });

  it("loads plans saved before turning existed, and stores turns as 0–359", () => {
    const old = GardenSchema.parse(makeGarden({ beds: [makeBed()] }));
    expect(old.beds[0].rot).toBeUndefined();
    const turned = GardenSchema.parse(makeGarden({ beds: [makeBed({ rot: -90 })] }));
    expect(turned.beds[0].rot).toBe(270);
  });
});

describe("turned footprints", () => {
  it("swaps width and depth at a quarter turn", () => {
    expect(extent({ x: 0, z: 0, w: 4, d: 8, rot: 90 })).toEqual({ w: 8, d: 4 });
  });

  it("covers a wider box at 45°", () => {
    const box = extent({ x: 0, z: 0, w: 10, d: 0, rot: 45 });
    expect(box.w).toBeCloseTo(7.071, 3);
    expect(box.d).toBeCloseTo(7.071, 3);
  });

  it("turns clockwise on the plan (z runs down)", () => {
    // A fence along x, turned 90°, runs top to bottom: its right end moves down.
    const [, rightTop] = corners({ x: 0, z: 0, w: 10, d: 0, rot: 90 });
    expect(rightTop[0]).toBeCloseTo(0, 9);
    expect(rightTop[1]).toBeCloseTo(5, 9);
    expect(covers({ x: 0, z: 0, w: 10, d: 1, rot: 90 }, 0, 4)).toBe(true);
    expect(covers({ x: 0, z: 0, w: 10, d: 1, rot: 90 }, 4, 0)).toBe(false);
  });
});

describe("placing turned items", () => {
  it("keeps a turned bed inside the yard by its turned size", () => {
    const bed = clampToYard(makeBed({ x: 1, z: 1, w: 4, d: 8, rot: 90 }), yard);
    expect(bed).toMatchObject({ x: 4, z: 2 });
  });

  it("snaps a turned bed's box to the grid", () => {
    const bed = snapToGrid(makeBed({ x: 10.3, z: 10.3, w: 4, d: 8, rot: 90 }), yard, 1);
    expect(bed.x - 4).toBe(Math.round(bed.x - 4)); // its left edge (8 ft wide now) is on a grid line
    expect(bed.z - 2).toBe(Math.round(bed.z - 2));
  });

  it("continues a turned fence along its own line", () => {
    const fence = makeObstacle({ kind: "fence", name: "Fence", x: 20, z: 20, w: 10, d: 0.5, h: 6, rot: 30 });
    const copy = duplicateNextTo(fence, yard, [fence]);
    expect(copy.rot).toBe(30);
    expect(copy.x).toBeCloseTo(20 + 10 * Math.cos(Math.PI / 6), 2);
    expect(copy.z).toBeCloseTo(20 + 10 * Math.sin(Math.PI / 6), 2);
  });

  it("lines an edge with straight fence pieces even from a turned fence", () => {
    const fence = makeObstacle({ kind: "fence", name: "Fence", x: 20, z: 20, w: 10, d: 0.5, h: 6, rot: 30 });
    const { added } = lineEdge(fence, "top", yard, [fence]);
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ rot: 0, w: 60, d: 0.5 });
    expect(added[0].z).toBeLessThanOrEqual(0.5); // along the top edge
  });
});

describe("turned shade", () => {
  it("casts a turned fence's shadow where the fence now runs", () => {
    // A fence along x at z = 10 shades just north of it; turned 90°, it runs north–south instead.
    const dir = sunVector(30, 180, 0);
    const straight = shadeShapes([makeObstacle({ kind: "fence", x: 10, z: 10, w: 20, d: 0.5, h: 6 })]);
    const turned = shadeShapes([makeObstacle({ kind: "fence", x: 10, z: 10, w: 20, d: 0.5, h: 6, rot: 90 })]);
    expect(isShaded(18, 0.3, 8, dir, straight)).toBe(true);
    expect(isShaded(18, 0.3, 8, dir, turned)).toBe(false); // 8 ft east of the turned fence, nothing in the way
    expect(isShaded(10, 0.3, -1, dir, turned)).toBe(true); // just north of its top end
  });

  it("averages only the cells a turned bed covers", () => {
    // Sun hours are 0 on the left half of the grid and 10 on the right.
    const cols = 20;
    const rows = 20;
    const hours = new Float32Array(cols * rows).map((_, i) => (i % cols < 10 ? 0 : 10));
    const grid = { cell: 1, cols, rows, hours, maxHours: 10 };
    // A long thin bed turned 90° sits in a single column on the right half.
    expect(bedSunHours({ x: 15.5, z: 10, w: 10, d: 1, rot: 90 }, grid).avg).toBe(10);
    // At 45° across the middle, it covers both halves.
    const avg = bedSunHours({ x: 10, z: 10, w: 12, d: 1, rot: 45 }, grid).avg;
    expect(avg).toBeGreaterThan(2);
    expect(avg).toBeLessThan(8);
  });
});

describe("turned neighbors", () => {
  it("measures the true gap between turned beds", () => {
    const a = { x: 0, z: 0, w: 2, d: 2, rot: 45 }; // a diamond reaching 1.414 ft to each side
    expect(gapBetween(a, { x: 4, z: 0, w: 2, d: 2 })).toBeCloseTo(4 - 1 - Math.SQRT2, 6);
    expect(gapBetween(a, { x: 2, z: 0, w: 2, d: 2 })).toBe(0); // overlapping
    // Two thin pieces crossing like an X overlap even though no corner is inside the other.
    expect(gapBetween({ x: 0, z: 0, w: 10, d: 0.5, rot: 45 }, { x: 0, z: 0, w: 10, d: 0.5, rot: 135 })).toBe(0);
  });

  it("finds conflicts with a turned bed that's close, not one that's turned away", () => {
    // Tomatoes and sweet corn don't get along. The tomato bed runs from x = 9 to 11.
    const left = makeBed({ id: "left", x: 10, z: 10, w: 2, d: 10, crops: ["tomato"] });
    // A 2 × 10 bed centered 7 ft away, turned a quarter turn to lie flat: its near end is 1 ft away.
    const near = makeBed({ id: "near", x: 17, z: 10, w: 2, d: 10, rot: 90, crops: ["sweet-corn"] });
    // The same bed barely turned (1°) stays upright and about 5 ft away.
    const far = makeBed({ id: "far", x: 17, z: 10, w: 2, d: 10, rot: 1, crops: ["sweet-corn"] });
    expect(companionReport([left, near], CATALOG_BY_ID, CATALOG).left.nearby).toHaveLength(1);
    expect(companionReport([left, far], CATALOG_BY_ID, CATALOG).left.nearby).toHaveLength(0);
  });
});
