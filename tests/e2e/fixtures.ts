import { test as base, expect } from '@playwright/test';

/** Freeze "today" so date-dependent defaults (aguinaldo year, último día) are deterministic. */
export const FIXED_NOW = new Date('2026-10-13T12:00:00-06:00');

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await use(page);
  },
});

export { expect };

export const ROUTES = [
  { path: '/es-mx/', kind: 'home', h1: 'Tus pagos laborales' },
  { path: '/es-mx/calculadora-aguinaldo/', kind: 'calculator', h1: 'Calculadora de aguinaldo 2026' },
  { path: '/es-mx/calculadora-finiquito/', kind: 'calculator', h1: 'Calculadora de finiquito 2026' },
  { path: '/es-mx/calculadora-liquidacion/', kind: 'calculator', h1: 'Calculadora de liquidación 2026' },
  { path: '/es-mx/calculadora-prima-vacacional/', kind: 'calculator', h1: 'Calculadora de prima vacacional 2026' },
  { path: '/es-mx/calculadora-vacaciones/', kind: 'calculator', h1: 'Calculadora de vacaciones 2026' },
  { path: '/es-mx/uma-salario-minimo-2026/', kind: 'reference', h1: 'UMA y salario mínimo 2026' },
] as const;

/** A filled-in state per page, so tests see real results (salary $15,000 monthly). */
export const FILLED: Record<string, string> = {
  '/es-mx/calculadora-aguinaldo/': '?s=15000',
  '/es-mx/calculadora-finiquito/': '?s=15000&i=2023-03-01&f=2026-10-15',
  '/es-mx/calculadora-liquidacion/': '?s=15000&i=2021-10-16&f=2026-10-15&v=1',
  '/es-mx/calculadora-prima-vacacional/': '?s=15000&i=2022-05-02',
  '/es-mx/calculadora-vacaciones/': '?s=15000&i=2019-03-04',
};
