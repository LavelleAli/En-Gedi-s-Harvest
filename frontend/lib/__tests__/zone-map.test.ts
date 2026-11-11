import { describe, expect, it } from "vitest";
import { middleZone, stateSummary, zoneColor, zonesBetween } from "@/frontend/lib/zone-map";
import { STATE_ZONES } from "@/frontend/data/state-zones";
import { STATE_SHAPES } from "@/frontend/data/us-states";
import { isZone, zoneNumber } from "@/shared/zones";

describe("zone map data", () => {
  it("has a zone range for every state on the map, and nothing extra", () => {
    expect(Object.keys(STATE_ZONES).sort()).toEqual(STATE_SHAPES.map((s) => s.name).sort());
  });

  it("uses real zones, coldest first", () => {
    for (const [name, { range }] of Object.entries(STATE_ZONES)) {
      expect(range.every(isZone), name).toBe(true);
      expect(zoneNumber(range[0]) <= zoneNumber(range[1]), name).toBe(true);
    }
  });

  it("puts every state's center on the globe where the U.S. is", () => {
    for (const s of STATE_SHAPES) {
      expect(s.lat, s.name).toBeGreaterThan(18);
      expect(s.lon, s.name).toBeLessThan(-66);
    }
  });
});

describe("state summaries", () => {
  it("lists the half-zones between two zones", () => {
    expect(zonesBetween("7a", "9a")).toEqual(["7a", "7b", "8a", "8b", "9a"]);
    expect(middleZone("7a", "9a")).toBe("8a");
    expect(zonesBetween("9a", "7a")).toEqual([]);
  });

  it("describes Georgia with frost dates running warm to cold", () => {
    const ga = stateSummary("Georgia")!;
    expect(ga).toMatchObject({ abbr: "GA", range: "7a to 9a" });
    expect(ga.zones).toContain("8a");
    expect(ga.lastFrost).toMatch(/^Mar \d+ to Apr \d+$/);
  });

  it("explains frost-free areas instead of inventing dates", () => {
    expect(stateSummary("Florida")?.lastFrost).toMatch(/rare in the warmest areas/);
    expect(stateSummary("Nowhere")).toBeNull();
  });

  it("colors cold zones and warm zones differently", () => {
    expect(zoneColor("3a")).not.toBe(zoneColor("9a"));
    expect(zoneColor("8a")).toBe(zoneColor("8b"));
  });
});
