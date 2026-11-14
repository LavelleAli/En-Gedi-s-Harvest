// Test helpers: a bed or a shade source with sensible defaults, so each test only spells out the
// fields it's about. Not a test file itself (no .test in the name).
import type { Bed, Garden, Obstacle } from "@/frontend/planner/model";

export const makeBed = (fields: Partial<Bed> = {}): Bed => ({
  id: "bed", kind: "bed", name: "Bed", type: "raised", x: 10, z: 10, w: 4, d: 8, h: 1, crops: [], ...fields,
});

export const makeObstacle = (fields: Partial<Obstacle> = {}): Obstacle => ({
  id: "thing", kind: "tree", name: "Tree", x: 10, z: 10, w: 16, d: 16, h: 25, ...fields,
});

export const makeGarden = (fields: Partial<Garden> = {}): Garden => ({
  v: 1, yard: { w: 60, d: 44, north: 0 }, beds: [], obstacles: [], ...fields,
});
