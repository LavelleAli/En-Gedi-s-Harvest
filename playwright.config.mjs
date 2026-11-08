import { defineConfig, devices } from "@playwright/test";

// Runs against the static build in /out. First time: `npx playwright install chromium webkit`.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: "http://localhost:4321" },
  webServer: { command: "npx serve out -l 4321", url: "http://localhost:4321", reuseExistingServer: true },
  projects: [
    {
      name: "desktop-chrome",
      // CHROME_PATH lets you test with an installed Chrome instead of Playwright's download.
      use: { ...devices["Desktop Chrome"], launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {} },
    },
    { name: "phone-safari", use: { ...devices["iPhone 13"] } },
  ],
});
