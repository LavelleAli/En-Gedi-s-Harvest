// The crop picker's filters: by type of plant, by name, and the counts on the filter buttons.
import { describe, expect, it } from "vitest";
import { CATALOG } from "@/shared/catalog";
import { categoryCounts, pickerGroups } from "@/frontend/planner/croppicker/cropFilter";

const all = (groups: ReturnType<typeof pickerGroups>) => groups.flatMap(([, list]) => list);

describe("crop picker filters", () => {
  it("shows every crop under All", () => {
    const shown = new Set(all(pickerGroups(CATALOG, "8a", 10, "all", "")).map((c) => c.id));
    expect(CATALOG.every((c) => shown.has(c.id))).toBe(true);
  });

  it("shows only one type of plant", () => {
    for (const kind of ["veg", "fruit", "herb", "flower"] as const) {
      const shown = all(pickerGroups(CATALOG, "8a", 10, kind, ""));
      expect(shown.length).toBeGreaterThan(0);
      expect(shown.every((c) => c.kind === kind)).toBe(true);
    }
  });

  it("narrows by name, ignoring case, and drops empty groups", () => {
    const groups = pickerGroups(CATALOG, "8a", 10, "veg", "LETT");
    expect(all(groups).map((c) => c.id)).toContain("lettuce");
    expect(groups.every(([, list]) => list.length > 0)).toBe(true);
    expect(pickerGroups(CATALOG, "8a", 10, "fruit", "lettuce")).toEqual([]);
  });

  it("counts each type for the filter buttons", () => {
    const counts = categoryCounts(CATALOG);
    expect(counts.all).toBe(CATALOG.length);
    expect(counts.veg + counts.fruit + counts.herb + counts.flower).toBe(CATALOG.length);
  });
});
