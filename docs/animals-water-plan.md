# Planner: animals and water (plan through Saturday, Nov 21, 2026)

Goal: the garden planner can place chickens, a fish farm, beehives, water tanks and a water filter,
and helps set each one up: sizes that respond to what you enter, health checks with tips, and a
simple hydroponics check (targets, readings, and what to adjust). Kept small on purpose; each step
is one sitting, ends with the usual checks (tsc, eslint, unit tests, both builds, Playwright), and
is committed only when asked.

| # | When | Step | Done when |
|---|------|------|-----------|
| 1 ✓ | Sat 11/14 (done) | **Icons and items.** Chicken coop, Fish farm, Beehive (an Animals group) and Water tank, Water filter (a Water group) on the Add to the yard list, each with an icon, a default size and a simple 3D shape. | They can be added, moved, turned, duplicated and deleted like a shed. |
| 2 | Sun–Mon | **Setup box.** In the editor for one of these items, a short Setup section with one or two inputs (birds, gallons, hives) and numbers that respond: coop and run floor space, feed and water a day, fish stocking, hive spacing, tank fill from a roof. Saved with the item. | Changing the input updates the numbers at once; the values survive a reload. |
| 3 | Tue | **Health and tips.** A short health checklist and 3–5 tips per animal (flock health for chickens, hive checks for bees, water quality for fish), reusing what the Chickens, Bees and Fish pages already say. | Each animal item shows its checklist and tips. |
| 4 | Wed–Thu | **Hydroponics check.** For a water tank (with a filter, and optionally the fish farm for aquaponics): target ranges for pH, EC/ppm and water temperature; fields for today's readings; each reading marked low, OK or high with what to do. | Entering readings shows a status and an action for each. |
| 5 | Fri | **Garden report.** An "Animals and water" card in the Garden report summing up the setup numbers, any health items to watch, and the latest water status. | The report shows it on screen and in print. |
| 6 | Sat 11/21 | **Wrap-up.** Unit tests for the setup and water math, a Playwright test for adding each item, README and tour text, screenshots, and the Code Flow list. | All checks pass. |

Notes
- Facts (space per bird, stocking density, pH and EC ranges) get checked against extension sources
  before they ship, the way the new plants were.
- The 60-item limit for non-bed items stays shared with the shade sources.
