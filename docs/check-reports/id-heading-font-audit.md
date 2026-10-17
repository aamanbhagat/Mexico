# Indonesian heading font audit

Measured 17 October 2026 on `fix/id-heading-font`, from the merged `main` baseline. Browser:
`mcr.microsoft.com/playwright:v1.64.0-noble` (Chromium). The site is built with Node 22 and
`SITE_URL=https://ci.tabula.test`. Measurements below use the same page and viewport in the pinned
browser before and after the change; no text or performance budget changed.

## Screenshot font state

- Before: computed `/id/` h1 `font-family` was
  `Archivo-46be7db781805e41, "Archivo-46be7db781805e41 fallback: Arial", Arial, sans-serif, Archivo, Arial, sans-serif`.
  `document.fonts.check('800 32px "Archivo-46be7db781805e41"')` returned `true` after load;
  Chromium reported **Archivo SemiBold** as the actual rendered face. The hash changes when Astro's
  font configuration changes; after the fix, the computed family begins
  `Archivo-a05c6e1e46584551, "Archivo Fallback", Arial, sans-serif` and the corresponding
  `document.fonts.check()` is also `true`.
- The only `toHaveScreenshot` call is in `tests/e2e/visual.spec.ts`, after both `networkidle` and
  `document.fonts.ready`. `scripts/screenshots.mjs` also waits for `document.fonts.ready`. Playwright
  additionally reports `waiting for fonts to load... fonts loaded` while taking screenshots.
- The font is already preloaded in `src/layouts/BaseLayout.astro`. Previously, Astro generated a
  normal-width fallback with `src: local("Arial")`, which is not installed in the pinned image;
  Chromium instead rendered Liberation Sans without matching the expanded 118% Archivo headings.
  The screenshot itself was **not** captured before the web font loaded.

## Cold-cache mobile CLS

Each Lighthouse CLI run starts fresh with storage reset. Default mobile emulation: 412 × 823,
simulated 150 ms RTT, ~1,638 kbps, 4× CPU slowdown. The 390 × 844 runs use the same settings with
only the viewport changed. The five CLS values, in chronological order:

| Viewport | Before (runs 1–5) | Before median | After (runs 1–5) | After median |
| --- | --- | ---: | --- | ---: |
| Default mobile | 0, 0, 0, 0, 0 | 0 | 0, 0, 0, 0, 0 | 0 |
| 390 × 844 | 0, 0, 0, 0, 0 | 0 | 0, 0, 0, 0, 0 | 0 |

The preloaded font arrived before first paint in those local Lighthouse runs, so Lighthouse's zero
does **not** prove a slow font can never shift a real visitor's page. In a pinned-browser cold
context with the `.woff2` artificially delayed 1,500 ms, the original heading went from three to
four lines and moved the “Hari ini” panel down **34.21875 px**. Observed CLS was
**0.030052646125942297** before and **0.0004762121764491433** after. After the fix the panel top
was **396.34375 px before and after the swap**; the remaining tiny shift is horizontal header
text. The regression test blocks the font request and asserts the panel stays put.

## Heading lines

The existing global `text-wrap: balance` already applied. The mobile `/id/` h1 keeps its copy,
Archivo face, weight and size; using its normal 100% width axis through 430 px restores a consistent
three-line heading. Line counts with the font loaded:

| Width | Before | After | After, font still loading |
| ---: | ---: | ---: | ---: |
| 360 px | 5 | 3 | 3 |
| 390 px | 4 | 3 | 3 |
| 430 px | 3 | 3 | 3 |

## Other headings at 390 px

We compared the h1 on **all 81 sitemap URLs** in the pinned browser with the loaded Archivo and
the fallback. The table includes all **45** URLs whose loaded line count differed from Astro's
generated adjusted Arial fallback *before* the fix. **40** of them (the rows where “Linux
fallback” differs from “Archivo”) also differed from the actual unadjusted Liberation Sans
fallback on the pinned Linux image. Five rows matched with Liberation Sans but would mismatch
with the generated adjusted Arial face on hosts where Arial exists.
The only other built HTML files are the root redirect (no h1) and `/404.html` (two lines with
loaded Archivo and with either fallback at 390 px).

