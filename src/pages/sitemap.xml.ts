import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';
import { alternatesFor, liveRoutes } from '../i18n/routes';
import { UPDATED as UPDATED_MX, UDIS_EDITORIAL_UPDATED } from '../content/es-mx/meta';
import { UPDATED as UPDATED_BR } from '../content/pt-br/meta';
import { UPDATED as UPDATED_ID } from '../content/id/meta';
import { UDI_BUILD_DAY, yearDates } from '../lib/udis/series';
import type { LocaleCode } from '../i18n/locales';

/** Last editorial update per locale (each locale bumps its own content/<locale>/meta.ts). */
const UPDATED: Partial<Record<LocaleCode, string>> = { 'es-mx': UPDATED_MX, 'pt-br': UPDATED_BR, id: UPDATED_ID };

function lastModified(key: string, locale: LocaleCode): string {
  if (key === 'home' && locale === 'es-mx') return UDIS_EDITORIAL_UPDATED;
  if (key === 'mx.uma-salario-minimo') return UDIS_EDITORIAL_UPDATED;
  if (key === 'mx.udis-a-pesos' || key === 'mx.pesos-a-udis') {
    return UDI_BUILD_DAY > UDIS_EDITORIAL_UPDATED ? UDI_BUILD_DAY : UDIS_EDITORIAL_UPDATED;
  }
  if (key.startsWith('mx.udis.historico.')) {
    const year = Number(key.slice('mx.udis.historico.'.length));
    const last = yearDates(year).at(-1)?.effective_from;
    if (!last) throw new Error(`No dated Banxico records for ${year}`);
    return last > UDIS_EDITORIAL_UPDATED ? last : UDIS_EDITORIAL_UPDATED;
  }
  return UPDATED[locale] ?? UPDATED_MX;
}

/**
 * XML sitemap with hreflang alternates (xhtml:link) for every live route. Unpublished
 * locales never appear; when a locale launches its pages join automatically.
 */
export const GET: APIRoute = () => {
  const urls = liveRoutes()
    .map(({ key, locale, path }) => {
      const alternates = alternatesFor(key)
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${lastModified(key, locale)}</lastmod>\n${alternates}\n  </url>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
