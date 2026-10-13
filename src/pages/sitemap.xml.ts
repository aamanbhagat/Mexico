import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';
import { alternatesFor, liveRoutes } from '../i18n/routes';
import { UPDATED as UPDATED_MX } from '../content/es-mx/meta';
import { UPDATED as UPDATED_ID } from '../content/id/meta';
import type { LocaleCode } from '../i18n/locales';

/** Last editorial update per locale (each locale bumps its own content/<locale>/meta.ts). */
const UPDATED: Partial<Record<LocaleCode, string>> = { 'es-mx': UPDATED_MX, id: UPDATED_ID };

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
      return `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${UPDATED[locale] ?? UPDATED_MX}</lastmod>\n${alternates}\n  </url>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
