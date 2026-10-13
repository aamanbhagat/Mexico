// Captures every live page at 390 px and 1440 px, light and dark, into docs/screenshots/
// so the owner can review the design without running the app.
//   npm run build && npm run screenshots   (starts `astro preview` itself if needed)
// Each page gets an above-the-fold shot and a full-page shot (sticky mobile bar hidden there,
// since a fixed element would otherwise be painted mid-page).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4321';
const OUT = 'docs/screenshots';
const pages = [
  { path: '/es-mx/', slug: 'inicio', query: '' },
  { path: '/es-mx/calculadora-aguinaldo/', slug: 'aguinaldo', query: '?s=15000' },
  { path: '/es-mx/calculadora-finiquito/', slug: 'finiquito', query: '?s=15000&i=2023-03-01&f=2026-10-15' },
  { path: '/es-mx/calculadora-liquidacion/', slug: 'liquidacion', query: '?s=15000&i=2021-10-16&f=2026-10-15&v=1' },
  { path: '/es-mx/calculadora-prima-vacacional/', slug: 'prima-vacacional', query: '?s=15000&i=2022-05-02' },
  { path: '/es-mx/calculadora-vacaciones/', slug: 'vacaciones', query: '?s=15000&i=2019-03-04' },
  { path: '/es-mx/uma-salario-minimo-2026/', slug: 'uma-salario-minimo', query: '' },
];
const widths = [
  { w: 390, h: 844 },
  { w: 1440, h: 900 },
];

async function up() {
  try {
    return (await fetch(`${BASE}/es-mx/`)).ok;
  } catch {
    return false;
  }
}

let server;
if (!(await up())) {
  server = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await up()); i += 1) await new Promise((r) => setTimeout(r, 500));
}

const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--lang=es-MX'] });
let count = 0;
for (const p of pages) {
  mkdirSync(`${OUT}/${p.slug}`, { recursive: true });
  for (const { w, h } of widths) {
    for (const scheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: 1,
        colorScheme: scheme,
        reducedMotion: 'reduce',
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        isMobile: w < 600,
        hasTouch: w < 600,
      });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date('2026-10-13T12:00:00-06:00'));
      await page.goto(`${BASE}${p.path}${p.query}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${OUT}/${p.slug}/${w}-${scheme}.png` });
      await page.evaluate(() => document.querySelectorAll('.result-bar').forEach((el) => el.style.setProperty('display', 'none')));
      await page.screenshot({ path: `${OUT}/${p.slug}/${w}-${scheme}-full.jpg`, fullPage: true, type: 'jpeg', quality: 60 });
      await context.close();
      count += 2;
    }
  }
}
await browser.close();
server?.kill();
console.log(`screenshots: ${count} files in ${OUT}/`);
