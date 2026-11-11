import { describe, expect, it } from "vitest";
import { HttpError } from "@/backend/http";
import { createSavedService } from "@/backend/saved/service";

// An in-memory stand-in for backend/saved/store.js with the same "newer wins" behavior.
function fakeStore(initial = {}) {
  const items = { ...initial };
  return {
    items,
    all: async () => ({ ...items }),
    putIfNewer: async (uid, key, value, updatedAt) => {
      const current = items[key];
      if (current && current.updatedAt >= updatedAt) return { saved: false, item: current };
      items[key] = { value, updatedAt };
      return { saved: true, item: items[key] };
    },
  };
}

const NOW = 1_800_000_000_000;
const service = (store = fakeStore()) => ({ store, svc: createSavedService({ store, now: () => NOW }) });

describe("synced saved data", () => {
  it("saves a known key and lists it back", async () => {
    const { svc } = service();
    expect(await svc.save("u", { key: "fhb-stars", value: '{"Okra":true}', updatedAt: NOW })).toMatchObject({ saved: true });
    expect(await svc.list("u")).toEqual({ "fhb-stars": { value: '{"Okra":true}', updatedAt: NOW } });
  });

  it("keeps the newer copy when an older save arrives late", async () => {
    const { svc } = service(fakeStore({ "fhb-todo": { value: "new", updatedAt: NOW } }));
    expect(await svc.save("u", { key: "fhb-todo", value: "old", updatedAt: NOW - 1000 })).toEqual({ saved: false, item: { value: "new", updatedAt: NOW } });
  });

  it("refuses keys that don't sync, like location", async () => {
    const { svc } = service();
    await expect(svc.save("u", { key: "fhb-location", value: "{}", updatedAt: NOW })).rejects.toMatchObject({ status: 400, code: "invalid-input" });
  });

  it("refuses oversized values and extra fields", async () => {
    const { svc } = service();
    await expect(svc.save("u", { key: "fhb-garden", value: "x".repeat(200_001), updatedAt: NOW })).rejects.toBeInstanceOf(HttpError);
    await expect(svc.save("u", { key: "fhb-garden", value: "{}", updatedAt: NOW, plan: "garden" })).rejects.toMatchObject({ code: "invalid-input" });
  });

  it("refuses timestamps from a clock that's far ahead", async () => {
    const { svc } = service();
    await expect(svc.save("u", { key: "fhb-gear", value: "{}", updatedAt: NOW + 60 * 60 * 1000 })).rejects.toMatchObject({ code: "clock-ahead" });
  });

  it("leaves out keys that are no longer synced", async () => {
    const { svc } = service(fakeStore({ "fhb-old": { value: "x", updatedAt: 1 }, "fhb-gear": { value: "{}", updatedAt: 2 } }));
    expect(Object.keys(await svc.list("u"))).toEqual(["fhb-gear"]);
  });
});
