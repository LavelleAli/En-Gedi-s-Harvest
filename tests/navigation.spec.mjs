import { test, expect } from "@playwright/test";
import { ROUTES } from "../frontend/data/routes.js";

// Watches an element's opacity frame by frame until it settles at 1 (or 2s pass): returns the lowest
// opacity seen and how long the fade took. Start it, then trigger the fade.
function watchFade(page, selector) {
  return page.evaluate(
    (sel) =>
      new Promise((resolve) => {
        const start = performance.now();
        let min = 1;
        let sawFade = false;
        let fadeStart = null;
        const tick = () => {
          const el = document.querySelector(sel);
          const shown = el && (el.tagName !== "DIALOG" || el.open); // a closed dialog isn't on screen
          const o = shown ? parseFloat(getComputedStyle(el).opacity) : 1;
          if (shown && o < 0.99) {
            if (!sawFade) fadeStart = performance.now();
            sawFade = true;
          }
          min = Math.min(min, o);
          if ((sawFade && o >= 0.999) || performance.now() - start > 2000) {
            resolve({ min, ms: sawFade ? performance.now() - fadeStart : 0 });
          } else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    selector,
  );
}

test("every page opens from the Tools window, and both fade over about 500ms", async ({ page }) => {
  await page.goto("/");
  const tools = page.locator(".tools-dialog");
  for (const [i, route] of ROUTES.entries()) {
    const dialogFade = watchFade(page, ".tools-dialog");
    await page.getByRole("navigation", { name: "Main menu" }).getByRole("button", { name: "Tools" }).click();
    await expect(tools).toHaveClass(/is-shown/);
    if (i === 0) {
      const { min, ms } = await dialogFade;
      expect(min).toBeLessThan(0.5);
      expect(ms).toBeGreaterThan(350);
      expect(ms).toBeLessThan(900);
    }
    await expect(tools).toHaveCSS("opacity", "1");
    const pageFade = i === 1 ? watchFade(page, ".page-fade") : null; // ROUTES[0] is the page we start on
    await tools.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: route.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route.href}$`));
    await expect(tools).not.toBeVisible(); // closed once its fade-out finished
    if (pageFade) {
      const { min, ms } = await pageFade;
      expect(min).toBeLessThan(0.5);
      expect(ms).toBeGreaterThan(350);
      expect(ms).toBeLessThan(900);
    }
    await expect(page.locator(".page-fade")).toHaveCSS("opacity", "1");
  }
});

test("the sidebar opens Account, Profile and Shop", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "Main menu" });
  await menu.getByRole("link", { name: "Profile" }).click();
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
  await menu.getByRole("link", { name: "Shop" }).click();
  await expect(page.getByRole("heading", { name: "Shop", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Coming soon" })).toHaveCount(18);
  await menu.getByRole("link", { name: /Sign in|Account/ }).click();
  await expect(page).toHaveURL(/\/account\/$/);
});

test("the location map shows a state's zones on hover and saves the chosen zone", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Zone 8a/ }).click();
  const georgia = page.getByRole("button", { name: "Georgia, zones 7a to 9a" });
  await georgia.hover();
  const card = page.locator(".zone-card");
  await expect(card).toHaveClass(/is-visible/);
  await expect(card).toContainText("Georgia");
  await expect(card).toHaveCSS("transition-duration", /0\.5s/);
  await page.getByRole("button", { name: "Colorado, zones 3a to 7b" }).click();
  await expect(page.getByRole("heading", { name: "Colorado" })).toBeVisible();
  await page.getByLabel("Your USDA hardiness zone").selectOption("5b");
  await page.getByRole("button", { name: "Save location" }).click();
  await expect(page.getByRole("button", { name: /Zone 5b · Colorado/ })).toBeVisible();
});

test("a plant's problem link opens the matching plant doctor card", async ({ page }) => {
  await page.goto("/plants/");
  await page.locator('#plant-okra a[href*="#sym-"]').first().click();
  await expect(page).toHaveURL(/\/plant-doctor\/#sym-/);
  await expect(page.locator("#sym-rootrot")).toBeVisible();
});

test("the encyclopedia lists every plant A to Z under letter headings", async ({ page }) => {
  await page.goto("/plants/");
  const names = await page.locator(".entry .headword").allTextContents();
  expect(names.length).toBe(57);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
  await expect(page.getByRole("heading", { level: 3, name: "T", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Jump to a letter" }).getByRole("link", { name: "T", exact: true }).click();
  await expect(page).toHaveURL(/#letter-T$/);
});

test("search filters the encyclopedia", async ({ page }) => {
  await page.goto("/plants/");
  await page.getByRole("searchbox", { name: "Search plants" }).fill("vitamin a");
  await expect(page.getByText(/of 57 plants/)).not.toHaveText("57 of 57 plants");
});

test("gear checklist remembers ticks after a reload", async ({ page }) => {
  await page.goto("/bees/");
  const first = page.locator(".gear input").first();
  await first.check();
  await page.reload();
  await expect(page.locator(".gear input").first()).toBeChecked();
});

test("unknown pages show the 404 page", async ({ page }) => {
  await page.goto("/not-a-real-page/");
  await expect(page.getByRole("heading", { name: "That page isn't in the book" })).toBeVisible();
});

test("theme switch overrides the OS setting and is remembered after a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  const toggle = page.getByRole("switch", { name: "Dark mode" });
  // Nothing saved yet: follows the OS (light here).
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(17, 21, 18)");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
});

test("theme switch sits in the top-right corner", async ({ page }) => {
  await page.goto("/");
  const box = await page.getByRole("switch", { name: "Dark mode" }).boundingBox();
  const width = page.viewportSize().width;
  expect(box.y).toBeLessThan(40);
  expect(width - (box.x + box.width)).toBeLessThan(40);
});

test("month calendar shows that month's checklist and remembers ticks", async ({ page }) => {
  await page.goto("/");
  const calendar = page.getByRole("group", { name: "Pick a month" });
  await expect(calendar.getByRole("radio")).toHaveCount(12);
  const tile = (name) => page.locator(".mtile", { has: page.getByRole("radio", { name }) });
  await tile(/^March,/).click();
  await expect(page.getByRole("heading", { level: 2, name: "March" })).toBeVisible();
  await expect(page.getByText("0 of 10 done", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Broccoli and cabbage transplants" }).check();
  await expect(page.getByText("1 of 10 done", { exact: true })).toBeVisible();
  await page.reload();
  await tile(/^March,/).click();
  await expect(page.getByRole("checkbox", { name: "Broccoli and cabbage transplants" })).toBeChecked();
  await page.getByRole("button", { name: "Clear March" }).click();
  await expect(page.getByText("0 of 10 done", { exact: true })).toBeVisible();
});

test("changing the zone shifts the calendar and the suggestions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Plant now in zone 8a" })).toBeVisible();
  await page.getByRole("button", { name: /Zone 8a · Fulton County, GA/ }).click();
  // Skip the state map and pick a zone directly (the path for gardens outside the U.S.).
  await page.getByRole("button", { name: /Pick your zone directly/ }).click();
  const dialog = page.getByRole("dialog", { name: "Your garden's location" });
  await dialog.getByLabel("USDA hardiness zone").selectOption("4a");
  await dialog.getByLabel("Latitude").fill("");
  await dialog.getByLabel("Longitude").fill("");
  await dialog.getByLabel(/Name for this garden/).fill("Minneapolis");
  await dialog.getByRole("button", { name: "Save location" }).click();
  await expect(page.getByRole("button", { name: /Zone 4a · Minneapolis/ })).toBeVisible();
  await expect(page.getByText(/Adjusted for zone 4a/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plant now in zone 4a" })).toBeVisible();
  await page.goto("/calendar/");
  await expect(page.getByText(/In zone 4a the last spring frost averages around May 10/)).toBeVisible();
});

test("the planner adds a bed with a crop and keeps it after a reload", async ({ page }) => {
  await page.goto("/planner/");
  await expect(page.getByRole("heading", { name: "Garden report" })).toBeVisible();
  await page.getByRole("button", { name: "+ Raised bed" }).click();
  const panel = page.getByRole("complementary", { name: "Edit the plan" });
  await expect(panel.getByLabel("Name")).toHaveValue("Raised bed 3");
  await panel.getByLabel("Add a crop").selectOption({ label: "Lettuce" });
  await expect(panel.getByRole("button", { name: "Remove Lettuce" })).toBeVisible();
  const card = page.locator(".bed-card", { has: page.getByRole("heading", { name: "Raised bed 3" }) });
  await expect(card.getByText("Lettuce", { exact: true })).toBeVisible();
  await expect(card.getByText(/sq ft/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Raised bed 3" })).toBeVisible();
});

test("adding a crop by hand works offline and explains what needs the server", async ({ page }) => {
  await page.goto("/planner/");
  await page.getByRole("complementary", { name: "Edit the plan" }).getByRole("button", { name: "Raised bed 1" }).click();
  await page.getByRole("button", { name: "Add a crop that isn't listed…" }).click();
  const dialog = page.getByRole("dialog", { name: /Add a crop to Raised bed 1/ });
  await dialog.getByLabel("Plant name").fill("Tomatillo");
  await expect(dialog.getByText("The shared library needs the online version of the site.")).toBeVisible();
  await expect(dialog.getByText(/Accounts aren't turned on/)).toBeVisible();
  await dialog.getByRole("button", { name: "Or enter a plant by hand" }).click();
  await dialog.getByLabel("Plant name", { exact: true }).last().fill("Tomatillo");
  await dialog.getByRole("button", { name: "Save crop" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("complementary", { name: "Edit the plan" }).getByRole("button", { name: "Remove Tomatillo", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Crops you added" })).toBeVisible();
});

test("the account page explains when accounts are off", async ({ page }) => {
  await page.goto("/account/");
  await expect(page.getByText("Accounts aren't turned on for this copy of the site")).toBeVisible();
});

test("the planner sets a square yard from an acreage", async ({ page }) => {
  await page.goto("/planner/");
  const acres = page.getByLabel(/Yard size/);
  await acres.fill("1");
  await acres.press("Enter");
  await expect(page.getByLabel(/^Width/)).toHaveValue("209");
  await expect(page.getByLabel(/^Depth/)).toHaveValue("209");
  await page.getByRole("button", { name: "¼ acre" }).click();
  await expect(page.getByLabel(/^Width/)).toHaveValue("104");
  await expect(page.getByRole("button", { name: "¼ acre" })).toHaveAttribute("aria-pressed", "true");
  await acres.fill("10");
  await acres.press("Enter");
  await expect(page.getByLabel(/^Width/)).toHaveValue("400");
  await expect(page.getByText(/goes up to about 3\.67 acres/)).toBeVisible();
});

test("shade sources: add, duplicate, and line an edge with a fence", async ({ page }) => {
  await page.goto("/planner/");
  const palette = page.getByRole("complementary", { name: "Shade sources" });
  await palette.getByRole("group", { name: "Add a shade source" }).getByRole("button", { name: "Fence" }).click();
  const list = palette.locator(".shade-list li");
  const before = await list.count();
  await palette.getByRole("button", { name: "Duplicate Fence", exact: true }).click();
  await expect(list).toHaveCount(before + 1);
  await expect(palette.getByRole("status")).toHaveText("Added Fence 2.");
  await palette.getByRole("group", { name: /Line an edge with/ }).getByRole("button", { name: "Top" }).click();
  await expect(palette.getByRole("status")).toContainText("along the top edge");
  await expect(list).toHaveCount(before + 2);
  await page.reload();
  await expect(page.getByRole("complementary", { name: "Shade sources" }).locator(".shade-list li")).toHaveCount(before + 2);
});

test("the planner camera works like Blender: number-key views, axis gizmo and orthographic toggle", async ({ page }) => {
  await page.goto("/planner/");
  const readout = page.locator(".view-name");
  await expect(readout).toHaveText("User Perspective");
  const canvas = page.locator(".scene-canvas");
  await canvas.focus();
  await page.keyboard.press("7");
  await expect(readout).toHaveText("Top Orthographic");
  await page.keyboard.press("1");
  await expect(readout).toHaveText("Front Orthographic");
  await page.keyboard.press("5");
  await expect(readout).toHaveText("Front Perspective");
  await page.getByRole("button", { name: /^Right view/ }).click();
  await expect(readout).toHaveText("Right Orthographic");
  await page.keyboard.press("Home"); // frames the yard without changing the direction
  await expect(readout).toHaveText("Right Orthographic");
  await canvas.focus();
  await page.keyboard.press("8"); // orbit up 15°
  await expect(readout).toHaveText("User Orthographic");
  await expect(page.locator(".view-pos")).toContainText(/X .* Y .* Z .* ft/);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(readout).toHaveText("User Perspective");
});

test("snap to grid: new beds and arrow-key nudges land on the grid, and the setting is remembered", async ({ page }) => {
  await page.goto("/planner/");
  const snap = page.getByRole("button", { name: "Snap to grid" });
  await expect(snap).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Grid size").selectOption("5");
  await page.getByRole("button", { name: "+ Raised bed" }).click();
  const panel = page.getByRole("complementary", { name: "Edit the plan" });
  const fromLeft = panel.getByLabel("From left");
  // A 4 ft wide bed with its left edge on a 5 ft line is centered 2 ft past it.
  await expect(fromLeft).toHaveValue("32");
  await page.locator(".scene-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await expect(fromLeft).toHaveValue("37");
  await snap.click();
  await expect(snap).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("ArrowRight"); // focus moved to the button, so this does nothing to the bed
  await page.locator(".scene-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await expect(fromLeft).toHaveValue("38");
  await page.reload();
  await expect(page.getByRole("button", { name: "Snap to grid" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByLabel("Grid size")).toHaveValue("5");
});

test("hover effects ease in and out over 300–500ms", async ({ page }) => {
  await page.goto("/plants/");
  const ms = (value) => Math.max(...value.split(",").map((v) => parseFloat(v) * (v.trim().endsWith("ms") ? 1 : 1000)));
  const check = async (locator) => {
    const { duration, timing } = await locator.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { duration: cs.transitionDuration, timing: cs.transitionTimingFunction };
    });
    const longest = ms(duration);
    expect(longest, duration).toBeGreaterThanOrEqual(300);
    expect(longest, duration).toBeLessThanOrEqual(500);
    expect(timing).toContain("cubic-bezier(0.45, 0, 0.55, 1)");
  };
  await check(page.getByRole("button", { name: "All", exact: true })); // a filter chip
  await check(page.getByRole("searchbox", { name: "Search plants" }));
  await check(page.locator(".letter-index a").first());
  await check(page.getByRole("navigation", { name: "Main menu" }).getByRole("link", { name: "Shop" }));
  await check(page.locator("a[href]").filter({ hasText: /\S/ }).last());
});

test("list items lower on the page fade up as they scroll into view, and all of them print", async ({ page }) => {
  await page.goto("/plants/");
  const last = page.locator(".entry").last();
  await expect(last).toHaveClass(/reveal-item/); // below the fold, so it waits to be revealed
  await expect(last).toHaveCSS("opacity", "0");
  await page.emulateMedia({ media: "print" });
  await expect(last).toHaveCSS("opacity", "1"); // printing shows everything
  await page.emulateMedia({ media: "screen" });
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "1");
  // Items on screen when the page loads are never hidden.
  await expect(page.locator(".entry").first()).not.toHaveClass(/reveal-item/);
});
