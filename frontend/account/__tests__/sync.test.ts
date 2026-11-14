import { describe, expect, it } from "vitest";
import { resolve, type Resolution } from "@/frontend/account/sync";

// The value a push or pull carries (fails the test if there's none).
const valueOf = (step: Resolution): string => {
  if (step.action === "none") throw new Error("expected a push or pull");
  return step.value;
};

const server = (value: string, updatedAt = 100) => ({ value, updatedAt });

describe("resolve: one saved key, this device vs the server", () => {
  it("uploads this device's data when the server has none", () => {
    expect(resolve("fhb-stars", { value: '{"Okra":true}', syncedAt: 0 }, null)).toEqual({ action: "push", value: '{"Okra":true}' });
  });

  it("does nothing when both are empty or already match", () => {
    expect(resolve("fhb-stars", { value: null, syncedAt: 0 }, null)).toEqual({ action: "none" });
    expect(resolve("fhb-stars", { value: "{}", syncedAt: 5 }, server("{}"))).toEqual({ action: "none" });
  });

  it("keeps ticks from both sides on a device's first sync", () => {
    const step = resolve("fhb-stars", { value: '{"Okra":true}', syncedAt: 0 }, server('{"Fig":true}'));
    expect(step.action).toBe("push");
    expect(JSON.parse(valueOf(step))).toEqual({ Fig: true, Okra: true });
  });

  it("keeps the account's garden plan over an unsynced one", () => {
    expect(resolve("fhb-garden", { value: '{"beds":[]}', syncedAt: 0 }, server('{"beds":[1]}'))).toEqual({ action: "pull", value: '{"beds":[1]}' });
  });

  it("takes a change made on another device since the last sync", () => {
    expect(resolve("fhb-todo", { value: '{"a":true}', syncedAt: 50 }, server('{"b":true}', 100))).toEqual({ action: "pull", value: '{"b":true}' });
  });

  it("sends this device's change when it's the newest", () => {
    expect(resolve("fhb-todo", { value: '{"a":true}', syncedAt: 200 }, server('{"b":true}', 100))).toEqual({ action: "push", value: '{"a":true}' });
  });

  it("copes with damaged local data when merging", () => {
    const step = resolve("fhb-gear", { value: "not json", syncedAt: 0 }, server('{"bee-0":true}'));
    expect(JSON.parse(valueOf(step))).toEqual({ "bee-0": true });
  });
});
