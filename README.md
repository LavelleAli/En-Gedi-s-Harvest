# En Gedi's Harvest

A month-by-month homestead guide for any North American hardiness zone: garden calendar and checklist, an A to Z plant encyclopedia, a 3D garden planner, plant doctor, recipes, pantry, safe water, home remedies, and guides to bees, chickens and fish. Built with Next.js (App Router), three.js, Firebase, Claude and Stripe.

The book was first written for Fulton County, Georgia (zone 8a), which is still the default location.

## Using the app

### 1. Set your location

Click **Zone 8a · Fulton County, GA · Change** at the top of any page.

- A **U.S. map** colored by zone opens. Point at a state (or tab to it) and a card fades in with its zone range, frost dates and growing season. Click the state, then pick your exact zone from its range. Confirm it by ZIP code on the USDA site; the state ranges are approximate.
- Outside the U.S., choose **Pick your zone directly** (1a to 13b). In Canada or Mexico, use your area's USDA-method zone.
- Optionally press **Use my location**, or type a latitude and longitude, so the planner's sun and shadows are exact. Without coordinates it estimates them from your zone and time zone.

Your location is saved in this browser only. Everything below adjusts to it.

### 2. This month

The home page shows a 12-month calendar. Pick a month to see its checklist of what to **plant, harvest and do**, and tick items off as you go. Ticks are saved in the browser, and each month's tile shows its progress. Under the checklist, **Plant now in zone X** lists crops whose planting window is open that month.

Outside zone 8a, the calendar shifts with your frost dates: spring work moves with your last spring frost, and fall work with your first fall frost.

### 3. Garden planner

The planner has **Add to the yard** and **Sun and shade** side by side on top, the 3D yard (the sandbox) across the full width under them, and the **Yard** (or selected item's) editor beside **In this yard** (everything you've placed) at the bottom. On very wide windows (111rem / 1776px and up) **Sun and shade** moves into the empty space left of the sandbox and **Add to the yard** into the space right of it, each as tall as the sandbox and scrolling inside if needed; the sandbox keeps its size. On narrower screens everything stacks. The sandbox is never smaller than 300 × 300 px.

1. The planner opens with a sample yard: a house, an oak and two beds. Set the **yard size** and which way **the top of the plan faces** in the Yard panel. **Snap to grid** is at its foot.
2. Add beds (**Raised bed**, **In-ground bed**) and shade sources (house, shed, tree, hedge, fence) from **Add to the yard**. **In this yard** lists them; ⧉ duplicates a shade source.
3. Click an item in the 3D view (or its name in **In this yard**) to select it. Drag it to move it, or focus the view and use the arrow keys (Shift moves 5 ft, Delete removes it). Its editor takes the Yard panel's place; **Done** goes back.
4. Turn a selected item with the ⟲ ⟳ buttons in the sandbox's bottom-right corner (15° a click), or press **R** (Shift + R turns the other way). The editor's **Rotation (°)** box takes an exact angle. Turned houses, hedges and fences cast turned shadows on the sun-hours map.
5. Pick crops for a bed with **Choose crops…**. It opens a window with every crop, filtered by type (**All**, **Vegetables**, **Fruits**, **Herbs**, **Flowers**) and by name, grouped into crops to plant this month in your zone, crops that grow in your zone, and the rest. Click a crop to put it in the bed (a check marks it) and again to take it out; a bed holds up to 12.
6. Switch the camera with **3D** and **Top** in the sandbox's corner. In **Sun and shade**, pick a **date** (or an equinox or solstice) and slide the **time** to watch shadows move. **Sun-hours map** colors the yard by hours of direct sun that day.

The **garden report** below gives the day's sunrise, sunset and sun angle, and a weekly watering schedule in gallons, side by side. Under them, **Beds** lists every bed (its size, crops, light and how many things need a look); click a row to open that bed's full report in a window, with **Edit this bed** to jump to its editor. Printed, every bed's full report is on the page. For each bed it reports:

