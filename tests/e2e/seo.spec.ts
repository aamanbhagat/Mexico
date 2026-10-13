import { PAGE_TEXT, ROUTES, expect, test } from './fixtures';

test.describe('SEO contract (CLAUDE.md §6)', () => {
  test.skip(({ isMobile }) => isMobile, 'markup is identical on mobile');

  for (const route of ROUTES) {
    test(`${route.path} has unique metadata, canonical, hreflang and JSON-LD`, async ({ page }) => {
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
      expect(canonical).toMatch(new RegExp(`^https://[^/]+${route.path.replace(/\//g, '\\/')}$`));

      const hreflangs = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('hreflang')));
      expect(hreflangs).toEqual(route.hreflang);

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/[a-z-]+\.png$/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(route.h1);

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => (JSON.parse(e.textContent ?? '{}') as { '@type': string })['@type']));
      if (route.kind === 'calculator') expect(types).toEqual(['WebApplication', 'FAQPage', 'BreadcrumbList']);
      if (route.kind === 'reference') expect(types).toEqual(['Dataset', 'FAQPage', 'BreadcrumbList']);

      if (route.kind !== 'home') {
        const text = PAGE_TEXT[route.lang];
        await expect(page.getByText(text.updated, { exact: false }).first()).toBeVisible();
        await expect(page.getByText(text.review).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: text.sources, exact: true })).toBeVisible();
        expect(await page.locator('.sources a[href^="https://"]').count()).toBeGreaterThanOrEqual(3);
        await expect(page.getByRole('heading', { name: text.faq })).toBeVisible();
        expect(await page.locator('.faq details').count()).toBeGreaterThanOrEqual(5);
      }
    });
  }

  test('titles and descriptions are unique across pages', async ({ page }) => {
    const seen = new Set<string>();
    for (const route of ROUTES) {
      await page.goto(route.path);
      const key = `${await page.title()}|${await page.locator('meta[name="description"]').getAttribute('content')}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test('sitemap lists every live page with hreflang alternates, and nothing else', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '').pathname).sort();
    expect(locs).toEqual(ROUTES.map((r) => r.path).sort());
    expect(xml.match(/hreflang="x-default"/g)?.length).toBe(ROUTES.length);
  });

  test('robots.txt points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  });

  test('unpublished locales are not built', async ({ request }) => {
    for (const code of ['id', 'ja', 'pl', 'de', 'es-es', 'en', 'tr']) {
      expect((await request.get(`/${code}/`)).status()).toBe(404);
    }
  });

  test('OG images are real 1200×630 PNGs', async ({ request }) => {
    for (const slug of ['aguinaldo', 'alqueire-hectare', 'alqueire-baiano']) {
      const res = await request.get(`/og/${slug}.png`);
      expect(res.headers()['content-type']).toContain('image/png');
      const body = await res.body();
      expect(body.subarray(1, 4).toString()).toBe('PNG');
      expect(body.readUInt32BE(16)).toBe(1200);
      expect(body.readUInt32BE(20)).toBe(630);
    }
  });

  test('each BR page points to its own OG image', async ({ page }) => {
    await page.goto('/pt-br/conversor-alqueire-hectare/alqueire-baiano/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/alqueire-baiano\.png$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
  });

  test('cross-locale links appear only where hreflang applies', async ({ page }) => {
    await page.goto('/pt-br/');
    await expect(page.locator('.site-footer a[hreflang="es-MX"]')).toHaveAttribute('href', /\/es-mx\/$/);
    await page.goto('/pt-br/conversor-alqueire-hectare/');
    await expect(page.locator('.site-footer a[hreflang]')).toHaveCount(0);
    await page.goto('/es-mx/calculadora-aguinaldo/');
    await expect(page.locator('.site-footer a[hreflang]')).toHaveCount(0);
  });
});
