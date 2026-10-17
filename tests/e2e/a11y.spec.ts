import AxeBuilder from '@axe-core/playwright';
import { FILLED, ROUTES, UDI_TEST_NOW, expect, test } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe: zero violations (${scheme})`, () => {
    for (const route of ROUTES) {
      test(`${route.path}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        if (route.path.includes('/udis-a-pesos/') || route.path === '/es-mx/pesos-a-udis/') await page.clock.setFixedTime(UDI_TEST_NOW);
        await page.goto(route.path + (FILLED[route.path] ?? ''));
        await page.waitForLoadState('networkidle');
        // Open every disclosure so hidden controls are audited too.
        for (const d of await page.locator('details').all()) await d.evaluate((el) => el.setAttribute('open', ''));
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      });
    }
  });
}

test.describe('keyboard', () => {
  test('skip link, visible focus and full form reachable by keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow is a desktop concern');
    await page.goto('/es-mx/calculadora-aguinaldo/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    // Tab until the salary input; every focused element must show a visible indicator.
    const salary = page.getByLabel('Tu salario');
    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press('Tab');
      const visible = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return true;
        const target = el.matches('input[type=radio], input[type=checkbox]') ? ((el.nextElementSibling as HTMLElement | null) ?? el) : el;
        const s = getComputedStyle(target);
        const o = getComputedStyle(el);
        return (
          (o.outlineStyle !== 'none' && o.outlineWidth !== '0px') ||
          s.outlineStyle !== 'none' ||
          s.boxShadow !== 'none' ||
          o.boxShadow !== 'none'
        );
      });
      expect(visible).toBe(true);
      if (await salary.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(salary).toBeFocused();
    await page.keyboard.type('15000');

    // Radios move with arrow keys.
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Quincenal' })).toBeChecked();
  });

  test('result is announced politely, not on every keystroke', async ({ page }) => {
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    const live = page.locator('.calc__result > p[aria-live="polite"]');
    await expect(live).toHaveText(/Tu aguinaldo neto: \$6,736\.89/);
  });
});
