import { describe, expect, it } from "vitest";
import { MAX_SQUARE_ACRES, fitToYard, squareYardForAcres, yardAcres } from "@/frontend/planner/model";

describe("yard size in acres", () => {
  it("turns acres into a square yard in whole feet", () => {
    expect(squareYardForAcres(1)).toEqual({ w: 209, d: 209 });
    expect(squareYardForAcres(0.25)).toEqual({ w: 104, d: 104 });
    expect(squareYardForAcres(0.5)).toEqual({ w: 148, d: 148 });
  });

  it("stays within the planner's 10 to 400 ft limits", () => {
    expect(squareYardForAcres(0)).toEqual({ w: 10, d: 10 });
    expect(squareYardForAcres(50)).toEqual({ w: 400, d: 400 });
    expect(MAX_SQUARE_ACRES).toBeCloseTo(3.67, 2);
  });

  it("works out the acreage of any yard", () => {
    expect(yardAcres({ w: 209, d: 209 })).toBeCloseTo(1.003, 3);
    expect(yardAcres({ w: 60, d: 44 })).toBeCloseTo(0.0606, 3);
  });

  it("moves beds and shade sources back inside a smaller yard", () => {
    const garden = {
      yard: { w: 50, d: 50, north: 0 },
      beds: [{ id: "b", x: 180, z: 150, w: 4, d: 8 }],
      obstacles: [{ id: "t", x: 300, z: 10, w: 20, d: 20 }],
    };
    const fitted = fitToYard(garden);
    expect(fitted.beds[0]).toMatchObject({ x: 48, z: 46 });
    expect(fitted.obstacles[0]).toMatchObject({ x: 40, z: 10 });
  });
});
