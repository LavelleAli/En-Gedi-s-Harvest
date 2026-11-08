import { test, expect } from "@playwright/test";
import { ROUTES } from "../lib/routes.js";

test("every top-row tab opens its own page and fades in over 500ms", async ({ page }) => {
  await page.goto("/");
  for (const route of ROUTES) {
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: route.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route.href}$`));
    const fade = page.locator(".page-fade");
    await expect(fade).toHaveCSS("animation-duration", "0.5s");
    await expect(fade).toHaveCSS("opacity", "1");
    await expect(page.getByRole("link", { name: route.label, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("a plant's problem link opens the matching plant doctor card", async ({ page }) => {
  await page.goto("/plants/");
  await page.locator("#plant-okra summary").click();
  await page.locator('#plant-okra a[href*="#sym-"]').first().click();
  await expect(page).toHaveURL(/\/plant-doctor\/#sym-/);
  await expect(page.locator("#sym-rootrot")).toBeVisible();
});

test("search filters the plant index", async ({ page }) => {
  await page.goto("/plants/");
  await page.getByRole("searchbox", { name: "Search plants" }).fill("vitamin a");
  await expect(page.getByText(/of 45 plants/)).not.toHaveText("45 of 45 plants");
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
  const themes = page.getByRole("group", { name: "Color theme" });
  await expect(themes.getByRole("button", { name: "Auto" })).toHaveAttribute("aria-pressed", "true");

  await themes.getByRole("button", { name: "Dark" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(17, 21, 18)");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(themes.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");

  await themes.getByRole("button", { name: "Auto" }).click();
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(17, 21, 18)");
});
