import { describe, expect, it } from "vitest";
import { MAX_OBSTACLES, duplicateNextTo, lineEdge, nextName, rowOf } from "@/frontend/planner/model";

const yard = { w: 100, d: 60, north: 0 };
const fence = { id: "fence-a", kind: "fence", name: "Fence", x: 10, z: 30, w: 20, d: 0.5, h: 6 };
const tree = { id: "tree-a", kind: "tree", name: "Oak", x: 8, z: 8, w: 16, d: 16, h: 25 };

describe("naming copies", () => {
  it("numbers copies after the original", () => {
    expect(nextName("Oak", [tree])).toBe("Oak 2");
    expect(nextName("Oak 2", [tree, { name: "Oak 2" }, { name: "Oak 3" }])).toBe("Oak 4");
  });
});

describe("duplicating", () => {
  it("continues a fence end to end", () => {
    const copy = duplicateNextTo(fence, yard, [fence]);
    expect(copy).toMatchObject({ kind: "fence", x: 30, z: 30, w: 20, name: "Fence 2" });
    expect(copy.id).not.toBe(fence.id);
  });

  it("goes the other way when there's no room", () => {
    const atEdge = { ...fence, x: 90 };
    expect(duplicateNextTo(atEdge, yard, [atEdge]).x).toBe(70);
  });
});

describe("rows", () => {
  it("makes a treeline with gaps and stops at the yard's edge", () => {
    const { added, skipped } = rowOf(tree, { count: 10, direction: "across", gap: 4 }, yard, [tree]);
    expect(added.map((t) => t.x)).toEqual([28, 48, 68, 88]); // 16 ft canopies, 4 ft apart
    expect(skipped).toBe(6);
  });

  it("never goes past the shade-source limit", () => {
    const many = Array.from({ length: MAX_OBSTACLES - 2 }, (_, i) => ({ ...tree, id: `t-${i}` }));
    const { added } = rowOf({ ...fence, x: 10, z: 1 }, { count: 4, direction: "across" }, yard, many);
    expect(added).toHaveLength(2);
  });
});

describe("lining an edge", () => {
  it("fences a whole edge with as few pieces as possible", () => {
    const { added } = lineEdge(fence, "top", yard, [fence]);
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ w: 100, d: 0.5, x: 50, z: 0.5 }); // positions snap to the 0.5 ft grid
  });

  it("turns a fence to run down the left or right edge", () => {
    const { added } = lineEdge(fence, "right", yard, [fence]);
    expect(added[0]).toMatchObject({ w: 0.5, d: 60, x: 99.75, z: 30 });
  });

  it("splits edges longer than 200 ft into pieces", () => {
    const big = { w: 400, d: 400, north: 0 };
    const { added } = lineEdge(fence, "bottom", big, [fence]);
    expect(added.map((f) => f.w)).toEqual([200, 200]);
  });

  it("plants a centered treeline along an edge", () => {
    const { added } = lineEdge(tree, "bottom", yard, [tree], 4);
    expect(added).toHaveLength(5); // 5 × 16 ft + 4 × 4 ft = 96 ft of the 100 ft edge
    expect(added[0]).toMatchObject({ x: 10, z: 52 });
    expect(added[4].x).toBe(90);
  });
});
