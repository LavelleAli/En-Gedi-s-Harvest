import { describe, expect, it } from "vitest";
import { CATALOG, CATALOG_BY_ID } from "@/shared/catalog";
import { findCrop, matchCropIds, normalizeName } from "@/shared/crop";
import { plantingWindows, seasonFit, suggestionsFor } from "@/shared/planting";
import { frostDays, zoneShift } from "@/shared/zones";
import { PLANTS } from "@/frontend/data/plants";

describe("catalog", () => {
  it("has an entry for every encyclopedia plant", () => {
    const books = new Set(CATALOG.map((c) => c.book).filter(Boolean));
    for (const p of PLANTS) expect(books.has(p.n), p.n).toBe(true);
  });

  it("only names companions that resolve to catalog crops", () => {
    for (const crop of CATALOG) {
      for (const name of [...crop.friends, ...crop.foes]) {
        expect(matchCropIds(name, CATALOG).length, `${crop.id} -> ${name}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("names", () => {
  it("normalizes plurals and parentheses", () => {
    expect(normalizeName("Tomatoes")).toBe("tomato");
    expect(normalizeName("Bush Beans (Phaseolus)")).toBe("bush bean");
    expect(normalizeName("Strawberries")).toBe("strawberry");
  });

  it("matches aliases and plant families", () => {
    expect(findCrop("zucchini", CATALOG).id).toBe("summer-squash");
    expect(findCrop("Scallions", CATALOG).id).toBe("onion");
    expect(matchCropIds("cabbage family", CATALOG)).toEqual(expect.arrayContaining(["cabbage", "kale", "broccoli", "collards"]));
  });
});

describe("planting windows", () => {
  it("anchors zone 8a to the book's frost dates", () => {
    expect(zoneShift("8a")).toEqual({ spring: 0, fall: 0 });
    expect(frostDays("8a")).toEqual([87, 310]);
  });

  it("plants tomatoes after the last frost and garlic before the first", () => {
    const [tomato] = plantingWindows(CATALOG_BY_ID.tomato, "6a");
    expect(tomato.start).toBeGreaterThan(frostDays("6a")[0]);
    const [garlic] = plantingWindows(CATALOG_BY_ID.garlic, "6a");
    expect(garlic.season).toBe("fall");
    expect(garlic.end).toBeLessThan(frostDays("6a")[1]);
  });

  it("skips fall planting where the zone is too cold for it", () => {
    expect(plantingWindows(CATALOG_BY_ID["snap-pea"], "5a").map((w) => w.season)).toEqual(["spring"]);
    expect(plantingWindows(CATALOG_BY_ID["snap-pea"], "8a").map((w) => w.season)).toEqual(["spring", "fall"]);
  });

  it("flags long warm-season crops in short seasons", () => {
    expect(seasonFit(CATALOG_BY_ID.watermelon, "2a").ok).toBe(false);
    expect(seasonFit(CATALOG_BY_ID.watermelon, "7a").ok).toBe(true);
  });
});

describe("suggestions", () => {
  const ids = (zone, month) => suggestionsFor(zone, month, CATALOG).map((s) => s.crop.id);

  it("suggests cool crops in early spring and warm crops after frost in zone 8a", () => {
    expect(ids("8a", 1)).toEqual(expect.arrayContaining(["snap-pea", "spinach"]));
    expect(ids("8a", 1)).not.toContain("tomato");
    expect(ids("8a", 3)).toContain("tomato");
  });

  it("moves the same crops later in a cold zone", () => {
    expect(ids("4a", 3)).not.toContain("tomato");
    expect(ids("4a", 4)).toContain("tomato");
  });

  it("only suggests crops that grow in the zone", () => {
    expect(ids("3a", 4)).not.toContain("citrus");
    expect(ids("3a", 4)).toContain("haskap");
    expect(ids("10a", 1)).not.toContain("haskap");
  });
});
