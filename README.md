# Fulton Homestead Book

A month-by-month homestead guide for Fulton County, Georgia (zone 8a), built with Next.js (App Router).

Each top-row tab is its own page, and every page fades in over 500 ms when you switch to it.

## Pages

| Route | What's there |
| --- | --- |
| `/` | This month: what to plant, harvest and do, with a month picker |
| `/calendar/` | The full 12-month planting and harvest calendar |
| `/plants/` | Index of 45 fruits, vegetables and herbs: nutrition, care guide, healthy look, problems, companions |
| `/plant-doctor/` | Healthy vs. unhealthy photo comparisons with cause and fix |
| `/recipes/` | Seasonal recipes from the garden |
| `/pantry/` | Store-bought staples and combination recipes |
| `/water/` | Filtering and purifying water (CDC guidance) |
| `/remedies/` | Simple home remedies and when to get care |
| `/bees/`, `/chickens/`, `/fish/` | Detailed guides with gear checklists |
| `/credits/` | Every photo with its author and license |
| `/book/` | The whole book on one page, for printing |

## First run

```bash
npm install
npm run photos   # downloads free-license photos from Wikimedia Commons (needs internet once)
npm run dev      # open http://localhost:3000
```

## Check your work

```bash
npm run lint                         # ESLint with Next's core-web-vitals rules
npx playwright install chromium webkit   # first time only
npm run test:e2e                     # builds, then tests every tab, the fade, search, checklists and the 404 page
```

The tests run in desktop Chrome and a phone-sized Safari (WebKit).

## Use it offline

```bash
npm run offline  # builds a static site into /out and serves it at http://localhost:3000
```

After `npm run photos` and a build, nothing needs the internet: fonts are bundled from npm (no Google Fonts requests) and photos live in `public/photos`.

## Print

Use **Print this page** for one section, or open **Whole book** and print that page (or save it as a PDF). Each section starts on a new printed page.

## Photos

- `data/photo-queries.json` lists every photo slot and the Commons search used to fill it. Add `"file": "File:Exact name.jpg"` to pin a specific photo.
- `npm run photos -- sym-spots plant-okra` re-picks just those slots; `npm run photos -- --force` re-picks all.
- `data/photos.json` stores each photo's title, author, license and source page; the Photo credits page reads it.
- Photos are chosen automatically by search, so look them over on `/credits/` and pin better ones where needed.
- Until photos are downloaded, the app shows drawn illustrations instead.

## Where things live

- `app/` — one folder per route; `app/template.js` provides the 500 ms fade on every navigation
- `components/sections/` — each page's content, reused by `/book/`
- `lib/` — the book's data: calendar, plants, symptoms and drawings, recipes, pantry and remedies, animal guides
- `scripts/fetch-photos.mjs` — the photo downloader
- `tests/` — Playwright end-to-end tests
- `public/serve.json` — security headers (CSP, frame blocking, nosniff) and caching for the offline server

## Decisions

- **Static export** (`output: "export"`) so the whole book runs offline from `/out` with no server code.
- **Fonts from npm** (`@fontsource/*`) instead of Google Fonts, so the app makes no requests to Google.
- **Plain CSS with design tokens** in `app/globals.css` (one color per job: green plant, yellow harvest and bees, red safety and chickens, blue water and fish). Styles sit in cascade layers (`reset, tokens, base, layout, components, print`); components use tokens only.
- **Light and dark themes** come from the same tokens. "Auto" follows the OS; the masthead switch saves Light or Dark in `localStorage` (`fhb-theme`) and sets `<html data-theme>`. A small inline script in `app/layout.js` (from `lib/theme.js`) applies the saved choice before first paint so there's no flash. The dark token block appears twice in `globals.css` (OS dark and saved dark), so edit both. Printing always uses the light palette.
- **Bees, chickens and fish guides** are stored as trusted HTML strings in `lib/animals.js` and rendered with `dangerouslySetInnerHTML`. They are static, author-written content with no user input, but converting them to JSX components would remove the raw-HTML sink.
- **CSP allows `'unsafe-inline'` scripts** because Next's static export inlines its hydration scripts.
# fultonCountyHarvest
