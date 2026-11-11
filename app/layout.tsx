import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@/frontend/styles/globals.css";

import Link from "next/link";
import Sidebar from "@/frontend/components/Sidebar";
import PrintButtons from "@/frontend/components/PrintButtons";
import RouteFocus from "@/frontend/components/RouteFocus";
import ThemeToggle from "@/frontend/components/ThemeToggle";
import LocationPicker from "@/frontend/components/LocationPicker";
import SavedDataSync from "@/frontend/account/SavedDataSync";
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
  // Matches the masthead (--mast-bg) so the phone's browser bar blends into it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d3125" },
    { media: "(prefers-color-scheme: dark)", color: "#16201a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The inline script sets data-theme before React hydrates, so the attribute is expected to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="mast">
          <div className="stripe" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="wrap">
            <div className="brand">
              <LocationPicker />
              <h1>
                <Link href="/">
                  En Gedi&apos;s <span>Harvest</span>
                </Link>
              </h1>
              <p>Garden, kitchen, bees, chickens, fish and water, month by month, for your zone.</p>
            </div>
            <div className="mast-actions">
              <PrintButtons />
            </div>
          </div>
          {/* Last in the masthead so it reads after the brand; CSS pins it to the top-right corner. */}
          <ThemeToggle />
        </header>
        <Sidebar />
        <main className="wrap" id="main" tabIndex={-1}>
          {children}
        </main>
        <RouteFocus />
        <SavedDataSync />
        <footer>
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
