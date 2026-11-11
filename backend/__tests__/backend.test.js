import { describe, expect, it, vi } from "vitest";
import { HttpError, rateLimit } from "@/backend/http";
import { createPlantService } from "@/backend/plants/service";
import { createBilling } from "@/backend/billing/service";
import { ResearchOutput, toCrop } from "@/backend/plants/research";

function fakeAccounts({ plan = "free", used = 0 } = {}) {
  const state = { plan, usage: { month: "2026-11", count: used }, stripeCustomerId: null, subscriptionId: null, events: new Set(), billing: {} };
  return {
    state,
    get: async () => ({ ...state }),
    reserveLookup: vi.fn(async (uid, month, limit) => {
      const count = state.usage.month === month ? state.usage.count : 0;
      if (state.plan !== "garden" && count >= limit) throw new HttpError(402, "quota-exceeded", "quota");
      state.usage = { month, count: count + 1 };
      return { plan: state.plan, used: count + 1, limit: state.plan === "garden" ? null : limit, month };
    }),
    refundLookup: vi.fn(async () => {
      state.usage.count -= 1;
    }),
    setBilling: vi.fn(async (uid, fields) => Object.assign(state, fields)),
    findUidByCustomer: async () => "user-1",
    firstTimeEvent: async (id) => (state.events.has(id) ? false : (state.events.add(id), true)),
  };
}

const output = (over = {}) => ResearchOutput.parse({
  found: true, name: "Tomatillo", botanical: "Physalis philadelphica", family: "Solanaceae", kind: "veg", life: "annual", habit: "bush",
  zone_min: 4, zone_max: 11, season: "warm", sun_hours: 8, shade_ok: false, water_inches_per_week: 1.5, spacing_inches: 36,
  height_feet: 4, root_depth_inches: 18, days_to_harvest_min: 75, days_to_harvest_max: 100, first_harvest: "", method: "transplant",
  planting_depth_inches: 0, plant_in_spring: true, spring_start_weeks: 2, spring_end_weeks: 6, plant_in_fall: false,
  fall_start_weeks: 0, fall_end_weeks: 0, how_to_plant: "Transplant after frost. Plant two for pollination.", bed: "either", bed_note: "",
  companions: ["Tomato", "Basil"], avoid: [], summary: "A husked green fruit for salsa verde.", zone_note: "Plant in late May in zone 6.",
  sources: [{ title: "Extension", url: "https://extension.example.edu/tomatillo" }, { title: "Made up", url: "https://invented.example.com/x" }],
  ...over,
});
const searchResults = [{ title: "Extension", url: "https://extension.example.edu/tomatillo" }, { title: "Seeds", url: "https://seeds.example.com/t" }];

function service({ accounts = fakeAccounts(), library = { findByName: async () => null, save: vi.fn(async () => {}), search: async () => [] }, research } = {}) {
  research ??= vi.fn(async () => ({ found: true, crop: toCrop(output(), "6a", searchResults), model: "claude-opus-5-5", usage: {} }));
  const svc = createPlantService({ library, accounts, research, freeLimit: 5, now: () => new Date("2026-11-11T12:00:00Z") });
  return { svc, accounts, library, research };
}

