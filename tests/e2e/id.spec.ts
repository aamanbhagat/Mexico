import type { Page } from '@playwright/test';
import { FIXED_TODAY_WIB, ROUTES, expect, test } from './fixtures';

const headline = (page: Page) => page.locator('.result-head__amount');

async function fillDate(page: Page, legend: string, d: string, m: string, y: string, nth = 0) {
  const group = page.getByRole('group', { name: legend }).nth(nth);
  await group.getByLabel('Tanggal', { exact: true }).fill(d);
  await group.getByLabel('Bulan').selectOption({ label: m });
  await group.getByLabel('Tahun').fill(y);
}

test('home heading and today panel stay put while the web font loads', async ({ page }) => {
  let releaseFont: () => void = () => {};
  const fontGate = new Promise<void>((resolve) => (releaseFont = resolve));
  await page.route('**/*.woff2', async (route) => {
    await fontGate;
    await route.continue();
  });

  await page.goto('/id/', { waitUntil: 'domcontentloaded' });
  const lines = () =>
    page.locator('h1').evaluate((heading) => {
      const computed = getComputedStyle(heading);
      return Math.round(heading.getBoundingClientRect().height / Number.parseFloat(computed.lineHeight));
    });
  const panelTop = () => page.locator('.home-today').evaluate((panel) => panel.getBoundingClientRect().top);

  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await lines()).toBe(3);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const before = await panelTop();

  releaseFont();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.locator('h1').evaluate((heading) => {
      const family = getComputedStyle(heading).fontFamily.split(',')[0]?.trim();
      return family
        ? document.fonts.check(`800 32px ${family}`) &&
            [...document.fonts].some((font) => font.family === family && font.status === 'loaded')
        : false;
    }),
  ).toBe(true);
  expect(Math.abs((await panelTop()) - before)).toBeLessThan(1);
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await lines()).toBe(3);
  }
});

test.describe('cek weton', () => {
  test('17 Agustus 1945 is Jumat Legi, neptu 11, 9 Pasa 1876 (same as the worked example)', async ({ page }) => {
    await page.goto('/id/weton/');
    await expect(page.locator('.result-head__empty')).toContainText('Masukkan tanggal lahir');
    await fillDate(page, 'Tanggal lahir', '17', 'Agustus', '1945');
    await expect(headline(page)).toHaveText('Jumat Legi');
    await expect(page.locator('.weton-formula')).toContainText('= Jumat 6 + Legi 5');
    await expect(page.locator('.weton-facts')).toContainText('9 Pasa 1876');
    await expect(page.locator('.weton-facts')).toContainText('Manahil');
    // Outside the Kemenag table the Hijri date is flagged as an estimate.
    await expect(page.locator('.weton-facts')).toContainText('≈ 8 Ramadan 1364 H');
    await expect(page.locator('.selapan td[aria-current="true"]')).toHaveText(/11/);
    await expect(page).toHaveURL(/t=1945-08-17/);
    await page.reload();
    await expect(headline(page)).toHaveText('Jumat Legi');
  });

  test('explains an impossible date instead of guessing', async ({ page }) => {
    await page.goto('/id/weton/');
    await fillDate(page, 'Tanggal lahir', '31', 'Februari', '1990');
    await expect(page.locator('.result-head__empty')).toBeVisible();
    await fillDate(page, 'Tanggal lahir', '1', 'Januari', '1890');
    await expect(page.locator('.field__error')).toHaveText('Kami menghitung tanggal 1 Januari 1900 sampai 31 Desember 2100.');
  });

  test('quick fill and the Aboge note', async ({ page }) => {
    await page.goto('/id/weton/');
    await page.getByRole('button', { name: '17 Agustus 1945' }).click();
    await expect(headline(page)).toHaveText('Jumat Legi');
    await page.goto('/id/weton/?t=2026-10-13');
    await expect(headline(page)).toHaveText('Selasa Pon');
    await expect(page.locator('.weton-result').getByText('Komunitas Aboge')).toContainText('29 Bakdamulud 1960');
    await expect(page.getByRole('link', { name: /Tanggal Selasa Pon berikutnya/ })).toHaveAttribute('href', '/id/weton/selasa-pon/');
  });

  test('keeps a date typed before the calculator finished loading', async ({ page }) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    await page.route('**/_astro/*.js', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/id/weton/', { waitUntil: 'domcontentloaded' });
    await fillDate(page, 'Tanggal lahir', '17', 'Agustus', '1945');
    release();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(headline(page)).toHaveText('Jumat Legi');
  });

  test('computes on the device: no request carries the date', async ({ page }) => {
    await page.goto('/id/weton/');
    await page.waitForLoadState('networkidle');
    const requests: string[] = [];
    page.on('request', (r) => {
      if (['fetch', 'xhr', 'websocket', 'eventsource', 'ping'].includes(r.resourceType()) || r.url().includes('1945'))
        requests.push(r.url());
    });
    await fillDate(page, 'Tanggal lahir', '17', 'Agustus', '1945');
    await expect(headline(page)).toHaveText('Jumat Legi');
    await page.waitForTimeout(400);
    expect(requests).toEqual([]);
  });
});