- its light (full sun to shade) and how many plants fit
- whether each crop gets enough sun
- when and how to plant each crop in your zone
- companion pairs and conflicts, including with beds closer than 3 ft
- how much and how often to water

### 4. Adding a crop that isn't listed

In a bed's panel, choose **Add a crop that isn't listed…** and type a name. The app looks in this order:

1. **The stock list** of 59 plants. Free.
2. **The shared library** of every plant anyone has researched. Free, no account needed.
3. **Research with Claude.** Needs a free account. Claude searches extension services and seed companies and writes a growing guide for your zone, with links to its sources. The result joins the shared library for everyone. Free accounts get 5 a month; the **Garden plan** ($3/month) is unlimited. A lookup only counts when new research runs, and failed lookups are refunded.

You can always **enter a plant by hand** instead. That works offline and needs no account.

### 5. Plant encyclopedia

Every plant A to Z, with a letter index. Each entry has a facts box (family, type, hardiness, sun, water, soil, spacing, days to harvest, planting dates for your zone) and sections on growing, what a healthy plant looks like, problems (linked to the plant doctor) and companions. Filter by type or by **Grows in my zone**, search across everything, and star the plants you grow.

### 6. Accounts

**Sign in** (top right) with Google or an email and password. The account page shows your plan and this month's lookups, and lets you upgrade, manage billing in Stripe's portal, sign out, or delete your account. Reading the book and using the planner never need an account.

**Sync across devices.** While you're signed in, your starred plants, gear checklists, monthly to-dos and garden plan follow you to your other devices. Your location and light/dark choice stay on each device. Changes are sent about a second after you make them, and another device picks them up when you switch back to its tab. Deleting your account deletes the synced copies too.

How it works in the code: `frontend/account/SavedDataSync.ts` watches each store's change event and calls `/api/saved/`; `backend/saved/service.ts` decides what's allowed (five keys, about 200 KB each, newest save wins); `backend/saved/store.ts` keeps it in Firestore at `savedData/{uid}/items/{key}`; `frontend/account/sync.ts` settles conflicts when two devices disagree. The list of what syncs is in `shared/saved-data.ts`.

### 7. Sidebar and shop

The **sidebar** (left on wider screens, along the bottom on phones) has **Account**, **Profile**, **Tools** and **Shop**. **Tools** opens a menu of every page of the book: point at it with the mouse (it closes when you move away), tap it on a phone, or press Enter or Space on it from the keyboard (Esc closes it). **Profile** shows your garden location and what you've saved, and whether it syncs. **Shop** lists the gear the guides call for (beekeeping, water filtration, garden supplies). The items are placeholders for now, with no prices or checkout; they're in `frontend/data/shop.ts`, and their photos download with `npm run photos`.

### Other sections

**Calendar** is the whole year for your zone in one table. **Plant doctor** puts healthy and problem plants side by side. **Recipes** and **Pantry** cover cooking. **Water** and **Remedies** cover safe water and home care. **Bees**, **Chickens** and **Fish** are full guides with gear checklists; their rules are written for Georgia, and each says so. **Whole book** puts everything on one page for printing.

## Layout

