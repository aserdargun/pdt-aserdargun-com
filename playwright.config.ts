import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: "list",
  outputDir: join(tmpdir(), "pdt-playwright-results"),
  use: {
    baseURL: "http://127.0.0.1:4319",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4319 --strictPort",
    url: "http://127.0.0.1:4319",
    reuseExistingServer: false,
  },
});
