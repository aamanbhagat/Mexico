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

export default defineConfig({
  testDir: 'tests/e2e',
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
    baseURL: 'http://localhost:4321',
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
    command: 'npx astro preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321/es-mx/',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
