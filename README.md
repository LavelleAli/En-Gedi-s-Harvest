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

1. The planner opens with a sample yard: a house, an oak and two beds. Set the **yard size** and which way **the top of the plan faces** in the panel on the right.
2. Add beds with **+ Raised bed** or **+ In-ground bed**, and shade sources (house, shed, tree, hedge, fence) from **+ Shade source…**.
3. Click an item in the 3D view (or its name in the panel) to select it. Drag it to move it, or focus the view and use the arrow keys (Shift moves 5 ft, Delete removes it). Edit sizes, heights and names in the panel.
4. Pick crops for a bed from **Add a crop**. The list is grouped into crops to plant this month in your zone, crops that grow in your zone, and the rest.
5. Pick a **date** (or an equinox or solstice) and slide the **time** to watch shadows move. **Sun-hours map** colors the yard by hours of direct sun that day.

The **garden report** below gives the day's sunrise, sunset and sun angle, and a weekly watering schedule in gallons. For each bed it reports:

- its light (full sun to shade) and how many plants fit
- whether each crop gets enough sun
- when and how to plant each crop in your zone
- companion pairs and conflicts, including with beds closer than 3 ft
- how much and how often to water

### 4. Adding a crop that isn't listed

In a bed's panel, choose **Add a crop that isn't listed…** and type a name. The app looks in this order:

1. **The stock list** of 57 plants. Free.
2. **The shared library** of every plant anyone has researched. Free, no account needed.
3. **Research with Claude.** Needs a free account. Claude searches extension services and seed companies and writes a growing guide for your zone, with links to its sources. The result joins the shared library for everyone. Free accounts get 5 a month; the **Garden plan** ($3/month) is unlimited. A lookup only counts when new research runs, and failed lookups are refunded.

You can always **enter a plant by hand** instead. That works offline and needs no account.

### 5. Plant encyclopedia

Every plant A to Z, with a letter index. Each entry has a facts box (family, type, hardiness, sun, water, soil, spacing, days to harvest, planting dates for your zone) and sections on growing, what a healthy plant looks like, problems (linked to the plant doctor) and companions. Filter by type or by **Grows in my zone**, search across everything, and star the plants you grow.

### 6. Accounts

**Sign in** (top right) with Google or an email and password. The account page shows your plan and this month's lookups, and lets you upgrade, manage billing in Stripe's portal, sign out, or delete your account. Reading the book and using the planner never need an account.

**Sync across devices.** While you're signed in, your starred plants, gear checklists, monthly to-dos and garden plan follow you to your other devices. Your location and light/dark choice stay on each device. Changes are sent about a second after you make them, and another device picks them up when you switch back to its tab. Deleting your account deletes the synced copies too.

How it works in the code: `frontend/account/SavedDataSync.js` watches each store's change event and calls `/api/saved/`; `backend/saved/service.js` decides what's allowed (five keys, about 200 KB each, newest save wins); `backend/saved/store.js` keeps it in Firestore at `savedData/{uid}/items/{key}`; `frontend/account/sync.js` settles conflicts when two devices disagree. The list of what syncs is in `shared/saved-data.js`.

### 7. Sidebar and shop

The **sidebar** (left on wider screens, along the bottom on phones) has **Account**, **Profile**, **Tools** and **Shop**. **Tools** opens a window listing every page of the book; it fades in and out over half a second. **Profile** shows your garden location and what you've saved, and whether it syncs. **Shop** lists the gear the guides call for (beekeeping, water filtration, garden supplies). The items are placeholders for now, with no prices or checkout; they're in `frontend/data/shop.js`, and their photos download with `npm run photos`.

### Other sections

**Calendar** is the whole year for your zone in one table. **Plant doctor** puts healthy and problem plants side by side. **Recipes** and **Pantry** cover cooking. **Water** and **Remedies** cover safe water and home care. **Bees**, **Chickens** and **Fish** are full guides with gear checklists; their rules are written for Georgia, and each says so. **Whole book** puts everything on one page for printing.

## Layout

