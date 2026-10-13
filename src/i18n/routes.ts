import { absoluteUrl } from '../config/site';
import { LOCALES, type LocaleCode } from './locales';

/**
 * Route registry: every page has a stable key and a native slug per locale.
 * Slugs are written in the market's language (they carry keywords), so the
 * same page has different paths per locale. A locale/page pair is live only
 * when the locale is published AND the page lists a path for it.
 */
export type PageKey =
  'home' | 'mx.aguinaldo' | 'mx.finiquito' | 'mx.liquidacion' | 'mx.prima-vacacional' | 'mx.vacaciones' | 'mx.uma-salario-minimo';

type RouteDef = Partial<Record<LocaleCode, string>> & { default?: LocaleCode };

export const ROUTES: Record<PageKey, RouteDef> = {
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
};

export function pathFor(key: PageKey, locale: LocaleCode): string {
  const path = ROUTES[key][locale];
  if (!path) throw new Error(`Route "${key}" has no path for locale "${locale}"`);
  return path;
}

export function isLive(key: PageKey, locale: LocaleCode): boolean {
  return Boolean(ROUTES[key][locale]) && LOCALES[locale].published;
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
  const route = ROUTES[key];
  const out: Alternate[] = [];
  for (const code of Object.keys(LOCALES) as LocaleCode[]) {
    const path = route[code];
    if (path && LOCALES[code].published) {
      out.push({ hreflang: LOCALES[code].hreflang, href: absoluteUrl(path) });
    }
  }
  const def = route.default;
  if (def && route[def] && LOCALES[def].published) {
    out.push({ hreflang: 'x-default', href: absoluteUrl(route[def]) });
  }
  return out;
}

/** All live (locale, path) pairs — the sitemap source of truth. */
export function liveRoutes(): { key: PageKey; locale: LocaleCode; path: string }[] {
  const out: { key: PageKey; locale: LocaleCode; path: string }[] = [];
  for (const key of Object.keys(ROUTES) as PageKey[]) {
    for (const code of Object.keys(LOCALES) as LocaleCode[]) {
      const path = ROUTES[key][code];
      if (path && LOCALES[code].published) out.push({ key, locale: code, path });
    }
  }
  return out;
}
