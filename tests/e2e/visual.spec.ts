import { FILLED, UDI_TEST_NOW, VISUAL_ROUTES, expect, test } from './fixtures';

/** Above-the-fold visual snapshots of every es-MX page and each /id/ template, light and dark. */
for (const scheme of ['light', 'dark'] as const) {
  for (const route of VISUAL_ROUTES) {
    test(`visual ${scheme} ${route.path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      if (route.path.includes('/udis-a-pesos/') || route.path === '/es-mx/pesos-a-udis/') await page.clock.setFixedTime(UDI_TEST_NOW);
      await page.goto(route.path + (FILLED[route.path] ?? ''));
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      const name = `${route.path.split('/').filter(Boolean).join('-') || 'root'}-${scheme}.png`;
      await expect(page).toHaveScreenshot(name);
    });
  }
}