Every page shares the same frame:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ four-color stripe ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │
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
┌────────────────────────────────────────────────────────────────────────┐
│ [+ Raised bed] [+ In-ground bed] [+ Shade source…] [3D|Top] [Sun map]  │
│ Date [2026-11-11] (Spring equinox)(Summer solstice)…   Time ●───────── │
├──────────────────────────────────────────────┬─────────────────────────┤
│                                              │ Panel                   │
│   three.js yard: beds, plants, house,        │  Yard: size, facing,    │
│   trees, fences; real shadows; sun path;     │  list of items          │
│   compass; optional sun-hours heat map       │  — or —                 │
│                                              │  Bed: name, type, size, │
│                                              │  crops, [Add a crop…]   │
├──────────────────────────────────────────────┴─────────────────────────┤
│ Garden report                                                          │
│ ┌ Sun on Nov 11 ──────────┐ ┌ Watering schedule: Mon … Sun, gallons ┐  │
│ ┌ Raised bed 1 · Full sun 10.5 h ┐ ┌ Kitchen plot · Part sun 5.2 h ┐    │
│ │ crops, fit, planting steps,    │ │ …                              │    │
│ │ companions, watering           │ │                                │    │
└────────────────────────────────────────────────────────────────────────┘
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
app/                 Next.js routes only: each page.js renders a component from frontend/,
│                    each api/**/route.api.js re-exports a handler from backend/
├─ layout.js         masthead, tabs, footer, theme script
├─ planner/ account/ plants/ calendar/ …     one folder per page
└─ api/              plants, plants/research, account, billing/{checkout,portal,webhook}
frontend/            everything that runs in the browser
├─ sections/         each page's content (also reused by /book/)
├─ planner/          PlannerApp, GardenScene (three.js), Editors, Report, AddCropDialog,
│                    and pure logic: sun.js (solar position), shade.js (sun-hours map),
│                    analysis.js (companions, planting notes, watering), model.js (saved plan)
├─ account/          Firebase sign-in (auth.js), API client (api.js), AccountPage
├─ components/       shared UI: Sidebar, Nav (the Tools window), LocationPicker, ZoneMap, ThemeToggle, Photo, …
├─ lib/              browser state (location, theme, monthly checklist) and motion.js (GSAP settings)
├─ data/             the book's content: calendar, plants, recipes, guides, photos
└─ styles/           globals.css (design tokens, light and dark themes, Tailwind setup)
backend/             everything that runs on the server (Vercel functions)
├─ handlers/         route handlers and the services they use (deps.js)
├─ plants/           service.js (lookup rules), research.js (Claude), library.js (Firestore)
├─ accounts/         repository.js (plans, monthly quota, Stripe event log)
├─ billing/          service.js (Checkout, portal, webhooks)
├─ config.js         environment variables, validated with Zod
├─ http.js           problem-details errors, request IDs, logs, rate limiting
└─ firebase.js       Firebase Admin: token checks and Firestore
shared/              used by both sides
├─ zones.js          USDA zones and frost dates
├─ crop.js           the crop record schema (Zod) and name matching
├─ catalog.js        the 57-plant stock catalog
└─ planting.js       planting windows and zone suggestions
tests/               Playwright end-to-end tests (desktop Chrome, phone Safari)
**/__tests__/        Vitest unit tests (shared, planner math, backend rules)
```

Saved in the browser (localStorage): location (`fhb-location`), theme, checklist ticks, starred plants, gear checklists, garden plan (`fhb-garden`) and added crops (`fhb-crops`). Saved on the server (Firestore): the shared plant library (`plants/{id}`), account plan and monthly lookups (`users/{uid}`, no email or name), and handled Stripe events (`stripeEvents/{id}`).

## Styling and animation

Each tool does the job it's best at:

- **CSS (`frontend/styles/globals.css`)**: the design tokens (colors, spacing, type, light and dark themes)
  and the existing component styles. Hover effects stay in CSS: every one eases in and out over 300ms
  (`--hover`, `--ease-in-out`), because a CSS transition does that with no JavaScript.
- **Tailwind CSS v4**: utility classes for new and updated UI. It's wired to the same tokens, so
  `bg-panel`, `text-fg`, `text-muted`, `border-line`, `bg-green-soft`, `rounded-md`, `shadow-card` and
  `font-display` match the rest of the site in both themes, and `dark:` follows the site's theme switch.
  Tailwind's base reset (preflight) is left out so the older styles keep working. The app moves over a
  piece at a time, whenever that piece is being changed anyway. Done so far: the 3D view's overlay
  (`frontend/planner/ViewControls.js`).
- **GSAP**: anything that moves on its own. That covers the 500ms page fade between pages
  (`app/template.js`), the window fades (`frontend/lib/useFadeDialog.js`), list items fading up as they
  scroll into view (`frontend/components/Reveal.js`) and the planner camera gliding between views
  (`frontend/planner/blenderNav.js`). Shared timing lives in `frontend/lib/motion.js`. Every animation
  is skipped when the reader's system asks for reduced motion, and everything shows when printing.
- **three.js**: the 3D garden planner (`frontend/planner/GardenScene.js`, `houseModel.js`).

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
npm run lint                              # ESLint
npx vitest run                            # unit tests: zones, catalog, sun and shade math, bed analysis, backend rules
npx playwright install chromium webkit    # first time only
npm run test:e2e                          # builds the offline site, then tests it in desktop Chrome and phone Safari
```