test.describe('weton jodoh', () => {
  test('kumparan example: Selasa Legi + Minggu Pahing = 22 → Padu (sisa 8), Dana (sisa 5)', async ({ page }) => {
    await page.goto('/id/weton/jodoh/?ma=weton&wa=selasa-legi&mb=weton&wb=minggu-pahing');
    await expect(headline(page)).toHaveText('Padu');
    await expect(page.locator('.result-head__note')).toContainText('8 + 14 = 22');
    const table = page.locator('.jodoh-table tbody tr');
    await expect(table).toHaveCount(4);
    await page.getByRole('radio', { name: 'Sisa 5' }).check({ force: true });
    await expect(headline(page)).toHaveText('Dana');
    await expect(page).toHaveURL(/m=sisa-5/);
    await expect(page.locator('.jodoh-table tr.highlight-row')).toContainText('Dana');
  });

  test('from two birth dates', async ({ page }) => {
    await page.goto('/id/weton/jodoh/');
    await expect(page.locator('.result-head__empty')).toBeVisible();
    await fillDate(page, 'Tanggal lahir', '17', 'Agustus', '1945', 0);
    await fillDate(page, 'Tanggal lahir', '13', 'Oktober', '2026', 1);
    // Jumat Legi (11) + Selasa Pon (10) = 21; 21 ÷ 8 sisa 5 = Tinari.
    await expect(headline(page)).toHaveText('Tinari');
    await expect(page.locator('#jodoh-hitungan')).toContainText('21 ÷ 8 = 2 sisa 5');
  });

  test('a remainder of 0 counts as the divisor (Pesthi)', async ({ page }) => {
    await page.goto('/id/weton/jodoh/?ma=weton&wa=jumat-kliwon&mb=weton&wb=minggu-legi');
    await expect(headline(page)).toHaveText('Pesthi');
    await expect(page.locator('#jodoh-hitungan')).toContainText('sisa 0 dihitung 8');
  });
});

test.describe('weton hari ini is never stale', () => {
  test('shows the weton of today in WIB, whatever day the HTML was built', async ({ page }) => {
    // FIXED_NOW (13 Oct 12:00 in Mexico City) is already 14 Oct in Jakarta.
    await page.goto('/id/weton/hari-ini/');
    await expect(page.locator('.today')).toHaveAttribute('data-today', FIXED_TODAY_WIB);
    await expect(page.locator('.today__weton')).toHaveText('Rabu Wage');
    await expect(page.locator('.today__tonight')).toContainText('malam Kamis Kliwon');
  });

  test('switches at midnight WIB', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-13T23:59:00+07:00'));
    await page.goto('/id/weton/hari-ini/');
    await expect(page.locator('.today__weton')).toHaveText('Selasa Pon');
    await page.clock.setFixedTime(new Date('2026-10-14T00:01:00+07:00'));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.locator('.today__weton')).toHaveText('Rabu Wage');
  });
});

