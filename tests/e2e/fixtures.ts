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

export interface Route {
  path: string;
  kind: RouteKind;
  h1: string;
  locale: 'es-mx' | 'id';
}

const MX: Route[] = [
  { path: '/es-mx/', kind: 'home', h1: 'Tus pagos laborales', locale: 'es-mx' },
  { path: '/es-mx/calculadora-aguinaldo/', kind: 'calculator', h1: 'Calculadora de aguinaldo 2026', locale: 'es-mx' },
  { path: '/es-mx/calculadora-finiquito/', kind: 'calculator', h1: 'Calculadora de finiquito 2026', locale: 'es-mx' },
  { path: '/es-mx/calculadora-liquidacion/', kind: 'calculator', h1: 'Calculadora de liquidación 2026', locale: 'es-mx' },
  { path: '/es-mx/calculadora-prima-vacacional/', kind: 'calculator', h1: 'Calculadora de prima vacacional 2026', locale: 'es-mx' },
  { path: '/es-mx/calculadora-vacaciones/', kind: 'calculator', h1: 'Calculadora de vacaciones 2026', locale: 'es-mx' },
  { path: '/es-mx/uma-salario-minimo-2026/', kind: 'reference', h1: 'UMA y salario mínimo 2026', locale: 'es-mx' },
];

const DINA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const KALENDER_YEARS = [2026, 2027];

const ID: Route[] = [
  { path: '/id/', kind: 'home', h1: 'Weton dan kalender Jawa', locale: 'id' },
  { path: '/id/weton/', kind: 'calculator', h1: 'Cek weton dari tanggal lahir', locale: 'id' },
  { path: '/id/weton/jodoh/', kind: 'calculator', h1: 'Hitung weton jodoh', locale: 'id' },
  { path: '/id/weton/hari-ini/', kind: 'calculator', h1: 'Weton hari ini', locale: 'id' },
  ...DINA.flatMap((d) =>
    PASARAN.map((p) => ({
      path: `/id/weton/${d.toLowerCase()}-${p.toLowerCase()}/`,
      kind: 'calculator' as const,
      h1: `Weton ${d} ${p}`,
      locale: 'id' as const,
    })),
  ),
  ...KALENDER_YEARS.flatMap((y) => [
    { path: `/id/kalender-jawa/${y}/`, kind: 'calendar' as const, h1: `Kalender Jawa ${y}`, locale: 'id' as const },
    ...BULAN.map((b) => ({
      path: `/id/kalender-jawa/${y}/${b.toLowerCase()}/`,
      kind: 'calendar' as const,
      h1: `Kalender Jawa ${b} ${y}`,
      locale: 'id' as const,
    })),
  ]),
];

export const ROUTES: Route[] = [...MX, ...ID];

/** Pages with a visual baseline: every es-MX page and one page of each /id/ template. */
export const VISUAL_ROUTES: Route[] = [
  ...MX,
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
  id: {
    lang: 'id',
    updated: 'Diperbarui',
    review: 'Tinjauan ahli penanggalan Jawa: menunggu',
    sources: 'Sumber dan metode',
    faq: 'Pertanyaan yang sering diajukan',
  },
} as const;
