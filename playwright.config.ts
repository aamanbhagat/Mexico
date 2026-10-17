import { defineConfig, devices } from '@playwright/test';

// --lang makes native controls (date inputs) render in es-MX, like a Mexican visitor's browser.
const launchOptions = { args: ['--lang=es-MX'] };
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
    command: `node scripts/preview-static.mjs --port ${previewPort}`,
    port: previewPort,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
