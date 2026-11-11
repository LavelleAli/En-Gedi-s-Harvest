import { describe, expect, it } from "vitest";
import { CATALOG, CATALOG_BY_ID } from "@/shared/catalog";
import { daySamples, localToUtc, sunPosition, sunTimes, sunVector } from "@/frontend/planner/sun";
import { bedSunHours, isShaded, shadeShapes, sunHoursGrid } from "@/frontend/planner/shade";
import { companionReport, plantCount, plantingNotes, sunFit, wateringPlan } from "@/frontend/planner/analysis";
import { STARTER_GARDEN } from "@/frontend/planner/model";

const ATL = { lat: 33.79, lon: -84.39, tz: "America/New_York" };

describe("sun", () => {
  it("puts the sun high and south at solar noon on the June solstice in Atlanta", () => {
    const t = sunTimes("2026-06-21", ATL.lat, ATL.lon, ATL.tz);
    const p = sunPosition(t.solarNoon, ATL.lat, ATL.lon);
    expect(p.altitude).toBeGreaterThan(78);
    expect(p.altitude).toBeLessThan(81);
    expect(Math.abs(p.azimuth - 180)).toBeLessThan(2);
    expect(t.dayHours).toBeGreaterThan(14);
    expect(t.dayHours).toBeLessThan(14.5);
  });

  it("gives short winter days and a low sun", () => {
    const t = sunTimes("2026-12-21", ATL.lat, ATL.lon, ATL.tz);
    expect(t.dayHours).toBeLessThan(10);
    expect(sunPosition(t.solarNoon, ATL.lat, ATL.lon).altitude).toBeLessThan(34);
  });

  it("converts local clock time to UTC across daylight saving", () => {
    expect(new Date(localToUtc("2026-07-01", 12 * 60, ATL.tz)).toISOString()).toBe("2026-07-01T16:00:00.000Z");
    expect(new Date(localToUtc("2026-01-15", 12 * 60, ATL.tz)).toISOString()).toBe("2026-01-15T17:00:00.000Z");
  });

  it("points south in plan coordinates when the plan's top faces north", () => {
    const v = sunVector(45, 180, 0);
    expect(v.z).toBeGreaterThan(0.7);
    expect(Math.abs(v.x)).toBeLessThan(1e-9);
  });
});

describe("shade", () => {
  it("shades the north side of a wall when the sun is in the south", () => {
    const shapes = shadeShapes([{ kind: "fence", x: 10, z: 10, w: 20, d: 0.5, h: 6 }]);
    const dir = sunVector(30, 180, 0);
    expect(isShaded(10, 0.3, 8, dir, shapes)).toBe(true); // north of the fence (smaller z)
    expect(isShaded(10, 0.3, 12, dir, shapes)).toBe(false); // south of it
  });

  it("gives an open yard all the day's sun and a shaded spot less", () => {
    const samples = daySamples("2026-06-21", ATL.lat, ATL.lon, ATL.tz, 20);
    const open = sunHoursGrid({ ...STARTER_GARDEN, obstacles: [] }, samples, 20);
    expect(open.hours[0]).toBeCloseTo(open.maxHours, 3);
    const grid = sunHoursGrid(STARTER_GARDEN, samples, 20);
    const underTree = bedSunHours({ x: 52, z: 34, w: 2, d: 2 }, grid).avg;
    expect(underTree).toBeLessThan(open.maxHours - 3);
  });
});

describe("bed analysis", () => {
  const byId = CATALOG_BY_ID;

  it("counts plants from spacing and shares the bed between crops", () => {
    const bed = { w: 4, d: 8, crops: [] };
    expect(plantCount(bed, byId.lettuce, 1)).toBe(56);
    expect(plantCount(bed, byId.tomato, 2)).toBe(2);
  });

  it("rates sun fit", () => {
    expect(sunFit(8, byId.tomato).level).toBe("good");
    expect(sunFit(4, byId.lettuce).level).toBe("good");
    expect(sunFit(4, byId.kale).level).toBe("ok");
    expect(sunFit(3, byId.tomato).level).toBe("poor");
  });

  it("finds good and bad companions, including in neighboring beds", () => {
    const beds = [
      { id: "a", x: 5, z: 5, w: 4, d: 8, crops: ["tomato", "basil", "potato"] },
      { id: "b", x: 10, z: 5, w: 4, d: 8, crops: ["sweet-corn"] },
      { id: "c", x: 40, z: 5, w: 4, d: 8, crops: ["cabbage"] },
    ];
    const r = companionReport(beds, byId, CATALOG);
    expect(r.a.good.map(([x, y]) => [x.id, y.id])).toContainEqual(["tomato", "basil"]);
    expect(r.a.bad.map(([x, y]) => [x.id, y.id])).toContainEqual(["tomato", "potato"]);
    expect(r.a.nearby.map((n) => n.b.id)).toContain("sweet-corn");
    expect(r.a.nearby.map((n) => n.b.id)).not.toContain("cabbage");
  });

  it("warns when a raised bed is too shallow for the roots", () => {
    const notes = plantingNotes(byId.tomato, { type: "raised", h: 0.75 }, "7a");
    expect(notes.some((n) => n.includes("loosen the ground"))).toBe(true);
  });

  it("waters raised beds more often and rests in winter", () => {
    const crops = [byId.tomato];
    const raised = wateringPlan({ type: "raised", w: 4, d: 8 }, crops, 6, "7a");
    const ground = wateringPlan({ type: "in-ground", w: 4, d: 8 }, crops, 6, "7a");
    expect(raised.sessions).toBeGreaterThan(ground.sessions);
    expect(wateringPlan({ type: "raised", w: 4, d: 8 }, crops, 0, "5a").dormant).toBe(true);
  });
});
