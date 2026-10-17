import { absoluteUrl } from '../config/site';
import { LOCALES, type LocaleCode } from './locales';
import { DINA, PASARAN, wetonSlug } from '../lib/calendar/javanese/names';
import { BULAN_SLUGS, KALENDER_YEARS, type BulanSlug } from '../content/id/meta';
import { BUILD_DAY } from '../content/es-mx/meta';

/**
 * Route registry: every page has a stable key and a native slug per locale.
 * Slugs are written in the market's language (they carry keywords), so the
 * same page has different paths per locale. A locale/page pair is live only
 * when the locale is published AND the page lists a path for it.
 */
type MxKey =
  | 'mx.aguinaldo'
  | 'mx.finiquito'
  | 'mx.liquidacion'
  | 'mx.prima-vacacional'
  | 'mx.vacaciones'
  | 'mx.uma-salario-minimo'
  | 'mx.udis-a-pesos'
  | 'mx.pesos-a-udis'
  | `mx.udis.historico.${number}`;
type BrKey =
  | 'br.alqueire-hectare'
  | 'br.alqueire-paulista'
  | 'br.alqueire-mineiro-goiano'
  | 'br.alqueire-baiano'
  | 'br.alqueire-do-norte'
  | 'br.tarefa-hectare'
  | 'br.litro-de-terra'
  | 'br.hectare-alqueire';
export type WetonSlug = `${Lowercase<(typeof DINA)[number]>}-${Lowercase<(typeof PASARAN)[number]>}`;
type IdKey =
  | 'id.weton'
  | 'id.weton.jodoh'
  | 'id.weton.hari-ini'
  | `id.weton.${WetonSlug}`
  | `id.kalender.${number}`
  | `id.kalender.${number}.${BulanSlug}`;
export type PageKey = 'home' | MxKey | BrKey | IdKey;

type RouteDef = Partial<Record<LocaleCode, string>> & { default?: LocaleCode };

export const UDI_YEARS = Array.from({ length: Number(BUILD_DAY.slice(0, 4)) - 1994 }, (_, index) => index + 1995);
const udiRoutes: Record<string, RouteDef> = Object.fromEntries(
  UDI_YEARS.map((year) => [`mx.udis.historico.${year}`, { 'es-mx': `/es-mx/udis-a-pesos/historico/${year}/`, default: 'es-mx' }]),
);

const idRoutes: Record<string, RouteDef> = {
  'id.weton': { id: '/id/weton/', default: 'id' },
  'id.weton.jodoh': { id: '/id/weton/jodoh/', default: 'id' },
  'id.weton.hari-ini': { id: '/id/weton/hari-ini/', default: 'id' },
};
for (const dina of DINA) {
  for (const pasaran of PASARAN) {
    const slug = wetonSlug(dina, pasaran);
    idRoutes[`id.weton.${slug}`] = { id: `/id/weton/${slug}/`, default: 'id' };
  }
}
for (const year of KALENDER_YEARS) {
  idRoutes[`id.kalender.${year}`] = { id: `/id/kalender-jawa/${year}/`, default: 'id' };
  for (const bulan of BULAN_SLUGS) idRoutes[`id.kalender.${year}.${bulan}`] = { id: `/id/kalender-jawa/${year}/${bulan}/`, default: 'id' };
}

