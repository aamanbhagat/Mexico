// Captures pages at 390 px and 1440 px, light and dark, into docs/screenshots/ so the owner can
// review the design without running the app.
//   npm run build && npm run screenshots            (es-MX set → docs/screenshots/<page>/)
//   npm run build && npm run screenshots -- br-01   (BR-01 set → docs/screenshots/br-01/)
//   npm run build && npm run screenshots -- id-01   (ID-01 set → docs/screenshots/id-01/)
//   npm run build && npm run screenshots -- mx-03   (all UDI pages → docs/screenshots/mx-03/)
//   npm run build && npm run screenshots -- all     (every set)
// Template pages get an above-the-fold PNG and a full-page JPEG per variant; in the id-01 set every
// other page gets an above-the-fold JPEG per variant (same templates, different data).
// Starts `astro preview` itself if needed. The sticky mobile bar is hidden in full-page shots,
// since a fixed element would otherwise be painted mid-page.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4321';
const SET = process.argv[2] ?? 'es-mx';

const DINA = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const PASARAN = ['legi', 'pahing', 'pon', 'wage', 'kliwon'];
const BULAN = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
const udiArchive = JSON.parse(readFileSync(new URL('../public/data/mx/udis.json', import.meta.url), 'utf8'));
const udiSnapshotDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Mexico_City',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date(udiArchive.retrieved_at));
const udiYears = [...new Set(udiArchive.rates.filter(([day]) => day <= udiSnapshotDay).map(([day]) => day.slice(0, 4)))];

const SETS = {
  'es-mx': {
    out: 'docs/screenshots',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    now: '2026-10-13T12:00:00-06:00',
    pages: [
      { path: '/es-mx/', slug: 'inicio', query: '' },
      { path: '/es-mx/calculadora-aguinaldo/', slug: 'aguinaldo', query: '?s=15000' },
      { path: '/es-mx/calculadora-finiquito/', slug: 'finiquito', query: '?s=15000&i=2023-03-01&f=2026-10-15' },
      { path: '/es-mx/calculadora-liquidacion/', slug: 'liquidacion', query: '?s=15000&i=2021-10-16&f=2026-10-15&v=1' },
      { path: '/es-mx/calculadora-prima-vacacional/', slug: 'prima-vacacional', query: '?s=15000&i=2022-05-02' },
      { path: '/es-mx/calculadora-vacaciones/', slug: 'vacaciones', query: '?s=15000&i=2019-03-04' },
      { path: '/es-mx/uma-salario-minimo-2026/', slug: 'uma-salario-minimo', query: '' },
    ],
    rest: [],
  },
  'mx-03': {
    out: 'docs/screenshots/mx-03',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    now: udiArchive.retrieved_at,
    pages: [
      { path: '/es-mx/udis-a-pesos/', slug: 'udis-a-pesos', query: '' },
      { path: '/es-mx/pesos-a-udis/', slug: 'pesos-a-udis', query: '' },
      ...udiYears.map((year) => ({
        path: `/es-mx/udis-a-pesos/historico/${year}/`,
        slug: `udis-historico-${year}`,
        query: '',
      })),
    ],
    rest: [],
  },
  'br-01': {
    out: 'docs/screenshots/br-01',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    now: '2026-10-13T12:00:00-03:00',
    pages: [
      { path: '/pt-br/', slug: 'inicio', query: '' },
      { path: '/pt-br/conversor-alqueire-hectare/', slug: 'conversor-alqueire-hectare', query: '?q=3&uf=BA&de=alqueire-baiano&pr=500000' },
      { path: '/pt-br/conversor-alqueire-hectare/alqueire-paulista/', slug: 'alqueire-paulista', query: '?q=3' },
      { path: '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/', slug: 'alqueire-mineiro-goiano', query: '?q=10&uf=MG' },
      { path: '/pt-br/conversor-alqueire-hectare/alqueire-baiano/', slug: 'alqueire-baiano', query: '' },
      { path: '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/', slug: 'alqueire-do-norte', query: '?q=5&uf=PA' },
      { path: '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/', slug: 'tarefa-em-hectare', query: '?q=10&uf=SE&de=tarefa-al-se' },
      { path: '/pt-br/conversor-alqueire-hectare/litro-de-terra/', slug: 'litro-de-terra', query: '?q=12' },
      { path: '/pt-br/hectare-para-alqueire/', slug: 'hectare-para-alqueire', query: '?q=50&uf=MT&pr=30000' },
    ],
    rest: [],
  },
  'id-01': {
    out: 'docs/screenshots/id-01',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    now: '2026-10-13T12:00:00+07:00',
    pages: [
      { path: '/id/', slug: 'beranda', query: '' },
      { path: '/id/weton/', slug: 'weton', query: '?t=1945-08-17' },
      { path: '/id/weton/jodoh/', slug: 'jodoh', query: '?a=1990-05-17&b=1992-01-03' },
      { path: '/id/weton/hari-ini/', slug: 'hari-ini', query: '' },
      { path: '/id/weton/selasa-pon/', slug: 'weton-selasa-pon', query: '' },
      { path: '/id/weton/jumat-kliwon/', slug: 'weton-jumat-kliwon', query: '' },
      { path: '/id/kalender-jawa/2026/', slug: 'kalender-2026', query: '' },
      { path: '/id/kalender-jawa/2027/', slug: 'kalender-2027', query: '' },
      { path: '/id/kalender-jawa/2026/oktober/', slug: 'kalender-2026-oktober', query: '' },
      { path: '/id/kalender-jawa/2027/desember/', slug: 'kalender-2027-desember', query: '' },
    ],
    rest: [
      ...DINA.flatMap((d) => PASARAN.map((p) => `/id/weton/${d}-${p}/`)),
      ...[2026, 2027].flatMap((y) => BULAN.map((b) => `/id/kalender-jawa/${y}/${b}/`)),
    ],
  },
};

