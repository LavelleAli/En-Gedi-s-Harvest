import { test, expect, type Locator, type Page } from "@playwright/test";
import { ROUTES } from "../frontend/data/routes";

// The first-visit tour offer would sit over the page; these tests act as a returning reader.
// (tests/tour.spec.ts covers the tour itself.)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("fhb-tour", "seen");
    } catch {}
  });
});

// Watches an element's opacity frame by frame until it settles at 1 (or 2s pass): returns the lowest
// opacity seen and how long the fade took. Start it, then trigger the fade.
function watchFade(page: Page, selector: string): Promise<{ min: number; ms: number }> {
  return page.evaluate(
    (sel: string) =>
      new Promise((resolve) => {
        const start = performance.now();
        let min = 1;
        let sawFade = false;
        let fadeStart = 0;
        const tick = () => {
          const el = document.querySelector(sel);
          // Not on screen: a closed dialog, or anything hidden with visibility (the Tools menu while closed).
          const shown = el && (el.tagName !== "DIALOG" || (el as HTMLDialogElement).open) && getComputedStyle(el).visibility !== "hidden";
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

test("the first page of a visit fades in over 500ms with CSS, even before scripts run", async ({ browser, baseURL }) => {
  // No JavaScript at all: the fade is a CSS keyframe on <main>, so it still plays and finishes.
  const noScripts = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const page = await noScripts.newPage();
  await page.goto("/");
  const main = page.locator("main");
  await expect(main).toHaveCSS("animation-name", "page-in");
  await expect(main).toHaveCSS("animation-duration", "0.5s");
  await expect(main).toHaveCSS("opacity", "1");
  await noScripts.close();

  // Readers who prefer reduced motion get the page at once.
  const calm = await browser.newContext({ baseURL, reducedMotion: "reduce" });
  const calmPage = await calm.newPage();
  await calmPage.goto("/");
  await expect(calmPage.locator("main")).toHaveCSS("animation-name", "none");
  await calm.close();
});

// The Tools button in the sidebar, and the menu it opens (frontend/components/sidebar/ToolsMenu.tsx).
const toolsButton = (page: Page) => page.getByRole("navigation", { name: "Main menu" }).getByRole("button", { name: "Tools" });
const toolsMenu = (page: Page) => page.locator("[data-tools-menu]");

test("hovering Tools opens its menu, crossing into it keeps it open, and moving away fades it out", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones have no hover; the tap test covers them");
  await page.goto("/");
  const button = toolsButton(page);
  const menu = toolsMenu(page);
  await expect(menu).toBeHidden();

  const fadeIn = watchFade(page, "[data-tools-menu]");
  await button.hover();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  const { min, ms } = await fadeIn;
  expect(min).toBeLessThan(0.5);
  expect(ms).toBeGreaterThan(200); // 300ms, give or take a frame
  expect(ms).toBeLessThan(700);

  // Across the gap and into the menu: the grace period keeps it open.
  await menu.getByRole("link", { name: "Calendar", exact: true }).hover();
  await page.waitForTimeout(400);
  await expect(menu).toBeVisible();

  // Away from both: it stays for the 150ms grace period, then fades out over 300ms.
  const left = Date.now();
  await page.mouse.move(900, 600);
  await expect(menu).toBeVisible();
  await expect(menu).toBeHidden();
  expect(Date.now() - left).toBeGreaterThan(400);
  await expect(button).toHaveAttribute("aria-expanded", "false");
});

test("tapping Tools opens and closes its menu, and tapping elsewhere closes it", async ({ page, hasTouch }) => {
  test.skip(!hasTouch, "needs a touch screen");
  await page.goto("/");
  const button = toolsButton(page);
  const menu = toolsMenu(page);
  await button.tap();
  await expect(menu).toBeVisible();
  await button.tap();
  await expect(menu).toBeHidden();
  await button.tap();
  await expect(menu).toBeVisible();
  // The masthead's tagline: high on the page, clear of the menu sheet above the bottom bar.
  await page.getByText("Garden, kitchen, bees, chickens").tap();
  await expect(menu).toBeHidden();
});

test("the keyboard opens the Tools menu with Enter, closes it with Esc or by tabbing out", async ({ page, isMobile }) => {
  await page.goto("/");
  const button = toolsButton(page);
  const menu = toolsMenu(page);
  const firstPage = menu.getByRole("link", { name: ROUTES[0].label, exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(firstPage).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();

  // Space works too.
  await page.keyboard.press(" ");
  await expect(firstPage).toBeFocused();
  // Shift+Tab from the first page goes back to Tools, then out of the menu, which closes it. Not on
  // phones: they have no Tab key, and WebKit's Tab skips links and buttons unless Safari is set to stop on them.
  if (isMobile) return;
  await page.keyboard.press("Shift+Tab");
  await expect(button).toBeFocused(); // still inside, on Tools itself
  await page.keyboard.press("Shift+Tab");
  await expect(menu).toBeHidden();
});

test("every page opens from the Tools menu, and pages fade in over about 500ms", async ({ page, isMobile }) => {
  await page.goto("/");
  const menu = toolsMenu(page);
  for (const [i, route] of ROUTES.entries()) {
    // Phones tap Tools; wider screens point at it.
    if (isMobile) await toolsButton(page).tap();
    else await toolsButton(page).hover();
    await expect(menu).toHaveCSS("opacity", "1");
    // The current page is filled with the accent and marked for screen readers.
    if (i > 0) await expect(menu.getByRole("link", { name: ROUTES[i - 1].label, exact: true })).toHaveAttribute("aria-current", "page");
    const pageFade = i === 1 ? watchFade(page, ".page-fade") : null; // ROUTES[0] is the page we start on
    const link = menu.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: route.label, exact: true });
    if (isMobile) await link.tap();
    else await link.click();
    await expect(page).toHaveURL(new RegExp(`${route.href}$`));
    await expect(menu).toBeHidden(); // closed once its fade-out finished
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
  await page.goto("/plants/#plant-okra"); // a link to an entry opens it
  await page.locator('#plant-okra a[href*="#sym-"]').first().click();
  await expect(page).toHaveURL(/\/plant-doctor\/#sym-/);
  await expect(page.locator("#sym-rootrot")).toBeVisible();
});

test("the encyclopedia lists every plant A to Z under letter headings", async ({ page }) => {
  await page.goto("/plants/");
  const names = await page.locator(".entry .headword").allTextContents();
  expect(names.length).toBe(209); // 59 food crops + 150 roses, peonies, camellias, spring bulbs and companions
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
  await expect(page.getByRole("heading", { level: 3, name: "T", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Jump to a letter" }).getByRole("link", { name: "T", exact: true }).click();
  await expect(page).toHaveURL(/#letter-T$/);
});

test("encyclopedia entries are a list; a row opens into the full card and closes again", async ({ page }) => {
  await page.goto("/plants/");
  const row = page.getByRole("button", { name: /^Carrot\b/ });
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#plant-carrot .infobox")).toHaveCount(0);
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#plant-carrot .infobox")).toBeVisible();
  // A companion name links to that plant's entry and opens it.
  await page.locator("#plant-carrot .entry-body").getByRole("link", { name: "Onions" }).click();
  await expect(page.locator("#plant-onion-incl-green-and-walking-onions .infobox")).toBeVisible();
  await row.click();
  await expect(page.locator("#plant-carrot .infobox")).toHaveCount(0);
});

test("Open all opens every listed entry, and the Whole book prints them all open", async ({ page }) => {
  await page.goto("/plants/");
  await page.getByLabel("Type of plant").selectOption("herb");
  const herbs = await page.locator(".entry").count();
  await page.getByRole("button", { name: "Open all" }).click();
  await expect(page.locator(".entry .infobox")).toHaveCount(herbs);
  await page.getByRole("button", { name: "Close all" }).click();
  await expect(page.locator(".entry .infobox")).toHaveCount(0);
  await page.goto("/book/");
  await expect(page.locator(".entry .infobox")).toHaveCount(await page.locator(".entry").count());
});

test("search filters the encyclopedia", async ({ page }) => {
  await page.goto("/plants/");
  // The count line reads "N of M plants"; a search should leave fewer than all of them.
  await page.getByRole("searchbox", { name: "Search plants" }).fill("vitamin a");
  await expect(page.getByText(/^\d+ of \d+ plants/)).toHaveText(/^(\d+) of (?!\1 )\d+ plants/);
});

test("a search typed and a type picked while the page is still loading both count", async ({ page }) => {
  // Hold back the page's scripts, so the search box and dropdown are plain HTML when we use them.
  let release!: () => void;
  const scriptsMayLoad = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await scriptsMayLoad;
    await route.continue();
  });
  await page.goto("/plants/", { waitUntil: "domcontentloaded" });
  await page.getByRole("searchbox", { name: "Search plants" }).fill("rose");
  await page.getByLabel("Type of plant").selectOption("flower");
  release();
  // Once the page is live it applies both: only flowers mentioning "rose", fewer than all plants.
  const count = page.getByText(/^\d+ of \d+ plants/);
  await expect(count).toHaveText(/^(\d+) of (?!\1 )\d+ plants/);
  await expect(page.locator(".entry .headword").first()).toBeVisible();
  const names = await page.locator(".entry .headword").allTextContents();
  expect(names.length).toBeGreaterThan(0);
  await expect(page.getByRole("searchbox", { name: "Search plants" })).toHaveValue("rose");
  await expect(page.getByLabel("Type of plant")).toHaveValue("flower");
});

test("the type dropdown narrows to flowers, then peonies, and combines with the zone filter", async ({ page }) => {
  await page.goto("/plants/");
  const type = page.getByLabel("Type of plant");
  await expect(type.locator("option", { hasText: "Peonies (27)" })).toHaveCount(1);
  await type.selectOption({ label: "All roses & flowers (150)" });
  await expect(page.getByText(/^150 of 209 plants/)).toBeVisible();
  await type.selectOption({ label: "Peonies (27)" });
  await expect(page.getByText(/^27 of 209 plants/)).toBeVisible();
  await expect(page.locator("#plant-red-charm")).toBeVisible();
  await expect(page.locator("#plant-bathsheba")).toHaveCount(0);
  // "Grows in zone 8a" narrows the peonies further: a few are only rated to zone 7.
  await page.getByRole("button", { name: /^Grows in zone/ }).click();
  await expect(page.getByText(/^22 of 209 plants/)).toBeVisible();
  await expect(page.locator("#plant-red-charm")).toHaveCount(0);
  await type.selectOption("all");
  await expect(page.getByText(/^\d+ of 209 plants/)).not.toHaveText(/^209 of/);
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
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(14, 20, 17)"); // --bg, dark side (dark green)
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
});

test("theme switch sits in the top-right corner", async ({ page }) => {
  await page.goto("/");
  const box = (await page.getByRole("switch", { name: "Dark mode" }).boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(box.y).toBeLessThan(40);
  expect(width - (box.x + box.width)).toBeLessThan(40);
});

test("month calendar shows that month's checklist and remembers ticks", async ({ page }) => {
  await page.goto("/");
  const calendar = page.getByRole("group", { name: "Pick a month" });
  await expect(calendar.getByRole("radio")).toHaveCount(12);
  // Each tile is a <label> around its (visually hidden) radio button.
  const tile = (name: RegExp) => page.locator("label", { has: page.getByRole("radio", { name }) });
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
  await page.getByRole("button", { name: "Add a raised bed" }).click();
  const panel = page.getByRole("complementary", { name: "Edit the plan" });
  await expect(panel.getByLabel("Name")).toHaveValue("Raised bed 3");
  await panel.getByRole("button", { name: "Choose crops…" }).click();
  const picker = page.getByRole("dialog", { name: "Choose crops for Raised bed 3" });
  await picker.getByRole("button", { name: /^Lettuce/ }).click();
  await picker.getByRole("button", { name: "Done" }).click();
  await expect(picker).toBeHidden();
  await expect(panel.getByRole("button", { name: "Remove Lettuce" })).toBeVisible();
  // The report lists the bed; its row opens the bed's full report in a window.
  const row = page.locator(".bed-row", { hasText: "Raised bed 3" });
  await expect(row).toContainText("Lettuce");
  await row.click();
  const report = page.getByRole("dialog", { name: "Raised bed 3" });
  await expect(report.getByText("Lettuce", { exact: true })).toBeVisible();
  await expect(report.getByText(/sq ft/)).toBeVisible();
  await report.getByRole("button", { name: "Close" }).click();
  await expect(report).toBeHidden();
  await page.reload();
  await expect(page.locator(".bed-row", { hasText: "Raised bed 3" })).toBeVisible();
});

test("the garden report lists the beds; a bed's window leads to its editor", async ({ page }) => {
  await page.goto("/planner/");
  const rows = page.locator(".bed-row");
  await expect(rows).toHaveCount(2);
  // Every row is the same height.
  const [a, b] = await Promise.all([rows.nth(0).boundingBox(), rows.nth(1).boundingBox()]);
  expect(Math.round(a!.height)).toBe(Math.round(b!.height));
  await rows.filter({ hasText: "Kitchen plot" }).click();
  const report = page.getByRole("dialog", { name: "Kitchen plot" });
  await expect(report.getByRole("heading", { name: "Watering" })).toBeVisible();
  await report.getByRole("button", { name: "Edit this bed" }).click();
  await expect(report).toBeHidden();
  const editor = page.getByRole("complementary", { name: "Edit the plan" });
  await expect(editor.getByLabel("Name")).toHaveValue("Kitchen plot");
  await expect(editor.getByLabel("Name")).toBeFocused();
  // Printed, the list gives way to every bed's full card.
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".bed-card")).toHaveCount(2);
  await expect(rows.first()).toBeHidden();
});

test("the crop picker filters by type and name, and toggles crops in and out of the bed", async ({ page }) => {
  await page.goto("/planner/");
  await page.getByRole("region", { name: "In this yard" }).getByRole("button", { name: "Raised bed 1" }).click();
  await page.getByRole("complementary", { name: "Edit the plan" }).getByRole("button", { name: "Choose crops…" }).click();
  const picker = page.getByRole("dialog", { name: "Choose crops for Raised bed 1" });
  const types = picker.getByRole("group", { name: "Type of plant" });
  await expect(types.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
  // Fruits only: no vegetables (lettuce) left, and every tile says Fruit.
  await types.getByRole("button", { name: /^Fruits/ }).click();
  await expect(picker.getByRole("button", { name: /^Lettuce/ })).toHaveCount(0);
  await expect(picker.getByRole("button", { name: /^Strawberry/ }).first()).toBeVisible();
  // A name narrows it further; the bed's tomato is already picked.
  await types.getByRole("button", { name: /^Vegetables/ }).click();
  await picker.getByLabel("Find a crop").fill("tomat");
  const tomato = picker.getByRole("button", { name: /^Tomato Vegetable/ });
  await expect(tomato).toHaveAttribute("aria-pressed", "true");
  await tomato.click();
  await expect(tomato).toHaveAttribute("aria-pressed", "false");
  await expect(picker.getByRole("status")).toHaveText("1 of 12 crops in this bed.");
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();
  await expect(page.getByRole("complementary", { name: "Edit the plan" }).getByRole("button", { name: "Remove Tomato" })).toHaveCount(0);
});

test("adding a crop by hand works offline and explains what needs the server", async ({ page }) => {
  await page.goto("/planner/");
  await page.getByRole("region", { name: "In this yard" }).getByRole("button", { name: "Raised bed 1" }).click();
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
  // Typing before React has hydrated the page is lost, so type again until it takes.
  await expect(async () => {
    await acres.fill("1");
    await acres.press("Enter");
    await expect(page.getByLabel(/^Width/)).toHaveValue("209", { timeout: 1000 });
  }).toPass();
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
  const palette = page.getByRole("complementary", { name: "Add to the yard" });
  const inYard = page.getByRole("region", { name: "In this yard" });
  await palette.getByRole("group", { name: "Add a shade source" }).getByRole("button", { name: "Fence" }).click();
  const list = inYard.locator(".yard-list li");
  const before = await list.count();
  await inYard.getByRole("button", { name: "Duplicate Fence", exact: true }).click();
  await expect(list).toHaveCount(before + 1);
  await expect(inYard.getByRole("status")).toHaveText("Added Fence 2.");
  await palette.getByRole("group", { name: /Line an edge with/ }).getByRole("button", { name: "Top" }).click();
  await expect(palette.getByRole("status")).toContainText("along the top edge");
  await expect(list).toHaveCount(before + 2);
  await page.reload();
  await expect(page.getByRole("region", { name: "In this yard" }).locator(".yard-list li")).toHaveCount(before + 2);
});

test("a selected bed turns with the buttons, the R key and the Rotation box, and stays turned", async ({ page }) => {
  await page.goto("/planner/");
  await page.getByRole("region", { name: "In this yard" }).getByRole("button", { name: "Raised bed 1" }).click();
  const turn = page.getByRole("group", { name: "Turn Raised bed 1" });
  const angle = turn.locator(".rotate-angle");
  const rotation = page.getByRole("complementary", { name: "Edit the plan" }).getByLabel(/^Rotation/);
  await expect(angle).toHaveText("0°");
  await turn.getByRole("button", { name: "Turn right 15°" }).click();
  await expect(angle).toHaveText("15°");
  await turn.getByRole("button", { name: "Turn left 15°" }).click();
  await turn.getByRole("button", { name: "Turn left 15°" }).click();
  await expect(angle).toHaveText("345°");
  await expect(rotation).toHaveValue("345");
  // R and Shift+R on the focused 3D view.
  await page.locator(".scene-canvas").focus();
  await page.keyboard.press("r");
  await page.keyboard.press("r");
  await expect(angle).toHaveText("15°");
  await page.keyboard.press("Shift+R");
  await expect(angle).toHaveText("0°");
  await rotation.fill("90");
  await expect(angle).toHaveText("90°");
  await page.reload();
  await page.getByRole("region", { name: "In this yard" }).getByRole("button", { name: "Raised bed 1" }).click();
  await expect(page.getByRole("group", { name: "Turn Raised bed 1" }).locator(".rotate-angle")).toHaveText("90°");
  // Nothing selected, no turn buttons.
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("group", { name: /^Turn / })).toHaveCount(0);
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
  await page.getByRole("button", { name: "Add a raised bed" }).click();
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
  const ms = (value: string) => Math.max(...value.split(",").map((v: string) => parseFloat(v) * (v.trim().endsWith("ms") ? 1 : 1000)));
  const check = async (locator: Locator) => {
    const { duration, timing } = await locator.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { duration: cs.transitionDuration, timing: cs.transitionTimingFunction };
    });
    const longest = ms(duration);
    expect(longest, duration).toBeGreaterThanOrEqual(300);
    expect(longest, duration).toBeLessThanOrEqual(500);
    expect(timing).toContain("cubic-bezier(0.45, 0, 0.55, 1)");
  };
  await check(page.getByRole("button", { name: "★ My garden" })); // a filter chip
  await check(page.getByLabel("Type of plant")); // the type dropdown
  await check(page.getByRole("searchbox", { name: "Search plants" }));
  await check(page.getByRole("navigation", { name: "Jump to a letter" }).getByRole("link").first());
  await check(page.getByRole("navigation", { name: "Main menu" }).getByRole("link", { name: "Shop" }));
  await check(page.locator("a[href]").filter({ hasText: /\S/ }).last());
});

test("list items lower on the page fade up as they scroll into view, and all of them print", async ({ page }) => {
  await page.goto("/plants/");
  const last = page.locator(".entry").last();
  await expect(last).toHaveClass(/reveal-item/); // below the fold, so it waits to be revealed
  await expect(last).toHaveCSS("opacity", "0");
  // Items on screen when the page loads are never hidden. (On a phone the masthead and toolbar fill the
  // first screen, so there may be none; on a desktop the first rows are.)
  const hiddenOnScreen = await page.evaluate(() =>
    [...document.querySelectorAll(".entry")].filter((el) => el.getBoundingClientRect().bottom <= innerHeight && el.classList.contains("reveal-item")).length,
  );
  expect(hiddenOnScreen).toBe(0);
  await page.emulateMedia({ media: "print" });
  await expect(last).toHaveCSS("opacity", "1"); // printing shows everything
  await page.emulateMedia({ media: "screen" });
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "1");
});

test("scrolling the encyclopedia never leaves on-screen rows invisible", async ({ page }) => {
  await page.goto("/plants/");
  for (let i = 0; i < 5; i++) {
    // Scroll most of a screen at a time. (window.scrollBy rather than the mouse wheel, which phone
    // WebKit doesn't support; "instant" so a smooth-scroll setting can't slow it down.)
    await page.evaluate(() => window.scrollBy({ top: innerHeight * 0.8, behavior: "instant" }));
    await page.waitForTimeout(600); // the fade-up takes 0.4s
    const faint = await page.evaluate(() =>
      [...document.querySelectorAll(".entry")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(el).opacity) < 0.9;
      }).length,
    );
    expect(faint).toBe(0);
  }
});
