import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@/frontend/styles/globals.css";

import Link from "next/link";
import Sidebar from "@/frontend/components/sidebar/Sidebar";
import PrintButtons from "@/frontend/components/PrintButtons";
import RouteFocus from "@/frontend/components/RouteFocus";
import ThemeToggle from "@/frontend/components/ThemeToggle";
import LocationPicker from "@/frontend/components/LocationPicker";
import SavedDataSync from "@/frontend/account/SavedDataSync";
import Tour from "@/frontend/components/Tour";
import { THEME_SCRIPT } from "@/frontend/lib/theme";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "En Gedi's Harvest", template: "%s · En Gedi's Harvest" },
  description:
    "A month-by-month homestead guide for any North American hardiness zone: garden calendar, plant encyclopedia, 3D garden planner, plant doctor, recipes, water, remedies, bees, chickens and fish.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches the page color (--bg in theme.css) so the phone's browser bar blends into the masthead.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ebe2d1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1411" },
  ],
};

// The masthead's classes, grouped by job.
const MASTHEAD = [
  // Frosted glass: see-through panel, blurred page glows behind it, a hairline underneath.
  "relative border-b border-line bg-mast backdrop-blur-glass",
  // Room for the phone's notch, and the masthead's text color.
  "pt-[env(safe-area-inset-top,0px)] text-mast-fg",
  // Print: plain black text on the paper.
  "print:border-0 print:bg-transparent print:text-black",
].join(" ");

// The page content's classes, grouped by job.
const MAIN = [
  // The centered column, with room above and below. No focus ring: it only takes focus from the skip link.
  "wrap pt-8 pb-16 focus:outline-none md:pt-12 md:pb-20 print:py-0",
  // The first page of a visit fades in over 500ms; not for readers who prefer reduced motion, or on paper.
  "animate-page-in motion-reduce:animate-none print:animate-none",
].join(" ");

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The inline script sets data-theme before React hydrates, so the attribute is expected to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Phones: room at the bottom for the menu bar. Wider screens: room on the left for the sidebar. */}
      <body className="pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:ps-[5.75rem] md:pb-0 print:p-0">
        {/* Hidden above the page until it gets keyboard focus. */}
        <a
          className="absolute start-4 top-3 z-30 -translate-y-[200%] rounded-md bg-fg px-4 py-3 font-bold text-bg no-underline shadow-raised focus:translate-y-0"
          href="#main"
        >
          Skip to content
        </a>

        {/* Masthead: a frosted band at the top. Prints as plain black text. */}
        <header className={MASTHEAD}>
          <div className="wrap flex flex-wrap items-end justify-between gap-x-8 gap-y-4 py-6 md:py-8">
            <div className="grid gap-2">
              <LocationPicker />
              <h1 className="text-3xl leading-[1.02] font-extrabold tracking-[-0.025em] text-mast-fg print:text-black">
                <Link href="/" className="text-inherit no-underline">
                  En Gedi&apos;s <span className="text-mast-accent print:text-black">Harvest</span>
                </Link>
              </h1>
              <p className="text-sm text-mast-muted print:text-black">Garden, kitchen, bees, chickens, fish and water, month by month, for your zone.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 print:hidden">
              <PrintButtons />
            </div>
          </div>
        </header>
        {/* Right after the masthead so it reads after the brand; its classes pin it to the top-right corner.
            It sits outside <header> because the header's blur (backdrop-filter) would trap its
            position: fixed inside the header instead of the window. */}
        <ThemeToggle />
        <Sidebar />
        {/* <main> stays put across page changes, so its fade (animate-page-in, CSS) only plays on the first
            page of a visit; later pages fade in with GSAP in app/template.tsx. */}
        <main className={MAIN} id="main" tabIndex={-1}>
          {children}
        </main>
        <RouteFocus />
        <SavedDataSync />
        <Tour />
        <footer className="border-t border-line bg-surface pt-6 pb-[max(2rem,env(safe-area-inset-bottom,0px))] text-sm text-muted print:bg-transparent">
          <div className="wrap">
            Planting dates are averages for your hardiness zone; your local frost dates can differ by a few weeks. Rules and recommendations
            change: check your city or county, your state or provincial agencies, and your local extension service before acting on anything
            legal or medical. Photos are from Wikimedia Commons under free licenses; see Photo credits.
          </div>
        </footer>
      </body>
    </html>
  );
}
