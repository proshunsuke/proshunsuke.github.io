import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4175",
    colorScheme: "light",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testMatch: "**/smoke.spec.ts", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testMatch: "**/smoke.spec.ts", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "node scripts/serve-test-build.mjs",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
  },
});
