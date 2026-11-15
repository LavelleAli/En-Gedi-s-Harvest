import { describe, expect, it } from "vitest";
import { GardenSchema } from "@/frontend/planner/model";
import { fmt, gallonsHeld, setupFor } from "@/frontend/planner/setup";
import { makeGarden, makeObstacle } from "./fixtures";

const value = (box: ReturnType<typeof setupFor>, label: string) => box?.lines.find((l) => l.label === label);

describe("Setup box", () => {
  it("has a box only for the coop, fish farm, beehive and water tank", () => {
    const garden = makeGarden();
    expect(setupFor(makeObstacle({ kind: "shed" }), garden)).toBeNull();
    expect(setupFor(makeObstacle({ kind: "filter" }), garden)).toBeNull();
    for (const kind of ["coop", "fishfarm", "hive", "tank"] as const) expect(setupFor(makeObstacle({ kind }), garden)).not.toBeNull();
  });

  it("sizes a coop from the number of birds and flags a coop that's too small", () => {
    const coop = makeObstacle({ kind: "coop", w: 6, d: 8, setup: { birds: 6 } });
    const box = setupFor(coop, makeGarden());
    expect(value(box, "Coop floor")).toMatchObject({ value: "24 sq ft needed; this coop has 48", warn: false });
    expect(value(box, "Run")?.value).toBe("60 sq ft, roofed");
    expect(value(box, "Nest boxes")?.value).toBe("2");
    expect(value(box, "Feed")?.value).toBe("1.5 lb a day (11 lb a week)");
    expect(value(box, "Water")?.value).toBe("1.5–3 qt a day, more in heat");
    expect(value(setupFor({ ...coop, setup: { birds: 20 } }, makeGarden()), "Coop floor")?.warn).toBe(true);
  });

  it("stocks a fish farm at 1 lb per 10 gallons", () => {
    const farm = makeObstacle({ kind: "fishfarm", w: 8, d: 4, h: 3, setup: { gallons: 500 } });
    expect(Math.round(gallonsHeld(farm))).toBe(718);
    expect(value(setupFor(farm, makeGarden()), "Start with")?.value).toBe("about 50 lb of fish");
    expect(value(setupFor({ ...farm, setup: { gallons: 900 } }, makeGarden()), "Tank holds")?.warn).toBe(true);
  });

  it("lays hives out in a line 3 ft apart", () => {
    const hive = makeObstacle({ kind: "hive", w: 1.7, d: 1.4, h: 3, setup: { hives: 3 } });
    expect(value(setupFor(hive, makeGarden()), "In a line")?.value).toBe("about 11 ft long, 3 ft apart");
  });

  it("fills a tank from the house roof by default", () => {
    const tank = makeObstacle({ kind: "tank", w: 4, d: 4, h: 6 });
    const garden = makeGarden({ obstacles: [makeObstacle({ kind: "house", w: 30, d: 20 })] });
    const box = setupFor(tank, garden);
    expect(box?.fields.map((f) => f.value)).toEqual([600, 1]);
    expect(value(box, "This rain")?.value).toBe("about 299 gal"); // 600 × 0.623 × 0.8
    expect(value(box, "Fills")?.value).toBe("about 53% of the tank"); // of about 564 gal
    expect(value(setupFor({ ...tank, setup: { rain: 3 } }, garden), "Fills")?.warn).toBe(true);
  });

  it("formats numbers for reading", () => {
    expect(fmt(2.25)).toBe("2.3");
    expect(fmt(1234.4)).toBe("1,234");
  });

  it("saves the setup with the item and still loads items without one", () => {
    const plan = makeGarden({ obstacles: [makeObstacle({ kind: "coop", setup: { birds: 5 } }), makeObstacle({ id: "old", kind: "hive" })] });
    expect(GardenSchema.parse(JSON.parse(JSON.stringify(plan))).obstacles[0].setup).toEqual({ birds: 5 });
    expect(GardenSchema.safeParse(makeGarden({ obstacles: [makeObstacle({ kind: "coop", setup: { birds: 0 } })] })).success).toBe(false);
  });
});