Every page shares the same frame:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 8A · FULTON COUNTY, GA  Change    ← location picker (dialog)      │
│ En Gedi's Harvest                      [Auto|Light|Dark] [Print]       │
│ Garden, kitchen, … for your zone.      [Whole book] [Sign in]          │
├────────────────────────────────────────────────────────────────────────┤
│ ● This month ● Calendar ● Garden planner ● Plant encyclopedia ● … →    │  sticky tabs
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   page content (fades in on every navigation)                          │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ footer: planting dates are zone averages · check local rules · credits │
└────────────────────────────────────────────────────────────────────────┘
```

Home page (This month), on wide screens:

```
┌──────────────────────────────────────────────┬─────────────────────────┐
│ WHAT TO DO NOW                               │  Year calendar (sticky) │
│ This month: November                         │ ┌─────┬─────┬─────┐     │
│ 3 of 16 done in November ▓▓▓░░░░  [Clear]    │ │ Jan │ Feb │ Mar │     │
│ ┌ Plant or sow ────────────── 2/4 ┐          │ │ 2/10│ 0/12│ 0/10│     │
│ │ ☑ Garlic cloves  ☐ Onion sets   │          │ ├─────┼─────┼─────┤     │
│ └─────────────────────────────────┘          │ │ …   │ …   │ …   │     │
│ ┌ Harvest ─────────────────── 0/9 ┐          │ ├─────┼─────┼─────┤     │
│ ┌ Other tasks ─────────────── 1/3 ┐          │ │ Oct │ Nov●│ Dec │     │
│ ┌ Plant now in zone 8a ───────────┐          │ └─────┴─────┴─────┘     │
│ └─────────────────────────────────┘          │                         │
└──────────────────────────────────────────────┴─────────────────────────┘
  On phones the calendar sits above the checklist.
```

Garden planner:

```
┌───────────────────────────────────┬────────────────────────────────────┐
│ Add to the yard                   │ Sun and shade                      │
│ [Raised bed] [In-ground bed]      │ Date [11/14/2026] (equinoxes…)     │
│ [House] [Shed] [Tree] [Hedge] …   │ Time ●──────────  [Sun-hours map]  │
├───────────────────────────────────┴────────────────────────────────────┤
│ [3D|Top]                                                    gizmo  ✋ 🔍 │
│   three.js yard: beds, plants, house, trees, fences; real shadows;     │
│   sun path; compass; optional sun-hours heat map                       │
│ User Perspective                                      [⟲  15°  ⟳]      │
├───────────────────────────────────┬────────────────────────────────────┤
│ Yard: size, facing, snap          │ In this yard                       │
│  — or —                           │  Raised bed 1   Kitchen plot       │
│ Bed: name, type, size, rotation,  │  House ⧉        Oak ⧉              │
│  crops, [Choose crops…] ──► crop picker window: type filters, search    │
├───────────────────────────────────┴────────────────────────────────────┤
│                             Garden report                              │
│ ┌ Sun on Nov 14 ──────────┐ ┌ Watering schedule: Mon … Sun, gallons ┐  │
│ ┌ Raised bed 1 · Full sun 10.5 h ┐ ┌ Kitchen plot · Part sun 5.2 h ┐    │
│ │ crops, fit, planting steps,    │ │ …                              │    │
│ │ companions, watering           │ │                                │    │
└────────────────────────────────────────────────────────────────────────┘
```

  Windows 1776px and up: the two top panels move beside the sandbox, as tall as it.

```
┌ Sun and shade ┐ ┌ sandbox (same size as above) ───────────┐ ┌ Add to the yard ┐
│ Date, time,   │ │                                          │ │ Beds            │
│ sun-hours map │ │                                          │ │ Shade sources   │
└───────────────┘ └──────────────────────────────────────────┘ └─────────────────┘
                  ┌ Yard / Bed editor ──┐ ┌ In this yard ─────┐
```

How a plant lookup flows:

```
 Add crop dialog ──► stock list (in the browser) ──found──► add to bed
        │ not found
        ▼
 GET /api/plants/?q=  ──► Firestore "plants" (shared library) ──found──► add to bed
        │ not found, user signed in
        ▼
 POST /api/plants/research/  ──► verify Firebase token ──► check quota (users/{uid})
        │                                                   free: 5/month · Garden: unlimited
        ▼
 Claude Opus 5.5 + web search (≤5 searches, JSON output) ──► validate & clamp
        │                                                   keep only real source links
        ▼
 save to shared library ──► return crop ──► add to bed      (failures refund the lookup)
