import { test as base, expect } from '@playwright/test';

/** Freeze "today" so date-dependent defaults (aguinaldo year, último día) are deterministic. */
export const FIXED_NOW = new Date('2026-10-13T12:00:00-06:00');
/** The same instant is already 14 October in Jakarta (WIB, UTC+7). */
export const FIXED_TODAY_WIB = '2026-10-14';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await use(page);
  },
});

export { expect };

export type RouteKind = 'home' | 'calculator' | 'reference' | 'calendar';

export type Locale = 'es-mx' | 'pt-br' | 'id';

export interface Route {
  path: string;
  kind: RouteKind;
  h1: string;
  locale: Locale;
  /** <html lang>. */
  lang: string;
  /** Expected hreflang values, in order: locale homes point to each other, tool pages are self-only. */
  hreflang: string[];
}

const HTML_LANG: Record<Locale, string> = { 'es-mx': 'es-MX', 'pt-br': 'pt-BR', id: 'id' };
const HREFLANG: Record<Locale, string> = { 'es-mx': 'es-MX', 'pt-br': 'pt-BR', id: 'id-ID' };
const HOMES = ['es-MX', 'pt-BR', 'id-ID', 'x-default'];

function route(locale: Locale, path: string, kind: RouteKind, h1: string): Route {
  const hreflang = kind === 'home' ? HOMES : [HREFLANG[locale], 'x-default'];
  return { path, kind, h1, locale, lang: HTML_LANG[locale], hreflang };
}

const MX: Route[] = [
  route('es-mx', '/es-mx/', 'home', 'Tus pagos laborales'),
  route('es-mx', '/es-mx/calculadora-aguinaldo/', 'calculator', 'Calculadora de aguinaldo 2026'),
  route('es-mx', '/es-mx/calculadora-finiquito/', 'calculator', 'Calculadora de finiquito 2026'),
  route('es-mx', '/es-mx/calculadora-liquidacion/', 'calculator', 'Calculadora de liquidación 2026'),
  route('es-mx', '/es-mx/calculadora-prima-vacacional/', 'calculator', 'Calculadora de prima vacacional 2026'),
  route('es-mx', '/es-mx/calculadora-vacaciones/', 'calculator', 'Calculadora de vacaciones 2026'),
  route('es-mx', '/es-mx/uma-salario-minimo-2026/', 'reference', 'UMA y salario mínimo 2026'),
];

const BR: Route[] = [
  route('pt-br', '/pt-br/', 'home', 'Medidas de terra'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/', 'calculator', 'Conversor de alqueire em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/alqueire-paulista/', 'calculator', 'Alqueire paulista em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/', 'calculator', 'Alqueire mineiro e goiano em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/alqueire-baiano/', 'calculator', 'Alqueire baiano em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/', 'calculator', 'Alqueire do Norte em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/', 'calculator', 'Tarefa em hectare'),
  route('pt-br', '/pt-br/conversor-alqueire-hectare/litro-de-terra/', 'calculator', 'Litro de terra em metros quadrados'),
  route('pt-br', '/pt-br/hectare-para-alqueire/', 'calculator', 'Hectare para alqueire'),
];

const DINA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const KALENDER_YEARS = [2026, 2027];

const ID: Route[] = [
  route('id', '/id/', 'home', 'Weton dan kalender Jawa'),
  route('id', '/id/weton/', 'calculator', 'Cek weton dari tanggal lahir'),
  route('id', '/id/weton/jodoh/', 'calculator', 'Hitung weton jodoh'),
  route('id', '/id/weton/hari-ini/', 'calculator', 'Weton hari ini'),
  ...DINA.flatMap((d) =>
    PASARAN.map((p) => route('id', `/id/weton/${d.toLowerCase()}-${p.toLowerCase()}/`, 'calculator', `Weton ${d} ${p}`)),
  ),
  ...KALENDER_YEARS.flatMap((y) => [
    route('id', `/id/kalender-jawa/${y}/`, 'calendar', `Kalender Jawa ${y}`),
    ...BULAN.map((b) => route('id', `/id/kalender-jawa/${y}/${b.toLowerCase()}/`, 'calendar', `Kalender Jawa ${b} ${y}`)),
  ]),
];

export const ROUTES: Route[] = [...MX, ...BR, ...ID];

/** Pages with a visual baseline: every es-MX and pt-BR page, and one page of each /id/ template. */
export const VISUAL_ROUTES: Route[] = [
  ...MX,
  ...BR,
  ...ID.filter((r) =>
    [
      '/id/',
      '/id/weton/',
      '/id/weton/jodoh/',
      '/id/weton/hari-ini/',
      '/id/weton/selasa-pon/',
      '/id/kalender-jawa/2027/',
      '/id/kalender-jawa/2026/oktober/',
    ].includes(r.path),
  ),
];

/** A filled-in state per page, so tests see real results (salary $15,000 monthly; weton examples). */
export const FILLED: Record<string, string> = {
  '/es-mx/calculadora-aguinaldo/': '?s=15000',
  '/es-mx/calculadora-finiquito/': '?s=15000&i=2023-03-01&f=2026-10-15',
  '/es-mx/calculadora-liquidacion/': '?s=15000&i=2021-10-16&f=2026-10-15&v=1',
  '/es-mx/calculadora-prima-vacacional/': '?s=15000&i=2022-05-02',
  '/es-mx/calculadora-vacaciones/': '?s=15000&i=2019-03-04',
  // BR: a state with divergent sources and a price, so notices and the price table are audited too.
  '/pt-br/conversor-alqueire-hectare/': '?q=3&uf=BA&de=alqueire-baiano&pr=500000',
  '/pt-br/conversor-alqueire-hectare/alqueire-paulista/': '?q=3',
  '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/': '?q=10&uf=MG',
  '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/': '?q=5&uf=PA',
  '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/': '?q=10&uf=SE&de=tarefa-al-se',
  '/pt-br/conversor-alqueire-hectare/litro-de-terra/': '?q=12',
  '/pt-br/hectare-para-alqueire/': '?q=50&uf=MT&pr=30000',
  '/id/weton/': '?t=1945-08-17',
  '/id/weton/jodoh/': '?a=1990-05-17&b=1992-01-03',
};

/** Locale-specific words the SEO contract looks for. */
export const WORDS = {
  'es-mx': {
    lang: 'es-MX',
    updated: 'Actualizado el',
    review: 'Revisión legal: pendiente',
    sources: 'Fuentes y valores oficiales',
    faq: 'Preguntas frecuentes',
  },
  'pt-br': {
    lang: 'pt-BR',
    updated: 'Atualizado em',
    review: 'Revisão técnica: pendente',
    sources: 'Fontes',
    faq: 'Perguntas frequentes',
  },
  id: {
    lang: 'id',
    updated: 'Diperbarui',
    review: 'Tinjauan ahli penanggalan Jawa: menunggu',
    sources: 'Sumber dan metode',
    faq: 'Pertanyaan yang sering diajukan',
  },
} as const;