const names = SET === 'all' ? Object.keys(SETS) : [SET];
for (const name of names) {
  if (!SETS[name]) throw new Error(`Unknown screenshot set "${name}". Use one of: ${Object.keys(SETS).join(', ')}, all`);
}

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

let count = 0;
for (const name of names) {
  const set = SETS[name];
  const browser = await chromium.launch({ args: [`--lang=${set.locale}`] });

  async function open(w, h, scheme) {
    const context = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      colorScheme: scheme,
      reducedMotion: 'reduce',
      locale: set.locale,
      timezoneId: set.timezoneId,
      isMobile: w < 600,
      hasTouch: w < 600,
    });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date(set.now));
    return { context, page };
  }

  for (const p of set.pages) {
    mkdirSync(`${set.out}/${p.slug}`, { recursive: true });
    for (const { w, h } of widths) {
      for (const scheme of ['light', 'dark']) {
        const { context, page } = await open(w, h, scheme);
        await page.goto(`${BASE}${p.path}${p.query}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `${set.out}/${p.slug}/${w}-${scheme}.png` });
        await page.evaluate(() => {
          document.querySelectorAll('.result-bar').forEach((el) => el.style.setProperty('display', 'none'));
          // Lay out lazily rendered calendar months so the full-page shot shows them.
          document.querySelectorAll('.kal-month').forEach((el) => el.style.setProperty('content-visibility', 'visible'));
        });
        await page.screenshot({ path: `${set.out}/${p.slug}/${w}-${scheme}-full.jpg`, fullPage: true, type: 'jpeg', quality: 60 });
        await context.close();
        count += 2;
      }
    }
  }

  if (set.rest.length) {
    mkdirSync(`${set.out}/semua-halaman`, { recursive: true });
    for (const { w, h } of widths) {
      for (const scheme of ['light', 'dark']) {
        const { context, page } = await open(w, h, scheme);
        for (const path of set.rest) {
          await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
          const name = path.split('/').filter(Boolean).slice(1).join('-');
          await page.screenshot({ path: `${set.out}/semua-halaman/${name}-${w}-${scheme}.jpg`, type: 'jpeg', quality: 50 });
          count += 1;
        }
        await context.close();
      }
    }
  }

  await browser.close();
}

server?.kill();
console.log(`screenshots: ${count} files (${names.join(', ')})`);
