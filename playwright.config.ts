import { defineConfig, devices } from "@playwright/test";

// Cross-engine checks in Playwright's Firefox and WebKit. Chrome is covered by the verify harness
// (.agents/skills/verify-odd-design/scripts/ctl.ts), which drives the installed Chrome.
// Run with `bun run test:browsers`; Playwright itself runs on Node.
const PORT = 6107;

export default defineConfig({
  testDir: "e2e",
  outputDir: ".verify/playwright/results",
  reporter: [["list"], ["html", { outputFolder: ".verify/playwright/report", open: "never" }]],
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 900 } } },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 900 } } },
  ],
  // A fresh static build of Storybook, served as files. The dev server reloads pages while it
  // prepares code on first use, which interrupts tests mid-step.
  webServer: {
    command: `bunx storybook build --quiet --disable-telemetry -o .verify/playwright/storybook && bun e2e/serve.ts .verify/playwright/storybook ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.json`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