describe("plant lookups", () => {
  it("answers stock plants for free without calling Claude", async () => {
    const { svc, research, accounts } = service();
    const r = await svc.lookup("u", { name: "Zucchini", zone: "6a" });
    expect(r).toMatchObject({ source: "stock", charged: false });
    expect(r.crop.id).toBe("summer-squash");
    expect(research).not.toHaveBeenCalled();
    expect(accounts.reserveLookup).not.toHaveBeenCalled();
  });

  it("answers from the shared library for free", async () => {
    const saved = toCrop(output(), "6a", searchResults);
    const { svc, research } = service({ library: { findByName: async () => saved, save: vi.fn(), search: async () => [] } });
    expect(await svc.lookup("u", { name: "tomatillos", zone: "6a" })).toMatchObject({ source: "library", charged: false });
    expect(research).not.toHaveBeenCalled();
  });

  it("researches new plants, counts the lookup and saves to the library", async () => {
    const { svc, accounts, library } = service();
    const r = await svc.lookup("u", { name: "Tomatillo", zone: "6a" });
    expect(r).toMatchObject({ source: "research", charged: true, usage: { used: 1, limit: 5 } });
    expect(library.save).toHaveBeenCalledWith(expect.objectContaining({ id: "tomatillo" }), "6a", ["Tomatillo"]);
    expect(accounts.state.usage.count).toBe(1);
  });

  it("stops free accounts at the monthly limit but not paid ones", async () => {
    await expect(service({ accounts: fakeAccounts({ used: 5 }) }).svc.lookup("u", { name: "Tomatillo", zone: "6a" })).rejects.toMatchObject({ status: 402 });
    await expect(service({ accounts: fakeAccounts({ plan: "garden", used: 500 }) }).svc.lookup("u", { name: "Tomatillo", zone: "6a" })).resolves.toMatchObject({ source: "research" });
  });

  it("gives the lookup back when research fails or finds nothing", async () => {
    const failing = service({ research: vi.fn(async () => { throw new HttpError(502, "research-failed", "x"); }) });
    await expect(failing.svc.lookup("u", { name: "Tomatillo", zone: "6a" })).rejects.toMatchObject({ status: 502 });
    expect(failing.accounts.state.usage.count).toBe(0);
    const notPlant = service({ research: vi.fn(async () => ({ found: false })) });
    await expect(notPlant.svc.lookup("u", { name: "Toaster", zone: "6a" })).rejects.toMatchObject({ status: 404 });
    expect(notPlant.accounts.state.usage.count).toBe(0);
  });

  it("rejects bad input before doing any work", async () => {
    const { svc, research } = service();
    await expect(svc.lookup("u", { name: "x", zone: "6a" })).rejects.toMatchObject({ status: 400 });
    await expect(svc.lookup("u", { name: "Okra", zone: "15c" })).rejects.toMatchObject({ status: 400 });
    await expect(svc.lookup("u", { name: "<script>", zone: "6a" })).rejects.toMatchObject({ status: 400 });
    await expect(svc.lookup("u", { name: "Okra", zone: "6a", plan: "garden" })).rejects.toMatchObject({ status: 400 });
    expect(research).not.toHaveBeenCalled();
  });
});

describe("research results", () => {
  it("keeps only sources that came back from the web search", () => {
    const crop = toCrop(output(), "6a", searchResults);
    expect(crop.sources.map((s) => s.url)).toEqual(["https://extension.example.edu/tomatillo"]);
  });

  it("clamps out-of-range numbers into a valid crop", () => {
    const crop = toCrop(output({ spacing_inches: 9999, zone_min: 12, zone_max: 3, days_to_harvest_min: 0, days_to_harvest_max: 0, first_harvest: "Year 2" }), "6a", searchResults);
    expect(crop.spacingIn).toBe(480);
    expect(crop.zones).toEqual([3, 12]);
    expect(crop.days).toBeNull();
  });
});

describe("billing webhooks", () => {
  const billing = (accounts) => createBilling({ stripe: {}, accounts, priceId: "price_1", appUrl: "https://example.com" });
  const event = (id, type, object) => ({ id, type, data: { object } });

  it("upgrades on checkout and downgrades when the subscription ends", async () => {
    const accounts = fakeAccounts();
    const b = billing(accounts);
    await b.handleEvent(event("evt_1", "checkout.session.completed", { mode: "subscription", client_reference_id: "user-1", customer: "cus_1", subscription: "sub_1" }));
    expect(accounts.state.plan).toBe("garden");
    await b.handleEvent(event("evt_2", "customer.subscription.deleted", { id: "sub_1", customer: "cus_1", status: "canceled", metadata: { uid: "user-1" } }));
    expect(accounts.state.plan).toBe("free");
  });

  it("skips events it has already handled", async () => {
    const accounts = fakeAccounts();
    const b = billing(accounts);
    const e = event("evt_3", "customer.subscription.updated", { id: "sub_1", customer: "cus_1", status: "active", metadata: { uid: "user-1" } });
    expect(await b.handleEvent(e)).toBe("active");
    expect(await b.handleEvent(e)).toBe("duplicate");
  });
});

describe("rate limiting", () => {
  it("allows up to the limit in a window, then refuses", () => {
    for (let i = 0; i < 3; i++) rateLimit("t", 3, 1000, 5000);
    expect(() => rateLimit("t", 3, 1000, 5001)).toThrow(HttpError);
    expect(() => rateLimit("t", 3, 1000, 6001)).not.toThrow();
  });
});
