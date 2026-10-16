/**
 * Lighthouse CI: mobile emulation (Lighthouse default: Moto G Power, slow 4G, 4× CPU) on every
 * live page. Budgets from AGENTS.md §3. INP cannot be measured in a lab run; Total Blocking Time
 * is Lighthouse's lab proxy for responsiveness and is held to the same 200 ms.
 */
const pages = [
  '/es-mx/',
  '/es-mx/calculadora-aguinaldo/',
  '/es-mx/calculadora-finiquito/',
  '/es-mx/calculadora-liquidacion/',
  '/es-mx/calculadora-prima-vacacional/',
  '/es-mx/calculadora-vacaciones/',
  '/es-mx/uma-salario-minimo-2026/',
  // ID-01: one page per template, plus both full-year calendars (the heaviest pages).
  '/id/',
  '/id/weton/',
  '/id/weton/jodoh/',
  '/id/weton/hari-ini/',
  '/id/weton/selasa-pon/',
  '/id/kalender-jawa/2026/',
  '/id/kalender-jawa/2027/',
  '/id/kalender-jawa/2027/desember/',
  '/pt-br/',
  '/pt-br/conversor-alqueire-hectare/',
  '/pt-br/conversor-alqueire-hectare/alqueire-paulista/',
  '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/',
  '/pt-br/conversor-alqueire-hectare/alqueire-baiano/',
  '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/',
  '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/',
  '/pt-br/conversor-alqueire-hectare/litro-de-terra/',
  '/pt-br/hectare-para-alqueire/',
];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: pages.map((p) => `http://localhost${p}`),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:best-practices': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1800, aggregationMethod: 'median-run' }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05, aggregationMethod: 'median-run' }],
        'total-blocking-time': ['error', { maxNumericValue: 200, aggregationMethod: 'median-run' }],
        'resource-summary:script:size': ['error', { maxNumericValue: 71680, aggregationMethod: 'median-run' }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
