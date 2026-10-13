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

export interface RouteSpec {
  path: string;
  kind: 'home' | 'calculator' | 'reference';
  h1: string;
  lang: 'es-MX' | 'pt-BR';
  /** Expected hreflang values, in order. */
  hreflang: string[];
}

const MX = ['es-MX', 'x-default'];
const BR = ['pt-BR', 'x-default'];
const HOMES = ['es-MX', 'pt-BR', 'x-default'];

export const ROUTES: readonly RouteSpec[] = [
  { path: '/es-mx/', kind: 'home', h1: 'Tus pagos laborales', lang: 'es-MX', hreflang: HOMES },
  { path: '/es-mx/calculadora-aguinaldo/', kind: 'calculator', h1: 'Calculadora de aguinaldo 2026', lang: 'es-MX', hreflang: MX },
  { path: '/es-mx/calculadora-finiquito/', kind: 'calculator', h1: 'Calculadora de finiquito 2026', lang: 'es-MX', hreflang: MX },
  { path: '/es-mx/calculadora-liquidacion/', kind: 'calculator', h1: 'Calculadora de liquidación 2026', lang: 'es-MX', hreflang: MX },
  {
    path: '/es-mx/calculadora-prima-vacacional/',
    kind: 'calculator',
    h1: 'Calculadora de prima vacacional 2026',
    lang: 'es-MX',
    hreflang: MX,
  },
  { path: '/es-mx/calculadora-vacaciones/', kind: 'calculator', h1: 'Calculadora de vacaciones 2026', lang: 'es-MX', hreflang: MX },
  { path: '/es-mx/uma-salario-minimo-2026/', kind: 'reference', h1: 'UMA y salario mínimo 2026', lang: 'es-MX', hreflang: MX },
  { path: '/pt-br/', kind: 'home', h1: 'Medidas de terra', lang: 'pt-BR', hreflang: HOMES },
  { path: '/pt-br/conversor-alqueire-hectare/', kind: 'calculator', h1: 'Conversor de alqueire em hectare', lang: 'pt-BR', hreflang: BR },
  {
    path: '/pt-br/conversor-alqueire-hectare/alqueire-paulista/',
    kind: 'calculator',
    h1: 'Alqueire paulista em hectare',
    lang: 'pt-BR',
    hreflang: BR,
  },
  {
    path: '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/',
    kind: 'calculator',
    h1: 'Alqueire mineiro e goiano em hectare',
    lang: 'pt-BR',
    hreflang: BR,
  },
  {
    path: '/pt-br/conversor-alqueire-hectare/alqueire-baiano/',
    kind: 'calculator',
    h1: 'Alqueire baiano em hectare',
    lang: 'pt-BR',
    hreflang: BR,
  },
  {
    path: '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/',
    kind: 'calculator',
    h1: 'Alqueire do Norte em hectare',
    lang: 'pt-BR',
    hreflang: BR,
  },
  {
    path: '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/',
    kind: 'calculator',
    h1: 'Tarefa em hectare',
    lang: 'pt-BR',
    hreflang: BR,
  },
  {
    path: '/pt-br/conversor-alqueire-hectare/litro-de-terra/',
    kind: 'calculator',
    h1: 'Litro de terra em metros quadrados',
    lang: 'pt-BR',
    hreflang: BR,
  },
  { path: '/pt-br/hectare-para-alqueire/', kind: 'calculator', h1: 'Hectare para alqueire', lang: 'pt-BR', hreflang: BR },
];

/** Strings the SEO contract expects on every non-home page, per language. */
export const PAGE_TEXT = {
  'es-MX': {
    updated: 'Actualizado el',
    review: 'Revisión legal: pendiente',
    sources: 'Fuentes y valores oficiales',
    faq: 'Preguntas frecuentes',
  },
  'pt-BR': { updated: 'Atualizado em', review: 'Revisão técnica: pendente', sources: 'Fontes', faq: 'Perguntas frequentes' },
} as const;

/** A filled-in state per page, so tests see real results (salary $15,000 monthly). */
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
};
