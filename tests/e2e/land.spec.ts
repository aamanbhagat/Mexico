import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** BR-01 land-unit converter: conversion, state-aware values, divergence, price, URL state. */
const HUB = '/pt-br/conversor-alqueire-hectare/';
const headline = (page: Page) => page.locator('.calc__result .result-head__amount .sr-only');
const fromSelect = (page: Page) => page.getByLabel('Medida', { exact: true });

test.describe('alqueire converter', () => {
  test('answers the head query on load: 1 alqueire paulista = 2,42 ha', async ({ page }) => {
    await page.goto(HUB);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(headline(page)).toHaveText('2,42 ha');
    await expect(page.locator('.unit-card')).toContainText('Alqueire paulista: 24.200 m²');
    await expect(page.locator('.unit-card')).toContainText('50 × 100 braças');
    await expect(page.locator('.unit-card a')).toHaveAttribute('href', /iea\.agricultura\.sp\.gov\.br/);
  });

  test('reads Brazilian numbers and keeps the state in the URL', async ({ page }) => {
    await page.goto(HUB);
    await page.getByLabel('Área').fill('2,5');
    await expect(headline(page)).toHaveText('6,05 ha');
    await expect(page).toHaveURL(/q=2\.5/);
    await page.getByLabel('Área').fill('1.234,5');
    await expect(headline(page)).toHaveText('2.987,49 ha');
    await expect(page).toHaveURL(/q=1234\.5/);
    await page.reload();
    await expect(headline(page)).toHaveText('2.987,49 ha');
    await expect(page.getByLabel('Área')).toHaveValue('1.234,5');
  });

  test('choosing a state switches to its alqueire and flags disagreement', async ({ page }) => {
    await page.goto(HUB);
    await page.getByLabel('Estado do imóvel').selectOption('BA');
    await expect(fromSelect(page)).toHaveValue('alqueire-baiano');
    await expect(headline(page)).toHaveText('9,68 ha');
    const notice = page.getByRole('group', { name: /Valores de alqueire na Bahia/ });
    await expect(notice).toContainText('Na Bahia as fontes não concordam sobre o alqueire');
    await notice.getByRole('button', { name: /Alqueire mineiro ou goiano/ }).click();
    await expect(headline(page)).toHaveText('4,84 ha');
    await expect(page).toHaveURL(/de=alqueire-mineiro/);
    await expect(notice.getByRole('button', { name: /Alqueire mineiro ou goiano/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('does not pick a value where sources tie (Mato Grosso)', async ({ page }) => {
    await page.goto(HUB);
    await page.getByLabel('Estado do imóvel').selectOption('MT');
    // No default for MT: the unit stays as chosen and both values are offered.
    await expect(fromSelect(page)).toHaveValue('alqueire-paulista');
    const notice = page.getByRole('group', { name: /Valores de alqueire em Mato Grosso/ });
    await expect(notice.getByRole('button')).toHaveCount(2);
  });

  test('says when a state has no record of the unit', async ({ page }) => {
    await page.goto(`${HUB}?uf=RS`);
    await expect(page.locator('.unit-card')).toContainText('Não encontramos registro de alqueire no Rio Grande do Sul');
    await expect(page.locator('.unit-card')).toContainText('quadra gaúcha');
  });

  test('swaps direction and converts hectares into alqueires', async ({ page }) => {
    await page.goto(`${HUB}?q=50`);
    await page.getByRole('button', { name: /^Inverter/ }).click();
    await expect(fromSelect(page)).toHaveValue('ha');
    await expect(headline(page)).toHaveText('20,6612 alq.');
    await expect(page.locator('.conv-formula')).toContainText('Arredondado na 4ª casa decimal');
  });

  test('normalises a price per alqueire to per hectare', async ({ page }) => {
    await page.goto(HUB);
    await page.getByLabel('Preço pedido').fill('72.600');
    await expect(page.locator('.price__headline .sr-only')).toHaveText('R$ 30.000,00');
    // The same price per alqueire mineiro (twice the area): 72.600 × 48.400 ÷ 24.200.
    const row = page.locator('.price tbody tr', { hasText: 'por alqueire mineiro ou goiano' });
    await expect(row).toContainText(/R\$\s145\.200,00/);
  });

  test('worked examples open the converter on the same figure', async ({ page }) => {
    await page.goto(HUB);
    const href = await page.getByRole('link', { name: 'Abrir no conversor' }).first().getAttribute('href');
    await page.goto(href as string);
    await expect(headline(page)).toHaveText('7,26 ha');
  });

  test('keeps what was typed before the converter finished loading', async ({ page }) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    await page.route('**/_astro/*.js', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(HUB, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Área').fill('3');
    release();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(headline(page)).toHaveText('7,26 ha');
  });

  test('copies a plain-text summary with the source', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`${HUB}?q=3`);
    await page.getByRole('button', { name: 'Copiar' }).click();
    await expect(page.getByText('Resultado copiado')).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('3 alqueires paulistas = 7,26 hectares');
    expect(text).toContain('Fonte: Instituto de Economia Agrícola');
  });

  test('prints only the state table from its button', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { printed: string[] }).printed = [];
      window.print = () => {
        const target = document.querySelector('[data-print-target]');
        (window as unknown as { printed: string[] }).printed.push(
          `${document.documentElement.dataset['print']}:${target?.querySelector('h2')?.id ?? ''}`,
        );
      };
    });
    await page.goto(HUB);
    await page.locator('#tabela-por-estado').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Imprimir tabela' }).first().click();
    expect(await page.evaluate(() => (window as unknown as { printed: string[] }).printed)).toEqual(['tabela:tabela-por-estado']);
  });

  test('a conversion makes no network requests', async ({ page }) => {
    await page.goto(HUB);
    await page.waitForLoadState('networkidle');
    const requests: string[] = [];
    page.on('request', (r) => {
      if (['fetch', 'xhr', 'websocket', 'eventsource', 'ping'].includes(r.resourceType()) || r.url().includes('9876'))
        requests.push(r.url());
    });
    await page.getByLabel('Área').fill('9876');
    await page.getByLabel('Estado do imóvel').selectOption('GO');
    await expect(headline(page)).toHaveText('47.799,84 ha');
    await page.waitForTimeout(500);
    expect(requests).toEqual([]);
  });

  test('keeps the answer on screen on phones', async ({ page, isMobile }) => {
    test.skip(!isMobile);
    await page.goto(`${HUB}?q=3`);
    const bar = page.locator('.result-bar');
    await expect(bar).toBeInViewport();
    await expect(bar).toContainText('7,26 ha');
  });
});

test.describe('pt-BR chrome', () => {
  test('skip link and theme toggle speak Portuguese', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/pt-br/');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeAttached();
    await page.getByRole('button', { name: 'Mudar para o tema escuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Mudar para o tema claro' })).toBeVisible();
  });

  test('the sub-pages open on their own unit', async ({ page }) => {
    const cases = [
      ['/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/', '4,84 ha'],
      ['/pt-br/conversor-alqueire-hectare/alqueire-baiano/', '9,68 ha'],
      ['/pt-br/conversor-alqueire-hectare/alqueire-do-norte/', '2,7225 ha'],
      ['/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/', '0,4356 ha'],
      ['/pt-br/conversor-alqueire-hectare/litro-de-terra/', '605 m²'],
      ['/pt-br/hectare-para-alqueire/', '0,4132 alq.'],
    ] as const;
    for (const [path, expected] of cases) {
      await page.goto(path);
      await expect(headline(page), path).toHaveText(expected);
    }
  });
});
