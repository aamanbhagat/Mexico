import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const headline = (page: Page) => page.locator('.result-head__amount .sr-only');

test.describe('aguinaldo', () => {
  test('PROFEDET example: $500 diarios, año completo → neto $6,730.01', async ({ page }) => {
    await page.goto('/es-mx/calculadora-aguinaldo/');
    await expect(page.locator('.result-head__empty')).toContainText('Escribe tu salario');
    await page.getByLabel('Tu salario').fill('500');
    await page.getByRole('radio', { name: 'Diario' }).check({ force: true });
    await expect(headline(page)).toHaveText('$6,730.01');
    await expect(page.locator('#aguinaldo-desglose')).toContainText('$7,500.00');
    await expect(page.locator('#aguinaldo-desglose')).toContainText('$3,519.30');
  });

  test('state lives in the URL and survives a reload', async ({ page }) => {
    await page.goto('/es-mx/calculadora-aguinaldo/');
    await page.getByLabel('Tu salario').fill('500');
    await page.getByRole('radio', { name: 'Diario' }).check({ force: true });
    await expect(page).toHaveURL(/s=500/);
    await expect(page).toHaveURL(/p=diario/);
    await page.reload();
    await expect(page.getByLabel('Tu salario')).toHaveValue('500.00');
    await expect(headline(page)).toHaveText('$6,730.01');
  });

  test('keeps what was typed before the calculator finished loading', async ({ page }) => {
    // Hold the island's JavaScript back, as on a slow phone, and edit the form meanwhile.
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    await page.route('**/_astro/*.js', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/es-mx/calculadora-aguinaldo/', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Tu salario').fill('500');
    await page.getByRole('radio', { name: 'Diario' }).check({ force: true });
    release();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(headline(page)).toHaveText('$6,730.01');
    await expect(page).toHaveURL(/s=500/);
  });

  test('explains invalid input instead of computing it', async ({ page }) => {
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    await page.getByLabel('Días de aguinaldo').fill('10');
    await expect(page.locator('.field__error')).toHaveText('La ley marca al menos 15 días de aguinaldo (art. 87 LFT).');
    await expect(page.getByLabel('Días de aguinaldo')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows the result instantly with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    await page.getByLabel('Tu salario').fill('30000');
    const exact = page.locator('.result-head__amount .sr-only');
    await expect(exact).not.toHaveText('$6,736.89');
    // The visible figure must already equal the final value: no intermediate frames.
    const [visible, final] = await Promise.all([
      page.locator('.result-head__amount [aria-hidden="true"]').textContent(),
      exact.textContent(),
    ]);
    expect(visible).toBe(final);
  });

  test('downloads a valid PDF report', async ({ page }) => {
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar PDF' }).click()]);
    expect(download.suggestedFilename()).toBe('aguinaldo-2026.pdf');
    const bytes = await readFile((await download.path()) as string);
    expect(bytes.subarray(0, 8).toString('latin1')).toBe('%PDF-1.4');
    expect(bytes.subarray(-6).toString('latin1')).toContain('%%EOF');
  });

  test('copies a plain-text summary', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    await page.getByRole('button', { name: 'Copiar' }).click();
    await expect(page.getByText('Resumen copiado')).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('Aguinaldo neto: $6,736.89');
  });

  test('keeps the answer on screen on phones (sticky bar)', async ({ page, isMobile }) => {
    test.skip(!isMobile);
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    const bar = page.locator('.result-bar');
    await expect(bar).toBeInViewport();
    await expect(bar).toContainText('$6,736.89');
    await page.getByLabel('Días de aguinaldo').scrollIntoViewIfNeeded();
    await expect(bar).toBeInViewport();
  });
});

test.describe('worked examples open the calculator with the same result', () => {
  const cases = [
    { path: '/es-mx/calculadora-finiquito/', expected: '$11,344.77' },
    { path: '/es-mx/calculadora-liquidacion/', expected: '$88,692.17' },
    { path: '/es-mx/calculadora-prima-vacacional/', expected: '$1,500.00' },
    { path: '/es-mx/calculadora-vacaciones/', expected: '12 días' },
    { path: '/es-mx/calculadora-aguinaldo/', expected: '$6,730.01' },
  ];
  for (const c of cases) {
    test(c.path, async ({ page }) => {
      await page.goto(c.path);
      const href = await page.getByRole('link', { name: 'Abrir en la calculadora' }).first().getAttribute('href');
      await page.goto(href as string);
      await expect(headline(page)).toHaveText(c.expected);
    });
  }
});

test.describe('finiquito y liquidación', () => {
  test('changing the cause changes the rights', async ({ page }) => {
    await page.goto('/es-mx/calculadora-finiquito/?s=15000&i=2023-03-01&f=2026-10-15');
    const table = page.locator('#finiquito-desglose');
    await expect(table).not.toContainText('Indemnización de 3 meses');
    await page.getByRole('radio', { name: /Despido injustificado/ }).check({ force: true });
    await expect(table).toContainText('Indemnización de 3 meses');
    await expect(table).toContainText('Prima de antigüedad');
    await expect(table).not.toContainText('20 días por año');
    await page.getByRole('switch', { name: 'Incluir 20 días por año' }).check({ force: true });
    await expect(table).toContainText('20 días por año');
  });

  test('refuses dates without published official values', async ({ page }) => {
    await page.goto('/es-mx/calculadora-finiquito/?s=15000&i=2023-03-01&f=2027-03-01');
    await expect(page.getByText('Todavía no hay valores oficiales publicados para esa fecha').first()).toBeVisible();
  });
});

test.describe('theme', () => {
  test('toggle switches and remembers the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es-mx/');
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('privacy', () => {
  test('a calculation makes no network requests', async ({ page }) => {
    await page.goto('/es-mx/calculadora-liquidacion/');
    await page.waitForLoadState('networkidle');
    const requests: string[] = [];
    page.on('request', (r) => {
      // Data can only leave through script-initiated requests or URLs; static assets like the
      // favicon are fetched by the browser itself and carry nothing typed by the person.
      if (['fetch', 'xhr', 'websocket', 'eventsource', 'ping'].includes(r.resourceType()) || r.url().includes('22000'))
        requests.push(r.url());
    });
    await page.getByLabel('Tu salario').fill('22000');
    await page.getByRole('radio', { name: /Dejé el trabajo/ }).check({ force: true });
    await expect(page.locator('#liquidacion-desglose')).toBeVisible();
    await page.waitForTimeout(500);
    expect(requests).toEqual([]);
  });

  test('loads no third-party resources', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (r) => hosts.add(new URL(r.url()).host));
    await page.goto('/es-mx/calculadora-aguinaldo/?s=15000');
    await page.waitForLoadState('networkidle');
    expect([...hosts]).toEqual(['localhost:4321']);
  });
});