export const ROUTES: Readonly<Record<string, RouteDef>> = {
  home: {
    'es-mx': '/es-mx/',
    'pt-br': '/pt-br/',
    id: '/id/',
    ja: '/ja/',
    pl: '/pl/',
    de: '/de/',
    'es-es': '/es-es/',
    en: '/en/',
    tr: '/tr/',
    default: 'es-mx',
  },
  'mx.aguinaldo': { 'es-mx': '/es-mx/calculadora-aguinaldo/', default: 'es-mx' },
  'mx.finiquito': { 'es-mx': '/es-mx/calculadora-finiquito/', default: 'es-mx' },
  'mx.liquidacion': { 'es-mx': '/es-mx/calculadora-liquidacion/', default: 'es-mx' },
  'mx.prima-vacacional': { 'es-mx': '/es-mx/calculadora-prima-vacacional/', default: 'es-mx' },
  'mx.vacaciones': { 'es-mx': '/es-mx/calculadora-vacaciones/', default: 'es-mx' },
  'mx.uma-salario-minimo': { 'es-mx': '/es-mx/uma-salario-minimo-2026/', default: 'es-mx' },
  'mx.udis-a-pesos': { 'es-mx': '/es-mx/udis-a-pesos/', default: 'es-mx' },
  'mx.pesos-a-udis': { 'es-mx': '/es-mx/pesos-a-udis/', default: 'es-mx' },
  ...udiRoutes,
  // pt-BR land units (BR-01). No other locale has an equivalent page yet, so hreflang is self-only.
  'br.alqueire-hectare': { 'pt-br': '/pt-br/conversor-alqueire-hectare/', default: 'pt-br' },
  'br.alqueire-paulista': { 'pt-br': '/pt-br/conversor-alqueire-hectare/alqueire-paulista/', default: 'pt-br' },
  'br.alqueire-mineiro-goiano': { 'pt-br': '/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/', default: 'pt-br' },
  'br.alqueire-baiano': { 'pt-br': '/pt-br/conversor-alqueire-hectare/alqueire-baiano/', default: 'pt-br' },
  'br.alqueire-do-norte': { 'pt-br': '/pt-br/conversor-alqueire-hectare/alqueire-do-norte/', default: 'pt-br' },
  'br.tarefa-hectare': { 'pt-br': '/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/', default: 'pt-br' },
  'br.litro-de-terra': { 'pt-br': '/pt-br/conversor-alqueire-hectare/litro-de-terra/', default: 'pt-br' },
  'br.hectare-alqueire': { 'pt-br': '/pt-br/hectare-para-alqueire/', default: 'pt-br' },
  // id (ID-01): weton pages and Javanese calendars; self-only hreflang.
  ...idRoutes,
};

function route(key: PageKey): RouteDef {
  const r = ROUTES[key];
  if (!r) throw new Error(`Unknown route "${key}"`);
  return r;
}

export function pathFor(key: PageKey, locale: LocaleCode): string {
  const path = route(key)[locale];
  if (!path) throw new Error(`Route "${key}" has no path for locale "${locale}"`);
  return path;
}

export function isLive(key: PageKey, locale: LocaleCode): boolean {
  return Boolean(ROUTES[key]?.[locale]) && LOCALES[locale].published;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * hreflang alternates for a page: one entry per live locale plus `x-default`.
 * Unpublished locales are never emitted, so adding pt-BR later only requires
 * flipping `published` and adding the path.
 */
export function alternatesFor(key: PageKey): Alternate[] {
  const r = route(key);
  const out: Alternate[] = [];
  for (const code of Object.keys(LOCALES) as LocaleCode[]) {
    const path = r[code];
    if (path && LOCALES[code].published) {
      out.push({ hreflang: LOCALES[code].hreflang, href: absoluteUrl(path) });
    }
  }
  const def = r.default;
  if (def && r[def] && LOCALES[def].published) {
    out.push({ hreflang: 'x-default', href: absoluteUrl(r[def]) });
  }
  return out;
}

/** All live (locale, path) pairs — the sitemap source of truth. */
export function liveRoutes(): { key: PageKey; locale: LocaleCode; path: string }[] {
  const out: { key: PageKey; locale: LocaleCode; path: string }[] = [];
  for (const key of Object.keys(ROUTES) as PageKey[]) {
    for (const code of Object.keys(LOCALES) as LocaleCode[]) {
      const path = ROUTES[key]?.[code];
      if (path && LOCALES[code].published) out.push({ key, locale: code, path });
    }
  }
  return out;
}
