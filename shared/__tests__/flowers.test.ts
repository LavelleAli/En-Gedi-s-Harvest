// The En Gedi rose garden list: every flower parses, has a unique id and encyclopedia slot,
// stays out of the month-by-month food suggestions, and every photo it points at exists.
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "@/shared/catalog";
import { FLOWERS, heightFeet } from "@/shared/flowers";
import { isGardenFlower } from "@/shared/crop";
import { suggestionsFor } from "@/shared/planting";
import { slug } from "@/shared/slug";
import photos from "@/frontend/data/photos.json";

describe("garden flowers", () => {
  it("are all in the catalog with unique ids and encyclopedia slots", () => {
    expect(FLOWERS.length).toBeGreaterThan(100);
    expect(new Set(CATALOG.map((c) => c.id)).size).toBe(CATALOG.length);
    expect(new Set(CATALOG.map((c) => slug(c.book || c.name))).size).toBe(CATALOG.length);
    for (const f of FLOWERS) {
      expect(f.kind).toBe("flower");
      expect(isGardenFlower(f)).toBe(true);
      expect(/^[A-Z]/i.test(f.name), f.name).toBe(true);
    }
  });

  it("are left out of the month-by-month planting suggestions", () => {
    for (let month = 0; month < 12; month++) {
      expect(suggestionsFor("8a", month, CATALOG).some((s) => isGardenFlower(s.crop))).toBe(false);
    }
  });

  it("reads heights written in feet, inches and centimeters", () => {
    expect(heightFeet("8–10 ft")).toBe(10);
    expect(heightFeet("28–32 in")).toBe(2.7);
    expect(heightFeet("up to 85 cm")).toBe(2.8);
    expect(heightFeet("Tall")).toBeNull();
  });

  it("has a file on disk for every photo listed", () => {
    for (const [slot, p] of Object.entries(photos as Record<string, { file: string }>)) {
      expect(existsSync(path.join(process.cwd(), "public", p.file)), slot).toBe(true);
    }
  });
});
