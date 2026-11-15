import { describe, expect, it } from "vitest";
import { healthFor, toWatch } from "@/frontend/planner/health";
import { GardenSchema } from "@/frontend/planner/model";
import { makeGarden, makeObstacle } from "./fixtures";

describe("Health box", () => {
  it("has a checklist and 3–5 tips for each animal, and none for other items", () => {
    for (const kind of ["coop", "hive", "fishfarm"] as const) {
      const box = healthFor(kind)!;
      expect(box.checks.length).toBeGreaterThanOrEqual(3);
      expect(box.tips.length).toBeGreaterThanOrEqual(3);
      expect(box.tips.length).toBeLessThanOrEqual(5);
      expect(new Set(box.checks.map((c) => c.id)).size).toBe(box.checks.length);
      // Each id fits what the saved plan accepts.
      for (const c of box.checks) expect(c.id).toMatch(/^[a-z]{1,20}$/);
    }
    for (const kind of ["tank", "filter", "shed"] as const) expect(healthFor(kind)).toBeNull();
  });

  it("lists the checks not ticked yet", () => {
    expect(toWatch("coop", ["birds", "water"]).map((c) => c.id)).toEqual(["mites", "feet", "secure"]);
    expect(toWatch("tank", [])).toEqual([]);
  });

  it("saves ticks with the item", () => {
    const plan = makeGarden({ obstacles: [makeObstacle({ kind: "hive", health: ["eggs", "mites"] })] });
    expect(GardenSchema.parse(JSON.parse(JSON.stringify(plan))).obstacles[0].health).toEqual(["eggs", "mites"]);
  });
});
