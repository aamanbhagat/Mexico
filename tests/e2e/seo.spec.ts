import { ROUTES, WORDS, expect, test } from './fixtures';
import { loadEnv } from 'vite';
import { requireSiteUrl } from '../../scripts/site-url.mjs';
import { UDIS_EDITORIAL_UPDATED } from '../../src/content/es-mx/meta';
import { readFileSync } from 'node:fs';
import { mexicoDay } from '../../src/lib/udis/date';

const siteUrl = requireSiteUrl(loadEnv('production', process.cwd(), 'SITE_URL').SITE_URL);

test.describe('SEO contract (AGENTS.md §6)', () => {
  test.skip(({ isMobile }) => isMobile, 'markup is identical on mobile');

  test('root fallback canonical uses the configured origin', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain(`<link rel="canonical" href="${siteUrl}/es-mx/">`);
  });

  for (const route of ROUTES) {
    test(`${route.path} has unique metadata, canonical, hreflang and JSON-LD`, async ({ page }) => {
      const words = WORDS[route.locale];
      const res = await page.goto(route.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', route.lang);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(20);
      expect(title.length).toBeLessThanOrEqual(75);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(70);
      expect(description?.length ?? 0).toBeLessThanOrEqual(170);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`${siteUrl}${route.path}`);

      const hreflangs = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => els.map((e) => ({ lang: e.getAttribute('hreflang'), href: e.getAttribute('href') })));
      expect(hreflangs.map(({ lang }) => lang)).toEqual(route.hreflang);
      for (const { href } of hreflangs) expect(new URL(href ?? '').origin).toBe(siteUrl);

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/(id\/)?[a-z0-9-]+\.png$/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(route.h1);

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => (JSON.parse(e.textContent ?? '{}') as { '@type': string })['@type']));
      if (route.kind === 'calculator' || route.kind === 'calendar') expect(types).toEqual(['WebApplication', 'FAQPage', 'BreadcrumbList']);
      if (route.kind === 'reference') expect(types).toEqual(['Dataset', 'FAQPage', 'BreadcrumbList']);

      if (route.kind !== 'home') {
        await expect(page.getByText(words.updated, { exact: false }).first()).toBeVisible();
        const review =
          route.path.includes('/udis-a-pesos/') || route.path === '/es-mx/pesos-a-udis/' ? 'Revisión técnica: pendiente' : words.review;
        await expect(page.getByText(review).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: words.sources, exact: true })).toBeVisible();
        expect(await page.locator('.sources a[href^="https://"]').count()).toBeGreaterThanOrEqual(3);
        await expect(page.getByRole('heading', { name: words.faq })).toBeVisible();
        expect(await page.locator('.faq details').count()).toBeGreaterThanOrEqual(5);
      }
    });
  }

  test('titles and descriptions are unique across pages', async ({ page }) => {
    const seen = new Set<string>();
    for (const route of ROUTES) {
      await page.goto(route.path);
      const key = `${await page.title()}|${await page.locator('meta[name="description"]').getAttribute('content')}`;
      expect(seen.has(key), route.path).toBe(false);
      seen.add(key);
    }
  });

  test('sitemap lists every live page with hreflang alternates, and nothing else', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? ''));
    for (const location of locations) expect(location.origin).toBe(siteUrl);
    for (const [, href] of xml.matchAll(/<xhtml:link\b[^>]*href="([^"]+)"/g)) expect(new URL(href ?? '').origin).toBe(siteUrl);
    const locs = locations.map((location) => location.pathname).sort();
    expect(locs).toEqual(ROUTES.map((r) => r.path).sort());
    expect(xml.match(/hreflang="x-default"/g)?.length).toBe(ROUTES.length);
    // A locale's tag appears on its own pages and on every locale's home (the homes are alternates of each other).
    const homes = ROUTES.filter((r) => r.kind === 'home').length;
    for (const [locale, tag] of [
      ['es-mx', 'es-MX'],
      ['pt-br', 'pt-BR'],
      ['id', 'id-ID'],
    ] as const) {
      expect(xml.match(new RegExp(`hreflang="${tag}"`, 'g'))?.length, tag).toBe(
        ROUTES.filter((r) => r.locale === locale).length + homes - 1,
      );
    }
  });

  test('UDI lastmod uses the applicable dated rate, not the build timestamp or a future value', async ({ request }) => {
    const archive = JSON.parse(readFileSync(new URL('../../public/data/mx/udis.json', import.meta.url), 'utf8')) as {
      retrieved_at: string;
      rates: [string, string][];
    };
    const day = mexicoDay(new Date(archive.retrieved_at));
    const year = day.slice(0, 4);
    const last = archive.rates.filter(([date]) => date.startsWith(`${year}-`) && date <= day).at(-1)?.[0];
    const xml = await (await request.get('/sitemap.xml')).text();
    const entries = new Map(
      [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => [
        new URL(body!.match(/<loc>([^<]+)<\/loc>/)![1]!).pathname,
        body!.match(/<lastmod>([^<]+)<\/lastmod>/)![1],
      ]),
    );
    expect(entries.get('/es-mx/udis-a-pesos/')).toBe(day > UDIS_EDITORIAL_UPDATED ? day : UDIS_EDITORIAL_UPDATED);
    expect(entries.get('/es-mx/pesos-a-udis/')).toBe(day > UDIS_EDITORIAL_UPDATED ? day : UDIS_EDITORIAL_UPDATED);
    expect(entries.get('/es-mx/udis-a-pesos/historico/1995/')).toBe(UDIS_EDITORIAL_UPDATED);
    expect(entries.get(`/es-mx/udis-a-pesos/historico/${year}/`)).toBe(
      last && last > UDIS_EDITORIAL_UPDATED ? last : UDIS_EDITORIAL_UPDATED,
    );
  });

  test('robots.txt points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
  });

  test('unpublished locales are not built', async ({ request }) => {
    for (const code of ['ja', 'pl', 'de', 'es-es', 'en', 'tr']) {
      expect((await request.get(`/${code}/`)).status()).toBe(404);
    }
  });

  test('OG images are real 1200×630 PNGs, including one per weton and calendar', async ({ request }) => {
    for (const path of [
      '/og/aguinaldo.png',
      '/og/alqueire-hectare.png',
      '/og/alqueire-baiano.png',
      '/og/id/selasa-pon.png',
      '/og/id/kalender-2027.png',
      '/og/id/kalender-2027-desember.png',
      '/og/udis-a-pesos.png',
      '/og/pesos-a-udis.png',
      '/og/udis-historico-1995.png',
      '/og/udis-historico-2026.png',
    ]) {
      const res = await request.get(path);
      expect(res.headers()['content-type'], path).toContain('image/png');
      const body = await res.body();
      expect(body.subarray(1, 4).toString()).toBe('PNG');
      expect(body.readUInt32BE(16)).toBe(1200);
      expect(body.readUInt32BE(20)).toBe(630);
    }
  });

  test('every page links to an OG image that exists', async ({ page, request }) => {
    const images = new Set<string>();
    for (const route of ROUTES) {
      await page.goto(route.path);
      images.add(new URL((await page.locator('meta[property="og:image"]').getAttribute('content')) ?? '').pathname);
    }
    for (const path of images) expect((await request.get(path)).status(), path).toBe(200);
  });

  test('each BR page points to its own OG image', async ({ page }) => {
    await page.goto('/pt-br/conversor-alqueire-hectare/alqueire-baiano/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/alqueire-baiano\.png$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
  });

  test('cross-locale links appear only where hreflang applies', async ({ page }) => {
    await page.goto('/pt-br/');
    await expect(page.locator('.site-footer a[hreflang="es-MX"]')).toHaveAttribute('href', /\/es-mx\/$/);
    await expect(page.locator('.site-footer a[hreflang="id-ID"]')).toHaveAttribute('href', /\/id\/$/);
    await page.goto('/pt-br/conversor-alqueire-hectare/');
    await expect(page.locator('.site-footer a[hreflang]')).toHaveCount(0);
    await page.goto('/es-mx/calculadora-aguinaldo/');
    await expect(page.locator('.site-footer a[hreflang]')).toHaveCount(0);
    await page.goto('/id/weton/');
    await expect(page.locator('.site-footer a[hreflang]')).toHaveCount(0);
  });
});