```

## How the code is organized

```
app/                 Next.js routes only: each page.tsx renders a component from frontend/,
│                    each api/**/route.api.ts re-exports a handler from backend/
├─ layout.tsx        masthead, tabs, footer, theme script
├─ planner/ account/ plants/ calendar/ …     one folder per page
└─ api/              plants, plants/research, account, billing/{checkout,portal,webhook}
frontend/            everything that runs in the browser
├─ sections/         each page's content (also reused by /book/), one folder per page, split into small parts
│  ├─ month/         the home page: YearCalendar, MonthTile, ChecklistPacket, ChecklistItem, Suggestions…
│  ├─ calendar/      the year table: CalendarRow, FrostLead
│  ├─ plants/        the encyclopedia: EntryRow, EntryToggle, EntryCard, Infobox, PlantToolbar, TypeFilter…
│  ├─ doctor/        the plant doctor: SymptomCard, CompareFrame, WeeklyCheckup
│  ├─ recipes/       recipes and pantry: RecipeCard, RecipeGrid, SeasonFilter, PantrySection
│  ├─ water/ remedies/   the safe water and home remedies guides
│  ├─ animals/       bees, chickens and fish: one guide component each, plus Guide, GuideSection, GearTable…
│  ├─ shop/ credits/ the shop and the photo credits
│  └─ account/ profile/  sign in, plans, billing and deleting the account; the profile page
├─ planner/          PlannerApp, GardenScene (three.js) and its parts in folders: controls/ (toolbar, sun),
│                    scene/ (the sandbox, its turn buttons), editors/ (bed, shade source, yard), palette/ (Add to
│                    the yard, In this yard), croppicker/ (the Choose crops window),
│                    report/, addcrop/; and pure logic: sun.ts (solar position),
│                    footprint.ts (turned footprints), shade.ts (sun-hours map),
│                    analysis.ts (companions, planting notes, watering), model.ts (saved plan)
├─ account/          Firebase sign-in (auth.ts), API client (api.ts), account sync
├─ components/       shared UI: sidebar/ (Sidebar, the Tools hover menu), LocationPicker, ZoneMap, ThemeToggle, Photo, Tour, …
│  └─ ui/            the building blocks: Page, SectionHeader, Kicker, Button, ButtonLink, Chip, Tag, Card, Packet,
│                    Callout, TableCard, FactList, Columns, Steps, ToneList, Field, Hint, FormMessage, Dialog, Spinner…
├─ lib/              browser state (location, theme, monthly checklist) and motion.ts (GSAP settings)
├─ data/             the book's content: calendar, plants, recipes, guides, photos
└─ styles/           theme.css (design tokens, light and dark), globals.css (Tailwind setup, base styles, print)
backend/             everything that runs on the server (Vercel functions)
├─ handlers/         route handlers and the services they use (deps.ts)
├─ plants/           service.ts (lookup rules), research.ts (Claude), library.ts (Firestore)
├─ accounts/         repository.ts (plans, monthly quota, Stripe event log)
├─ billing/          service.ts (Checkout, portal, webhooks)
├─ config.ts         environment variables, validated with Zod
├─ http.ts           problem-details errors, request IDs, logs, rate limiting
└─ firebase.ts       Firebase Admin: token checks and Firestore
shared/              used by both sides
├─ zones.ts          USDA zones and frost dates
├─ crop.ts           the crop record schema (Zod) and name matching
├─ catalog.ts        the 59-plant stock catalog
└─ planting.ts       planting windows and zone suggestions
tests/               Playwright end-to-end tests (desktop Chrome, phone Safari)
**/__tests__/        Vitest unit tests (shared, planner math, backend rules)
```

Saved in the browser (localStorage): location (`fhb-location`), theme, checklist ticks, starred plants, gear checklists, garden plan (`fhb-garden`) and added crops (`fhb-crops`). Saved on the server (Firestore): the shared plant library (`plants/{id}`), account plan and monthly lookups (`users/{uid}`, no email or name), and handled Stripe events (`stripeEvents/{id}`).

## Styling and animation

Each tool does the job it's best at:

- **Tailwind CSS v4**: the styling, written as utility classes in the components (the same way as the
  portfolio). Every page and component styles itself; long class lists are split into commented groups or
  named constants. The move from hand-written CSS was checked page by page against screenshots of every
  route in light, dark and phone views, which match pixel for pixel.
  - Reach for the shared building blocks in `frontend/components/ui/` before writing classes again:
    `<Page>`, `<SectionHeader kicker title lead />`, `<Button variant="primary">`, `<Chip pressed={on}>`,
    `<Card as="section">`, `<Packet tone="green" title>`, `<Callout tone title>`, `<TableCard>`,
    `<Columns min={15}>`, `<Steps ordered>`, `<Field id label hint>`, `<Dialog>` with `useFadeDialog()`.
  - A few class names have no styles and are kept as hooks for the tests or the whole-book page:
    `entry`, `headword`, `infobox`, `entry-body`, `bed-card`, `bed-row`, `yard-list`, `rotate-angle`, `scene-canvas`, `gear`,
    `zone-card`/`is-visible`, `page-fade`, `reveal-item`, `view`, `credit`.
- **Look: "Ocean, Tobacco, Bone, Navy and Olive"**: frosted see-through panels over a bone page (a dark green page in
  dark mode) with a tobacco glow and an ocean glow. Text is ocean (bone in dark), selected things are tobacco,
  olive marks plants, navy marks water and the focus ring, and gold marks harvest and the 3D selection. Every text and fill pair meets 4.5:1 (3:1 for borders and icons) in both themes. Cards,
  month tiles, the infobox, the sidebar and the masthead are glass (`bg-panel` plus `backdrop-blur-glass`);
  windows and menus are solid (`bg-panel-solid`), because glass inside glass can't blur. Selected things
  (pressed chips, the chosen month, the current page) are filled with the accent (`bg-accent text-on-accent`).
  Print is plain white paper.
- **Design tokens (`frontend/styles/theme.css`)**: every color, size, radius, shadow and timing, each written
  once as `light-dark(LIGHT, DARK)`. The theme switch sets `<html data-theme>`, which pins one side.
- **CSS (`frontend/styles/globals.css`)**: only what's truly global: Tailwind setup, base styles and print.
  - Tailwind names for the tokens (in its `@theme inline` block).
    Tailwind is wired to them, so `bg-panel`, `text-fg`, `text-muted`, `border-line`, `bg-green-soft`,
    `bg-mast`, `text-mast-accent`, `rounded-md`, `shadow-card`, `min-h-tap` and `font-display` match the
    site in both themes, and `dark:` follows the site's theme switch.
  - Base styles for plain elements (body text, headings, links, buttons, form fields) stay in CSS on
    purpose: they apply everywhere without a class.
  - Spacing: Tailwind's `p-1` to `p-4` equal the site's `--s-1` to `--s-4`. Above that: `--s-5` is
    `6` (1.5rem), `--s-6` is `8`, `--s-7` is `12`, `--s-8` is `16`.
  - Text sizes (`text-sm`, `text-lg`…) don't change line height here; add `leading-…` when you want to.
  - Tailwind's base reset (preflight) is left out: the base styles in globals.css set up plain elements instead.
  - Hover effects and button presses ease in and out over 300ms. Tailwind's `transition` and
    `transition-colors` use that timing by default, so a hover class plus `transition-colors` is all a new
    element needs.
  - The first page of a visit fades in over 500ms with a CSS keyframe on `<main>` (`animate-page-in`), so
    it starts with the first paint; a GSAP fade would wait for the scripts and flash the page first.
- **GSAP**: anything that moves on its own. That covers the 500ms page fade between pages
  (`app/template.tsx`; the first page uses the CSS fade above), the Tools menu (`frontend/components/sidebar/ToolsMenu.tsx`), the window fades (`frontend/lib/useFadeDialog.ts`), list items fading up as they
  scroll into view (`frontend/components/Reveal.tsx`) and the planner camera gliding between views
  (`frontend/planner/blenderNav.ts`). Shared timing lives in `frontend/lib/motion.ts`. Every animation
  is skipped when the reader's system asks for reduced motion, and everything shows when printing.
- **three.js**: the 3D garden planner (`frontend/planner/GardenScene.tsx`, `houseModel.ts`).

## TypeScript

The whole project is TypeScript in strict mode: `.ts` for logic, `.tsx` for anything that renders.

- **Shared shapes live next to the data they describe.** A crop is `Crop` (from the Zod schema in
  `shared/crop.ts`), and a garden plan is `Garden`, `Bed` and `Obstacle` (from the schema in
  `frontend/planner/model.ts`). An API answer the browser reads has one type used by both sides
  (`shared/account.ts`, and `LookupResult` in `backend/plants/service.ts`). Where a Zod schema exists,
  the type comes from it with `z.infer`, so the check that runs on real data and the type can't disagree.
- **API calls name what they expect back:** `api<{ items: … }>("/api/saved/")`.
- **Services take their dependencies as interfaces** (`AccountStore`, `PlantLibrary`, `SavedStore`,
  `StripeLike`), so the unit tests pass small in-memory fakes with the same methods.
- **Test helpers:** `frontend/planner/__tests__/fixtures.ts` builds a full bed, shade source or garden
  from just the fields a test cares about.
- **What stays JavaScript:** the config files ESLint and PostCSS load (`eslint.config.mjs`,
  `postcss.config.mjs`) and the two Node scripts in `scripts/`, so they run with plain `node`.
  `fetch-photos.mjs` is still type-checked through `// @ts-check` and JSDoc comments;
  `build-us-map.mjs` isn't, because it runs from a scratch folder with packages this project doesn't install.
