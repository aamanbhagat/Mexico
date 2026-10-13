import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';
import { alternatesFor, liveRoutes } from '../i18n/routes';
import { UPDATED } from '../content/es-mx/meta';

/**
 * XML sitemap with hreflang alternates (xhtml:link) for every live route. Unpublished
 * locales never appear; when a locale launches its pages join automatically.
 */
export const GET: APIRoute = () => {
  const urls = liveRoutes()
    .map(({ key, path }) => {
      const alternates = alternatesFor(key)
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${UPDATED}</lastmod>\n${alternates}\n  </url>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
