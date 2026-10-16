import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E, accessibility (axe) and visual tests against the production build served by
 * `astro preview`. In this container Chromium is pre-installed at /opt/pw-browsers; in CI
 * Playwright's own browser is installed by the workflow.
 */
const preinstalled = process.env['CHROMIUM_PATH'] ?? '/opt/pw-browsers/chromium';
const executablePath = existsSync(preinstalled) ? preinstalled : undefined;
// --lang makes native controls (date inputs) render in es-MX, like a Mexican visitor's browser.
const launchOptions = { ...(executablePath ? { executablePath } : {}), args: ['--lang=es-MX'] };
const previewPort = Number(process.env['PLAYWRIGHT_PORT'] ?? '4329');
if (!Number.isInteger(previewPort) || previewPort < 1 || previewPort > 65535) {
  throw new Error('PLAYWRIGHT_PORT must be an integer between 1 and 65535');
}
const previewOrigin = `http://localhost:${previewPort}`;

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: process.env['PLAYWRIGHT_OUTPUT_DIR'] || 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : 4,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: previewOrigin,
    trace: 'retain-on-failure',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
        launchOptions,
      },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions },
    },
  ],
  webServer: {
    // `--ignore-lock` keeps the server in the foreground: when Astro detects a coding agent it
    // otherwise detaches `astro preview` into a background daemon, and Playwright reads the exit of
    // the launcher as "webServer exited early".
    command: `npx astro preview --port ${previewPort} --ignore-lock`,
    port: previewPort,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