- **`tsconfig.json` is partly managed by Next.js,** which reformats it and adds its own `include`
  entries on every build. Edit it if you need to, but expect Next.js to reformat it.

## Running it

```bash
npm install
npm run photos   # optional: downloads free-license photos from Wikimedia Commons
npm run dev      # http://localhost:3000
```

The book, calendar, encyclopedia and planner work with no setup. Accounts, the shared library, plant research and billing need the services below; without them those features say they aren't set up.

### Settings

Copy `.env.example` to `.env.local` for local development, and add the same names in Vercel under **Settings → Environment Variables**. Secrets (`FIREBASE_PRIVATE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_*`) must never get a `NEXT_PUBLIC_` prefix.

**Firebase** (sign-in and database)
1. Create a project at console.firebase.google.com.
2. **Authentication → Sign-in method:** enable Google and Email/Password. Under **Settings → Authorized domains**, add your Vercel domain.
3. **Firestore:** create a database, then paste `firestore.rules` into **Rules** and publish. The rules block all browser access; only the server reads and writes.
4. **Project settings → Your apps:** add a Web app and copy its config into the `NEXT_PUBLIC_FIREBASE_*` settings.
5. **Project settings → Service accounts:** generate a private key and copy it into the `FIREBASE_*` server settings.

**Claude:** create an API key at console.anthropic.com and set `ANTHROPIC_API_KEY`. Each new plant costs a few cents: tokens plus up to 5 web searches.