test.describe('weton pages', () => {
  test('marks the next date of the weton on the visitor clock', async ({ page }) => {
    await page.goto('/id/weton/jumat-kliwon/');
    const next = page.locator('.weton-dates tr.highlight-row');
    await expect(next).toHaveAttribute('data-iso', '2026-10-30');
    await expect(next).toContainText('berikutnya');
    await expect(page.locator('[data-next-weton]')).toHaveText('Jumat, 30 Oktober 2026');
  });

  test('shows a sourced note only where one exists', async ({ page }) => {
    await page.goto('/id/weton/selasa-kliwon/');
    await expect(page.getByText('Anggara Kasih atau Anggoro Kasih')).toBeVisible();
    await page.goto('/id/weton/senin-pon/');
    await expect(page.getByText('Anggara Kasih')).toHaveCount(0);
  });
});

test.describe('kalender Jawa', () => {
  test('marks today, opens a day and prints', async ({ page }) => {
    await page.goto('/id/kalender-jawa/2026/oktober/');
    const today = page.locator(`td.kal-day[data-iso="${FIXED_TODAY_WIB}"]`);
    await expect(today).toHaveClass(/kal-day--today/);
    await expect(today.locator('button')).toHaveAttribute('aria-current', 'date');

    await page.locator('td[data-iso="2026-10-30"] button').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Jumat Kliwon, neptu 14');
    await expect(dialog).toContainText('18 Jumadilawal 1960');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await page.evaluate(() => {
      (window as unknown as { printed: boolean }).printed = false;
      window.print = () => {
        (window as unknown as { printed: boolean }).printed = true;
      };
    });
    await page.getByRole('button', { name: 'Cetak kalender' }).click();
    expect(await page.evaluate(() => (window as unknown as { printed: boolean }).printed)).toBe(true);
  });

  test('each day has a full spoken label and 1 Suro 1961 is on 6 June 2027', async ({ page }) => {
    await page.goto('/id/kalender-jawa/2027/juni/');
    const day = page.locator('td[data-iso="2027-06-06"] button');
    await expect(day).toHaveAccessibleName(
      'Minggu 6 Juni 2027, Wage, tanggal Jawa 1 Suro 1961, Hijriah 1 Muharam 1449, Tahun Baru Islam 1449 H, 1 Suro, Tahun Baru Jawa',
    );
    await expect(page.locator('td[data-iso="2027-06-06"]')).toHaveClass(/kal-red/);
  });

  test('keyboard: one Tab stop per month, arrows move between days', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow is a desktop concern');
    await page.goto('/id/kalender-jawa/2026/oktober/');
    const today = page.locator(`td[data-iso="${FIXED_TODAY_WIB}"] button`);
    await expect(today).toHaveAttribute('tabindex', '0');
    expect(await page.locator('.kal-day__btn[tabindex="0"]').count()).toBe(1);
    await today.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('td[data-iso="2026-10-15"] button')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('td[data-iso="2026-10-22"] button')).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.locator('td[data-iso="2026-10-31"] button')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toContainText('Sabtu, 31 Oktober 2026');
  });

  test('holidays from the SKB are red and listed', async ({ page }) => {
    await page.goto('/id/kalender-jawa/2027/maret/');
    await expect(page.locator('td[data-iso="2027-03-10"]')).toHaveClass(/kal-red/);
    await expect(page.locator('.kal-notes')).toContainText('Idulfitri 1448 H');
  });

  test('the year page lazily renders months below the fold but prints them all', async ({ page }) => {
    await page.goto('/id/kalender-jawa/2027/');
    expect(await page.locator('.kal-month').count()).toBe(12);
    const cv = await page
      .locator('.kal-month')
      .nth(5)
      .evaluate((el) => getComputedStyle(el).contentVisibility);
    expect(cv).toBe('auto');
    await page.emulateMedia({ media: 'print' });
    expect(
      await page
        .locator('.kal-month')
        .nth(5)
        .evaluate((el) => getComputedStyle(el).contentVisibility),
    ).toBe('visible');
    await expect(page.locator('.site-header')).toBeHidden();
  });
});

test.describe('layout', () => {
  test('no page scrolls sideways on a 390 px phone', async ({ page, isMobile }) => {
    test.skip(!isMobile);
    for (const route of ROUTES) {
      await page.goto(route.path);
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw, route.path).toBeLessThanOrEqual(cw);
    }
  });
});