| URL | Archivo | Linux fallback | Generated Arial fallback |
| --- | ---: | ---: | ---: |
| `/es-mx/` | 4 | 3 | 3 |
| `/id/` | 4 | 3 | 3 |
| `/es-mx/calculadora-prima-vacacional/` | 3 | 3 | 2 |
| `/es-mx/calculadora-vacaciones/` | 3 | 2 | 2 |
| `/pt-br/conversor-alqueire-hectare/` | 3 | 2 | 2 |
| `/pt-br/conversor-alqueire-hectare/alqueire-mineiro-goiano/` | 3 | 2 | 2 |
| `/pt-br/conversor-alqueire-hectare/alqueire-do-norte/` | 3 | 2 | 2 |
| `/pt-br/conversor-alqueire-hectare/tarefa-em-hectare/` | 2 | 1 | 1 |
| `/pt-br/conversor-alqueire-hectare/litro-de-terra/` | 3 | 2 | 2 |
| `/pt-br/hectare-para-alqueire/` | 2 | 2 | 1 |
| `/id/weton/jodoh/` | 2 | 1 | 1 |
| `/id/weton/minggu-legi/` | 2 | 1 | 1 |
| `/id/weton/minggu-pahing/` | 2 | 2 | 1 |
| `/id/weton/minggu-pon/` | 2 | 1 | 1 |
| `/id/weton/minggu-wage/` | 2 | 1 | 1 |
| `/id/weton/minggu-kliwon/` | 2 | 2 | 1 |
| `/id/weton/senin-legi/` | 2 | 1 | 1 |
| `/id/weton/senin-pahing/` | 2 | 1 | 1 |
| `/id/weton/senin-wage/` | 2 | 1 | 1 |
| `/id/weton/senin-kliwon/` | 2 | 1 | 1 |
| `/id/weton/selasa-legi/` | 2 | 1 | 1 |
| `/id/weton/selasa-pahing/` | 2 | 2 | 1 |
| `/id/weton/selasa-pon/` | 2 | 1 | 1 |
| `/id/weton/selasa-wage/` | 2 | 1 | 1 |
| `/id/weton/selasa-kliwon/` | 2 | 1 | 1 |
| `/id/weton/rabu-pahing/` | 2 | 1 | 1 |
| `/id/weton/rabu-wage/` | 2 | 1 | 1 |
| `/id/weton/rabu-kliwon/` | 2 | 1 | 1 |
| `/id/weton/kamis-legi/` | 2 | 1 | 1 |
| `/id/weton/kamis-pahing/` | 2 | 1 | 1 |
| `/id/weton/kamis-pon/` | 2 | 1 | 1 |
| `/id/weton/kamis-wage/` | 2 | 1 | 1 |
| `/id/weton/kamis-kliwon/` | 2 | 1 | 1 |
| `/id/weton/jumat-legi/` | 2 | 1 | 1 |
| `/id/weton/jumat-pahing/` | 2 | 1 | 1 |
| `/id/weton/jumat-pon/` | 2 | 1 | 1 |
| `/id/weton/jumat-wage/` | 2 | 1 | 1 |
| `/id/weton/jumat-kliwon/` | 2 | 1 | 1 |
| `/id/weton/sabtu-legi/` | 2 | 1 | 1 |
| `/id/weton/sabtu-pahing/` | 2 | 1 | 1 |
| `/id/weton/sabtu-pon/` | 2 | 1 | 1 |
| `/id/weton/sabtu-wage/` | 2 | 1 | 1 |
| `/id/weton/sabtu-kliwon/` | 2 | 1 | 1 |
| `/id/kalender-jawa/2026/` | 4 | 3 | 3 |
| `/id/kalender-jawa/2027/` | 4 | 3 | 3 |

With an explicitly matched Arial/Liberation fallback (102.2878% normal and 128% expanded), the
remaining mismatches at 390 px are **three**:

| URL | Loaded | Fallback |
| --- | ---: | ---: |
| `/es-mx/calculadora-vacaciones/` | 3 | 2 |
| `/id/weton/senin-pon/` | 1 | 2 |
| `/id/weton/rabu-legi/` | 1 | 2 |

The last two were not in the original mismatch set; they straddle a single-line wrap threshold
under the new expanded fallback. They do not change the loaded/screenshot design, but can still
shift on an unusually slow font load. This audit records them for targeted follow-up instead of
silently claiming the fallback is exact on every route.

## Visual baselines

Only `tests/e2e/__screenshots__/mobile/id-light.png` and
`tests/e2e/__screenshots__/mobile/id-dark.png` changed. The review compared the actual screenshots
and diff images before regenerating: all text and controls remain, the heading becomes three lines
and the content beneath moves up by its removed line. All 92 pinned-browser visual tests pass; no
other baseline or budget was changed.

## Local quality gate

`npm run check` passed all eight steps on Node 22.23.3 for code commit `b6ae34d`:
237 unit/golden tests, 611 Playwright tests passed (95 existing skips), 92 visual snapshots passed,
and 72 Lighthouse runs passed the unchanged budgets. The full transcript and timestamped per-step
summary are in `docs/check-reports/fix-id-heading-font-b6ae34d.log`. GitHub Actions remains
unavailable due to account billing, so this local run is the quality gate.