**Stripe** (the $3/month Garden plan)
1. Create a product with a recurring price of $3.00/month and set `STRIPE_PRICE_ID`.
2. Set `STRIPE_SECRET_KEY`, and set `APP_URL` to the site's address.
3. Add a webhook endpoint at `https://<your-domain>/api/billing/webhook/`. Keep the trailing slash: the site redirects paths without it, and Stripe doesn't follow redirects. Send `checkout.session.completed` and `customer.subscription.created`, `.updated` and `.deleted`. Set `STRIPE_WEBHOOK_SECRET` from the endpoint's signing secret.
4. Turn on the customer portal (Settings → Billing → Customer portal) so subscribers can change cards and cancel.

Use test keys while trying it out; locally, `stripe listen --forward-to localhost:3000/api/billing/webhook/` forwards webhooks.

## Checking your work

```bash
npm run typecheck                         # TypeScript, strict mode (next build runs this too)
npm run lint                              # ESLint
npm test                                  # unit tests: zones, catalog, sun and shade math, bed analysis, backend rules
npx playwright install chromium webkit    # first time only
npm run test:e2e                          # builds the offline site, then tests it in desktop Chrome and phone Safari
```

## Builds and deploying

- **Online (Vercel):** pushing to `main` deploys. `vercel.json` pins the Next.js framework and sets the security headers. Pages are static; the `/api/*` routes run as serverless functions.
- **Offline:** `npm run offline` builds a static site into `/out` (with `STATIC_EXPORT=1`) and serves it at http://localhost:3000. Files ending in `.api.ts` are left out of that build, so the offline copy has no server code. Accounts and research then say they need the online version, and everything else works.

