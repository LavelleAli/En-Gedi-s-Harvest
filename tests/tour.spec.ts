import { test, expect } from "@playwright/test";
import { TOUR } from "../frontend/data/tour";

// The optional walkthrough (frontend/components/Tour.tsx). These tests start as a first-time reader,
// so the tour offer shows; tests/navigation.spec.ts marks it as seen instead.

test("a first visit offers the tour, and No thanks keeps it away", async ({ page }) => {
  await page.goto("/");
  const offer = page.getByRole("complementary", { name: "New here?" });
  await expect(offer).toBeVisible();
  await offer.getByRole("button", { name: "No thanks" }).click();
  await expect(offer).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(2000); // the offer would appear after 1.5s
  await expect(page.getByRole("complementary", { name: "New here?" })).toHaveCount(0);
});

test("the tour walks across pages, pointing at each tool, and ends on Done", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show me around" }).click();
  const card = page.getByRole("dialog", { name: TOUR[0].title });
  await expect(card).toBeVisible();
  await expect(card).toBeFocused();

  // Arrow keys move through the steps; the planner step opens the planner page.
  const planner = TOUR.findIndex((s) => s.target === "planner-tools");
  for (let i = 0; i < planner; i++) {
    // Wait until the card has focus: the arrow keys only work there, and the card takes focus once its step is in place.
    await expect(page.getByRole("dialog", { name: TOUR[i].title })).toBeFocused();
    await page.keyboard.press("ArrowRight");
  }
  await expect(page).toHaveURL(/\/planner\/$/);
  await expect(page.getByRole("dialog", { name: TOUR[planner].title })).toBeVisible();
  await expect(page.locator('[data-tour="planner-tools"]')).toBeInViewport();

  // Back returns a step; Next carries on to the end.
  await page.getByRole("dialog", { name: TOUR[planner].title }).getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("dialog", { name: TOUR[planner - 1].title })).toBeVisible();
  for (let i = planner - 1; i < TOUR.length - 1; i++) {
    await page.getByRole("dialog", { name: TOUR[i].title }).getByRole("button", { name: "Next" }).click();
  }
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("dialog", { name: TOUR[TOUR.length - 1].title })).toHaveCount(0);
});

test("Esc ends the tour, and Tools → Take the tour starts it again", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show me around" }).click();
  await expect(page.getByRole("dialog", { name: TOUR[0].title })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: TOUR[0].title })).toHaveCount(0);

  await page.getByRole("button", { name: "Tools" }).click();
  await page.getByRole("button", { name: "Take the tour" }).click();
  await expect(page.getByRole("dialog", { name: TOUR[0].title })).toBeVisible();
});
