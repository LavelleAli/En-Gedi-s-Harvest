import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

import Link from "next/link";
import Nav from "@/components/Nav";
import PrintButtons from "@/components/PrintButtons";
import RouteFocus from "@/components/RouteFocus";
import ThemeToggle from "@/components/ThemeToggle";
import { THEME_SCRIPT } from "@/lib/theme";

export const metadata = {
  title: { default: "Fulton Homestead Book", template: "%s · Fulton Homestead Book" },
  description:
    "Month-by-month homestead guide for Fulton County, Georgia: garden calendar, plant index, plant doctor, recipes, water, remedies, bees, chickens and fish.",
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

export default function RootLayout({ children }) {
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
              <div className="kicker">Zone 8a · Piedmont red clay · Fulton County, GA</div>
              <h1>
                <Link href="/">
                  Fulton <span>Homestead</span> Book
                </Link>
              </h1>
              <p>Garden, kitchen, bees, chickens, fish and water, month by month.</p>
            </div>
            <div className="mast-actions">
              <ThemeToggle />
              <PrintButtons />
            </div>
          </div>
        </header>
        <Nav />
        <main className="wrap" id="main" tabIndex={-1}>
          {children}
        </main>
        <RouteFocus />
        <footer>
          <div className="wrap">
            Written for zone 8a, Fulton County, Georgia. Rules and recommendations change: check your city, Georgia DNR and UGA
            Extension before acting on anything legal or medical. Photos are from Wikimedia Commons under free licenses; see Photo credits.
          </div>
        </footer>
      </body>
    </html>
  );
}
