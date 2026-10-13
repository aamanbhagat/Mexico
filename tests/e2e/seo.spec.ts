import { ROUTES, WORDS, expect, test } from './fixtures';

test.describe('SEO contract (CLAUDE.md §6)', () => {
  test.skip(({ isMobile }) => isMobile, 'markup is identical on mobile');

  for (const route of ROUTES) {
    test(`${route.path} has unique metadata, canonical, hreflang and JSON-LD`, async ({ page }) => {
      const words = WORDS[route.locale];
      const res = await page.goto(route.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', words.lang);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(20);
      expect(title.length).toBeLessThanOrEqual(75);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(70);
      expect(description?.length ?? 0).toBeLessThanOrEqual(170);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(new RegExp(`^https://[^/]+${route.path.replace(/\//g, '\\/')}$`));

      const hreflangs = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('hreflang')));
      // Locale homes point to each other; tool pages exist in one locale only.
      if (route.kind === 'home') expect(hreflangs).toEqual(['es-MX', 'id-ID', 'x-default']);
      else expect(hreflangs).toEqual([route.locale === 'id' ? 'id-ID' : 'es-MX', 'x-default']);

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
        await expect(page.getByText(words.review).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: words.sources })).toBeVisible();
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
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '').pathname).sort();
    expect(locs).toEqual(ROUTES.map((r) => r.path).sort());
    expect(xml.match(/hreflang="x-default"/g)?.length).toBe(ROUTES.length);
    expect(xml.match(/hreflang="id-ID"/g)?.length).toBe(ROUTES.filter((r) => r.locale === 'id').length + 1);
  });

  test('robots.txt points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  });

  test('unpublished locales are not built', async ({ request }) => {
    for (const code of ['pt-br', 'ja', 'pl', 'de', 'es-es', 'en', 'tr']) {
      expect((await request.get(`/${code}/`)).status()).toBe(404);
    }
  });

  test('OG images are real 1200×630 PNGs, including one per weton', async ({ request }) => {
    for (const path of ['/og/aguinaldo.png', '/og/id/selasa-pon.png', '/og/id/kalender-2027.png', '/og/id/kalender-2027-desember.png']) {
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
});
