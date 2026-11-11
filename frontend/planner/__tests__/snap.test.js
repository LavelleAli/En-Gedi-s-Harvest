import { describe, expect, it } from "vitest";
import { snapToGrid } from "@/frontend/planner/model";

const yard = { w: 60, d: 44, north: 0 };
const bed = (x, z, w = 4, d = 8) => ({ id: "b", kind: "bed", x, z, w, d });

describe("snapToGrid", () => {
  it("puts the top-left corner on a grid line, not the middle", () => {
    // A 4 × 8 bed centered at 13.3, 20.6 has its corner at 11.3, 16.6 → 11, 17 on a 1 ft grid.
    expect(snapToGrid(bed(13.3, 20.6), yard, 1)).toMatchObject({ x: 13, z: 21 });
    // On a 5 ft grid the corner goes to 10, 15.
    expect(snapToGrid(bed(13.3, 20.6), yard, 5)).toMatchObject({ x: 12, z: 19 });
  });

  it("lines up both edges of odd-sized items on the corner", () => {
    const r = snapToGrid(bed(10.4, 10, 3.5, 2), yard, 0.5);
    expect(r.x - 3.5 / 2).toBe(8.5);
  });

  it("keeps items inside the yard", () => {
    expect(snapToGrid(bed(-20, 100), yard, 5)).toMatchObject({ x: 2, z: 40 });
    expect(snapToGrid(bed(58.9, 1), yard, 5)).toMatchObject({ x: 57, z: 4 }); // corner 56.9 → 55
  });

  it("falls back to the old half-foot rounding with snapping off", () => {
    expect(snapToGrid(bed(13.3, 20.6), yard, 0)).toMatchObject({ x: 13.5, z: 20.5 });
  });

  it("leaves no floating-point dust", () => {
    const r = snapToGrid(bed(7.1, 7.1, 0.3, 0.3), yard, 0.5);
    expect(String(r.x).length).toBeLessThan(8);
  });
});
