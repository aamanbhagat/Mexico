// Quick one-off screenshot helper: node scripts/shot.mjs <url> <out.png> [width] [height] [theme] [fullPage]
import { chromium } from '@playwright/test';
const [url, out, w = '390', h = '844', theme = 'light', full = '1'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
  colorScheme: theme === 'dark' ? 'dark' : 'light',
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
