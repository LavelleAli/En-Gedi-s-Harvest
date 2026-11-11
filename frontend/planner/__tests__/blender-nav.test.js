import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { gizmoAxes, orbitOffset, toBlender, viewLabel, viewName } from "@/frontend/planner/blenderNav";

// The rotation a camera has when it sits at `pos` looking at the origin.
function lookFrom(pos) {
  const cam = new THREE.PerspectiveCamera();
  cam.position.set(...pos);
  cam.lookAt(0, 0, 0);
  return cam.quaternion.toArray();
}

describe("view names", () => {
  it("names the Blender views and falls back to User", () => {
    expect(viewName([0, 10, 0.001])).toBe("top");
    expect(viewName([0, 0, 5])).toBe("front");
    expect(viewName([-3, 0, 0])).toBe("left");
    expect(viewName([1, 1, 1])).toBe(null);
    expect(viewLabel([0, 50, 0], true)).toBe("Top Orthographic");
    expect(viewLabel([4, 3, 9], false)).toBe("User Perspective");
  });
});

describe("orbitOffset", () => {
  it("keeps the distance and stays above the ground", () => {
    const [x, y, z] = orbitOffset([0, 10, 10], Math.PI / 2, 2);
    expect(Math.hypot(x, y, z)).toBeCloseTo(Math.hypot(10, 10), 6);
    expect(y).toBeGreaterThan(0);
  });
  it("turns around the up axis", () => {
    const [x, , z] = orbitOffset([0, 5, 10], Math.PI / 2, 0);
    expect(x).toBeCloseTo(10, 6);
    expect(z).toBeCloseTo(0, 6);
  });
});

describe("Blender axes", () => {
  it("maps three.js (Y up) to Blender (Z up, Y toward the top of the plan)", () => {
    expect(toBlender([3, 7, -5])).toEqual({ x: 3, y: 5, z: 7 });
  });

  it("puts Z up and Y toward the top of the screen in a top view", () => {
    const tips = Object.fromEntries(gizmoAxes(lookFrom([0, 50, 0.001])).map((t) => [t.key, t]));
    expect(tips.Z.depth).toBeGreaterThan(0.99); // pointing at the viewer
    expect(tips.Y.sy).toBeLessThan(-0.99); // up on the screen
    expect(tips.X.sx).toBeGreaterThan(0.99); // to the right
  });

  it("draws far tips first and links each tip to a view", () => {
    const tips = gizmoAxes(lookFrom([20, 15, 30]));
    expect(tips).toHaveLength(6);
    for (let i = 1; i < tips.length; i++) expect(tips[i].depth).toBeGreaterThanOrEqual(tips[i - 1].depth);
    const byKey = Object.fromEntries(tips.map((t) => [t.key, t.view]));
    expect(byKey).toEqual({ X: "right", "-X": "left", Y: "back", "-Y": "front", Z: "top", "-Z": null });
  });
});
