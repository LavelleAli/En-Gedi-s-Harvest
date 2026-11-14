import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for shared logic, planner math and backend services (no browser, no network).
// End-to-end tests in tests/ run with Playwright instead.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { include: ["**/*.test.{ts,tsx}"], exclude: ["node_modules/**", ".next/**", "out/**"], environment: "node" },
});
