import { readFileSync } from 'node:fs';
import { test as base, expect } from '@playwright/test';
import { UDI_ROUTES, UDI_TEST_NOW } from './fixtures';
import { formatDateLong } from '../../src/lib/ui/format';

const archive = JSON.parse(readFileSync(new URL('../../public/data/mx/udis.json', import.meta.url), 'utf8')) as {
  rates: [string, string][];
  last_date: string;
  retrieved_at: string;
};
const test = base.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(UDI_TEST_NOW);
    await use(page);
  },
});

test.describe('UDIS por fecha de Banxico', () => {
  test('converts both ways with the exact six-decimal rate and never selects a future date', async ({ page }) => {
    // Banco de México SP68257, 17 Oct 2026: 8.857145 MXN/UDI (docs/sources/mx-03/raw/).
    await page.goto('/es-mx/udis-a-pesos/');
    const date = page.getByLabel('Fecha de la tasa');
    await date.fill('2026-10-17');
    await page.getByLabel('Cantidad de UDIS').fill('100');
    await expect(page.locator('.udi-result__number')).toHaveText('$885.71 MXN');
    await expect(page.getByTestId('udi-result')).toContainText('8.857145 MXN');
    await expect(page.getByTestId('udi-result')).toContainText('Consultado el');
    await expect(date).toHaveAttribute('min', '1995-04-04');
    await expect(date).toHaveAttribute('max', /\d{4}-\d{2}-\d{2}/);
    const nextDay = new Date(`${await date.getAttribute('max')}T18:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    await date.fill(nextDay.toISOString().slice(0, 10));
    await expect(page.getByTestId('udi-result')).toContainText('No hay tasa de Banxico para esta fecha');

    await page.goto('/es-mx/pesos-a-udis/');
    await page.getByLabel('Fecha de la tasa').fill('2026-10-17');
    await page.getByLabel('Pesos mexicanos').fill('100');
    await expect(page.locator('.udi-result__number')).toHaveText('11.290320 UDIS');
    await expect(page.getByTestId('udi-result')).toContainText('8.857145 MXN');
  });

  test('downloads dated rates independently of typing and never transmits form data', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto('/es-mx/udis-a-pesos/');
    await expect.poll(() => requests.filter((url) => url.endsWith('/data/mx/udis.json')).length).toBe(1);
    await page.waitForLoadState('networkidle');
    requests.length = 0;
    await page.getByLabel('Cantidad de UDIS').fill('123456.654321');
    await page.getByLabel('Saldo en UDIS').fill('95000');
    await page.getByLabel('Fecha de la tasa').fill('2025-12-31');
    await expect(page.locator('.udi-result__number')).not.toHaveText('—');
    await expect(page.getByTestId('udi-mortgage')).toContainText('Consultado el');
    await page.waitForTimeout(350);
    expect(requests.filter((url) => url.includes('123456') || url.includes('95000'))).toEqual([]);
    expect(requests.filter((url) => url.startsWith('http') && url.includes('/api/'))).toEqual([]);
    await expect(page).toHaveURL(/\/es-mx\/udis-a-pesos\/$/);
  });

  test('shows a dated historical result but no mortgage based on an expired snapshot', async ({ page }) => {
    const afterArchive = new Date(`${archive.last_date}T18:00:00Z`);
    afterArchive.setUTCDate(afterArchive.getUTCDate() + 1);
    await page.clock.setFixedTime(afterArchive);
    await page.goto('/es-mx/udis-a-pesos/');
    const stale = page.getByTestId('udi-stale');
    await expect(stale).toContainText('Datos pendientes de actualizar');
    await expect(stale).toContainText(
      `El último valor disponible es del ${formatDateLong(archive.last_date)}. No podemos calcular el valor vigente hoy. Consulta la serie de UDIS en Banxico.`,
    );
    await expect(stale.getByRole('link', { name: 'Consulta la serie de UDIS en Banxico.' })).toHaveAttribute('href', /banxico\.org\.mx/);
    await expect(page.getByTestId('udi-mortgage')).toHaveCount(0);
    await page.getByLabel('Fecha de la tasa').fill('2026-10-17');
    await expect(page.locator('.udi-result__number')).toHaveText('$885.71 MXN');
    await expect(page.getByTestId('udi-result')).toContainText('Valor del 17 de octubre de 2026');
  });

  test('does not fill in a missing today with yesterday or an already published future rate', async ({ page }) => {
    const exactToday = new Date('2026-10-17T12:00:00-06:00');
    await page.clock.setFixedTime(exactToday);
    await page.route('**/data/mx/udis.json', (route) =>
      route.fulfill({ json: { ...archive, rates: archive.rates.filter(([day]) => day !== '2026-10-17') } }),
    );
    await page.goto('/es-mx/udis-a-pesos/');
    const stale = page.getByTestId('udi-stale');
    await expect(stale).toContainText('Datos pendientes de actualizar');
    await expect(stale).toContainText('El último valor disponible es del 16 de octubre de 2026.');
    await expect(page.getByTestId('udi-result')).toContainText('No hay tasa de Banxico para esta fecha');
    await expect(page.getByTestId('udi-mortgage')).toHaveCount(0);
    await page.getByLabel('Fecha de la tasa').fill('2026-10-16');
    await expect(page.locator('.udi-result__number')).toHaveText('$885.66 MXN');
    await expect(page.getByTestId('udi-result')).toContainText('8.856619 MXN');
  });

  test('rechecks Mexican calendar day on returning to the tab', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-17T23:55:00-06:00'));
    await page.goto('/es-mx/udis-a-pesos/');
    await expect(page.locator('.udi-result__rate-label')).toHaveText('Valor vigente hoy');
    await page.clock.setFixedTime(new Date('2026-10-18T00:05:00-06:00'));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.locator('.udi-result__rate-label')).toHaveText('Valor del 17 de octubre de 2026');
    await expect(page.getByLabel('Fecha de la tasa')).toHaveAttribute('max', '2026-10-18');
    await expect(page.getByTestId('udi-stale')).toHaveCount(0);
  });

  test('supports numeric keyboard and visible focus with an actual result', async ({ page, isMobile }) => {
    await page.goto('/es-mx/udis-a-pesos/');
    const amount = page.getByLabel('Cantidad de UDIS');
    await expect(amount).toHaveAttribute('inputmode', 'decimal');
    await amount.focus();
    await expect(amount).toBeFocused();
    const focus = await amount.evaluate((input) => {
      const css = getComputedStyle(input);
      return css.outlineStyle !== 'none' && css.outlineWidth !== '0px';
    });
    expect(focus).toBe(true);
    await amount.fill('100');
    await expect(page.locator('.udi-result__number')).toHaveText(/\$\d[\d,]*\.\d{2} MXN/);
    if (isMobile) await expect(page.getByTestId('udi-result')).toBeInViewport({ ratio: 0.1 });
  });

  test('lists every daily rate by month, with date, source and retrieval time', async ({ page }) => {
    await page.goto('/es-mx/udis-a-pesos/historico/1995/');
    await expect(page.locator('.udi-history__month')).toHaveCount(9);
    await expect(page.locator('.udi-history tbody tr')).toHaveCount(archive.rates.filter(([day]) => day.startsWith('1995-')).length);
    const first = page.locator('.udi-history tbody tr').first();
    await expect(first).toContainText('4 de abril de 1995');
    await expect(first).toContainText('1.000000 MXN');
    await expect(first).toContainText('Banxico SIE');
    await expect(first).toContainText('Consultado el');
    await expect(page.locator('.udi-chart__data li')).toHaveCount(9);
    await page.goto('/es-mx/udis-a-pesos/historico/2026/');
    const publishedFuture = archive.rates.find(([day]) => day > '2026-10-17');
    if (publishedFuture) await expect(page.locator(`.udi-history time[datetime="${publishedFuture[0]}"]`)).toHaveCount(0);
  });
});

for (const route of UDI_ROUTES) {
  test(`heading has the same line count in fallback and loaded font at 360/390/430: ${route.path}`, async ({ page }) => {
    let releaseFont: () => void = () => {};
    const fontGate = new Promise<void>((resolve) => (releaseFont = resolve));
    await page.route('**/*.woff2', async (request) => {
      await fontGate;
      await request.continue();
    });
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    const lines = () =>
      page.locator('h1').evaluate((heading) => {
        const css = getComputedStyle(heading);
        return Math.round(heading.getBoundingClientRect().height / Number.parseFloat(css.lineHeight));
      });
    const fallback: number[] = [];
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      fallback.push(await lines());
    }
    releaseFont();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.locator('h1').evaluate((heading) => {
        const font = getComputedStyle(heading).fontFamily.split(',')[0]?.trim();
        return font ? [...document.fonts].some((face) => face.family === font && face.status === 'loaded') : false;
      }),
    ).toBe(true);
    for (const [index, width] of [360, 390, 430].entries()) {
      await page.setViewportSize({ width, height: 844 });
      expect(await lines(), `${route.path} at ${width}px`).toBe(fallback[index]);
    }
  });
}