## Decisions

- **Two folders, one app.** `frontend/` and `backend/` keep UI and server code apart, but it's still one Next.js app and one Vercel deploy. Next.js requires the `app/` folder, so it holds only thin route files.
- **Cheapest source first.** Plant lookups check the built-in catalog, then the shared library, and only then run Claude, so popular plants cost nothing. Free accounts get 5 new plants a month (`FREE_LOOKUPS_PER_MONTH`), and the Garden plan is unlimited.
- **Claude research:** Claude Opus 5.5 with the web search tool, at most 5 searches and medium effort, and output constrained to a JSON schema. The result is validated against the same Zod schema the app uses. Source links are kept only if they came back from the searches. The server-side refusal fallback is on, so a declined request is retried on another model instead of failing.
- **Quota is counted before research and refunded on failure,** inside a Firestore transaction, so two tabs can't overspend it.
- **Stripe is the source of truth for subscriptions.** Webhooks are signature-checked and each event is applied once.
- **Accounts store no personal data in Firestore.** Firebase Authentication holds email and name; deleting an account cancels billing and removes both.
- **Zones and frost dates:** average last spring and first fall frost per USDA zone (`shared/zones.ts`). The month calendar, written for 8a, shifts by the difference. Crop records store planting windows as weeks from frost, so one record works in every zone. Dates are least precise in zones 1–4 and 10–13, and the app says so there.
- **Sun math** uses NOAA's solar-position equations (`frontend/planner/sun.ts`). The sun-hours map casts a ray toward the sun from each cell of a grid over the yard, every 15 minutes from sunrise to sunset, against the house, sheds, hedges, fences and tree canopies.
- **three.js** draws the yard, and loads only on the planner page. It renders on demand, not in a loop, and follows the light and dark theme. Every action in the 3D view can also be done from the panel, for keyboard and screen-reader users.
- **Fonts and photos are local** (no Google Fonts or image CDNs). The only outside services are the ones you set up: Firebase, Anthropic and Stripe.
- **Design tokens** in `frontend/styles/theme.css`, each color written once with `light-dark()`, and the rest of the styles in `frontend/styles/globals.css`, in cascade layers. The theme switch applies before first paint.
- **The bee, chicken and fish guides** are trusted, author-written HTML in `frontend/data/animals.ts`, rendered with `dangerouslySetInnerHTML`. Their laws and seasons are for Georgia, and each guide says so.
- **The CSP allows `'unsafe-inline'` scripts,** because the static export inlines hydration scripts, plus Firebase's sign-in hosts. Security headers live in `vercel.json` (online) and `public/serve.json` (offline); change both together.