## Builds and deploying

- **Online (Vercel):** pushing to `main` deploys. `vercel.json` pins the Next.js framework and sets the security headers. Pages are static; the `/api/*` routes run as serverless functions.
- **Offline:** `npm run offline` builds a static site into `/out` (with `STATIC_EXPORT=1`) and serves it at http://localhost:3000. Files ending in `.api.js` are left out of that build, so the offline copy has no server code. Accounts and research then say they need the online version, and everything else works.

## Decisions

- **Two folders, one app.** `frontend/` and `backend/` keep UI and server code apart, but it's still one Next.js app and one Vercel deploy. Next.js requires the `app/` folder, so it holds only thin route files.
- **Cheapest source first.** Plant lookups check the built-in catalog, then the shared library, and only then run Claude, so popular plants cost nothing. Free accounts get 5 new plants a month (`FREE_LOOKUPS_PER_MONTH`), and the Garden plan is unlimited.
- **Claude research:** Claude Opus 5.5 with the web search tool, at most 5 searches and medium effort, and output constrained to a JSON schema. The result is validated against the same Zod schema the app uses. Source links are kept only if they came back from the searches. The server-side refusal fallback is on, so a declined request is retried on another model instead of failing.
- **Quota is counted before research and refunded on failure,** inside a Firestore transaction, so two tabs can't overspend it.
- **Stripe is the source of truth for subscriptions.** Webhooks are signature-checked and each event is applied once.
- **Accounts store no personal data in Firestore.** Firebase Authentication holds email and name; deleting an account cancels billing and removes both.
- **Zones and frost dates:** average last spring and first fall frost per USDA zone (`shared/zones.js`). The month calendar, written for 8a, shifts by the difference. Crop records store planting windows as weeks from frost, so one record works in every zone. Dates are least precise in zones 1–4 and 10–13, and the app says so there.
- **Sun math** uses NOAA's solar-position equations (`frontend/planner/sun.js`). The sun-hours map casts a ray toward the sun from each cell of a grid over the yard, every 15 minutes from sunrise to sunset, against the house, sheds, hedges, fences and tree canopies.
- **three.js** draws the yard, and loads only on the planner page. It renders on demand, not in a loop, and follows the light and dark theme. Every action in the 3D view can also be done from the panel, for keyboard and screen-reader users.
- **Fonts and photos are local** (no Google Fonts or image CDNs). The only outside services are the ones you set up: Firebase, Anthropic and Stripe.
- **Plain CSS with design tokens** in `frontend/styles/globals.css`, in cascade layers, with light and dark themes from the same tokens. The theme switch applies before first paint. The dark token block appears twice (OS dark and saved dark), so edit both.
- **The bee, chicken and fish guides** are trusted, author-written HTML in `frontend/data/animals.js`, rendered with `dangerouslySetInnerHTML`. Their laws and seasons are for Georgia, and each guide says so.
- **The CSP allows `'unsafe-inline'` scripts,** because the static export inlines hydration scripts, plus Firebase's sign-in hosts. Security headers live in `vercel.json` (online) and `public/serve.json` (offline); change both together.
