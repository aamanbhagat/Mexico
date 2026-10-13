// Captures every live page at 390 px and 1440 px, light and dark, into docs/screenshots/
// so the owner can review the design without running the app.
//   npm run build && npm run screenshots          (starts `astro preview` itself if needed)
//   npm run screenshots -- br-01                  (only pages whose folder starts with br-01)
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
  // BR-01 (pt-BR land units)
  { path: '/pt-br/', slug: 'br-01/inicio', query: '', lang: 'pt-BR' },
  {
    path: '/pt-br/conversor-alqueire-hectare/',
    slug: 'br-01/conversor-alqueire-hectare',
    query: '?q=3&uf=BA&de=alqueire-baiano&pr=500000',
    lang: 'pt-BR',
  },
  { path: '/pt-br/conversor-alqueire-hectare/alqueire-paulista/', slug: 'br-01/alqueire-paulista', query: '?q=3', lang: 'pt-BR' },
  {
    path: '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/',
    slug: 'br-01/alqueire-mineiro-goiano',
    query: '?q=10&uf=MG',
    lang: 'pt-BR',
  },
  { path: '/pt-br/conversor-alqueire-hectare/alqueire-baiano/', slug: 'br-01/alqueire-baiano', query: '', lang: 'pt-BR' },
  { path: '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/', slug: 'br-01/alqueire-do-norte', query: '?q=5&uf=PA', lang: 'pt-BR' },
  {
    path: '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/',
    slug: 'br-01/tarefa-em-hectare',
    query: '?q=10&uf=SE&de=tarefa-al-se',
    lang: 'pt-BR',
  },
  { path: '/pt-br/conversor-alqueire-hectare/litro-de-terra/', slug: 'br-01/litro-de-terra', query: '?q=12', lang: 'pt-BR' },
  { path: '/pt-br/hectare-para-alqueire/', slug: 'br-01/hectare-para-alqueire', query: '?q=50&uf=MT&pr=30000', lang: 'pt-BR' },
].filter((p) => !process.argv[2] || p.slug.startsWith(process.argv[2]));
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
  // Run Astro directly in the foreground (`--ignore-lock`, see playwright.config.ts) so that
  // server.kill() below really stops it.
  server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', '4321', '--ignore-lock'], {
    stdio: 'ignore',
  });
  for (let i = 0; i < 60 && !(await up()); i += 1) await new Promise((r) => setTimeout(r, 500));
}

const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--lang=es-MX'] });
// Each context sets its own locale; --lang only sets the default for native controls.
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
        locale: p.lang ?? 'es-MX',
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
