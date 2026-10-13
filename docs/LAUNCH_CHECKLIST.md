# Launch checklist — MX-01 (es-MX payroll-payout suite)

Status on 13 Oct 2026: the site builds, `npm run check` passes and every page meets the CLAUDE.md
budgets, but **it must not go live until the blocking items below are done**. Aguinaldo demand
peaks in November–December, so aim to finish the blocking items by mid-November.

Legend: 🔴 blocking · 🟡 before promotion · ⚪ after launch

---

## 1. Legal and tax review (🔴 blocking)

Hire a Mexican labour lawyer and a payroll accountant (contador) to review the engine, the copy and
the worked examples. When a page passes, record the reviewer in `src/data/reviews.json`
(`status`, `reviewer`, `credentials`, `reviewed_on`); the badge on the page changes by itself.
The badge treats a "reviewed" entry without a name and date as pending, so it cannot be faked.

Questions for the **labour lawyer** (LFT):

1. **Prima de antigüedad cap: salario mínimo or UMA?** We cap at 2 × salario mínimo of the zone
   (art. 486, literal text; tesis aislada registro digital 2016514 per secondary sources — the SJF
   page could not be opened from the build environment). Several competitors cap at 2 UMA. The
   calculator offers a "compare with 2 UMA" switch but defaults to salario mínimo. Confirm, and
   cite the current jurisprudence. Parameter: `mx.lft.prima-antiguedad-tope-base`.
2. **20 días por año (art. 50 fr. II):** we include them for rescisión imputable al patrón
   (arts. 51–52) always, and for despido injustificado only when the person switches them on
   (employer refuses reinstatement, art. 49). Confirm this default and the on-page explanation.
3. **Prima de antigüedad base salary:** we use the integrated daily salary, clamped between 1 and
   2 salarios mínimos (arts. 162, 485, 486). Confirm integrated vs. cuota diaria.
4. **Mutuo acuerdo (art. 53 fr. I):** treated like renuncia (prima de antigüedad only with ≥ 15
   years). Confirm.
5. **Proportional years:** prima de antigüedad and 20 días por año use exact fractional years
   (completed years + days into the current year ÷ length of that year). Confirm.
6. **Vacation entitlement at separation:** proportional days of the *current* service year
   (art. 79) plus pending days entered by the person; the current year uses the post-2023 table.
   Confirm the transition rule for vacation years that started before 1 Jan 2023.
7. **Aguinaldo divisor:** proportional aguinaldo uses 365 days (PROFEDET/INADEM practice; the LFT
   does not state it). Confirm, and whether leap years should use 366.
8. **Fortnightly salary ÷ 15:** art. 89 only mentions week ÷ 7 and month ÷ 30.
9. **Copy claims** to confirm: art. 516 (one-year limitation for benefits), art. 518 (two months
   to act after a dismissal), art. 48 (salarios vencidos up to 12 months), arts. 78, 79, 81
   (continuous 12 days, no cash-out while employed, six months to grant vacation), and that no
   2026 reform changed art. 87 (aguinaldo) or art. 76 (vacations). The 40-hour-week reform
   (DOF 1 May 2026) does not change these calculations but should be mentioned once in force.
10. **Disclaimer wording** on every page (`src/layouts/CalculatorLayout.astro`).

Questions for the **payroll accountant** (LISR):

1. **ISR method.** We estimate withholding as the ISR attributable to the payment: tariff tax of
   (ordinary monthly salary + taxable part) minus tariff tax of the ordinary salary (art. 96), with
   the art. 174 RLISR option for aguinaldo and prima vacacional. The subsidio para el empleo is
   not subtracted. Confirm this is the right "estimate" to show to employees.
2. **Monthly ordinary salary:** entered monthly salary as is; fortnightly × 2; daily or weekly
   salary → daily × 30.4. Confirm.
3. **Separation payments (art. 96 penúltimo párrafo / art. 95):** taxable indemnización ≥ last
   ordinary monthly salary → taxed at that salary's effective tariff rate (no subsidy); otherwise
   added to the month's income. Confirm, including which concepts enter (we include 90 días,
   20 días por año and prima de antigüedad; not aguinaldo/vacaciones).
4. **Exemption counting:** 90 UMA × years, with "more than six months" rounding up (art. 93
   fr. XIII); 30 UMA for aguinaldo and 15 UMA for prima vacacional per calendar year, not
   prorated in a finiquito. Confirm.
5. **Salario pendiente** in a finiquito taxed at the effective rate of the monthly salary. Confirm.
6. Review every ISR figure in `src/content/es-mx/examples.ts` (they have no published counterpart).

## 2. Parameters still marked `verified: false` (🔴 blocking)

The build environment could not open dof.gob.mx, sat.gob.mx, inegi.org.mx or diputados.gob.mx
(egress policy), so **every value is corroborated but none is verified** against the primary
document. For each row: open the source, compare the value, then set `verified: true` in the JSON
file (the pages show the state, so the "Pendiente" labels disappear on their own).
Regenerate this table with `npm run params:report -- --unverified`.

| Parameter (file in `src/data/parameters/mx/`) | Version | Value | What to check |
|---|---|---|---|
| `uma.json` | 2026-02-01 → 2027-01-31 | 117.31 / 3,566.22 / 42,794.64 | DOF 09/01/2026 (código 5778072) |
| `uma.json` | 2025-02-01 → 2026-01-31 | 113.14 / 3,439.46 / 41,273.52 | DOF 10/01/2025 (código 5746930) |
| `uma.json` | 2024-02-01 → 2025-01-31 | 108.57 / 3,300.53 / 39,606.36 | DOF 10/01/2024 (código 5714085) |
| `salario-minimo-general.json` | 2026 | 315.04 | DOF 09/12/2025 (código 5775534) |
| `salario-minimo-general.json` | 2025 | 278.80 | DOF 19/12/2024 (código 5745678) |
| `salario-minimo-zlfn.json` | 2026 | 440.87 | DOF 09/12/2025 |
| `salario-minimo-zlfn.json` | 2025 | 419.88 | DOF 19/12/2024 |
| `isr-tarifa-mensual.json` | 2026-01-01 → | 11 rows | Anexo 8 RMF 2026, **row by row** (cuota fija values were corroborated by ≥ 3 secondary sources, not by the PDF) |
| `isr-tarifa-mensual.json` | 2023-01-01 → 2025-12-31 | 11 rows | Anexo 8 RMF 2023 (and that 2024/2025 kept it) |
| `subsidio-empleo.json` | Jan 2026 and Feb–Dec 2026 | 15.59 % / 15.02 % of UMA mensual; limit 11,492.66 | Decree DOF 31/12/2025 — exact URL not found; one source says 536.22 instead of 535.65. Display only. |
| `lisr-exenciones.json` | 2016-01-28 → | 30 / 15 / 15 / 90 UMA; > 6 months rounds up | LISR art. 93 fr. XIII–XIV |
| `rlisr-art174.json` | 2015-10-09 → | 365 / 30.4 | RLISR art. 174; also find the direct PDF URL and confirm the effective date |
| `lft-aguinaldo.json` | 1970-05-01 → | 15 days, before 20 Dec, ÷ 365 | LFT art. 87 |
| `lft-vacaciones.json` | 2023-01-01 → and pre-2023 | 12 +2… / 6 +2… | DOF 27/12/2022 and LFT art. 76 |
| `lft-prima-vacacional.json` | 1970-05-01 → | 25 % | LFT art. 80 |
| `lft-separacion.json` | 1970-05-01 → | 90 / 20 / 12 days, 15 years, × 2 cap, ÷ 30/15/7 | LFT arts. 48, 50, 89, 162, 485, 486 |
| `prima-antiguedad-tope.json` | 1970-05-01 → | `salario_minimo` | Legal decision (see §1.1) |

**Calendar duty:** the 2027 salarios mínimos are published in the DOF in December 2026 and the
2027 UMA on ~9 January 2027. Until a new version is added, the calculators refuse dates after
31 Dec 2026 (salario mínimo) and 31 Jan 2027 (UMA) instead of reusing old values — add the new
versions the day they are published (target SLA: 24–72 h, per docs/research/REPORT.md).

## 3. Things only you can do (🔴 blocking unless noted)

1. **Brand and domain.** "Tabula" is a working name (`src/config/site.ts`). Pick the final name,
   check trademarks, buy the domain.
2. **Production origin.** Set `SITE_URL=https://your-domain` in the Cloudflare Pages project
   (and as a GitHub Actions variable `SITE_URL`). Canonical, hreflang, sitemap, robots and OG URLs
   all derive from it; the build warns while it is unset.
3. **Cloudflare Pages.** Create the project from this repo: build command `npm run build`, output
   `dist`, Node 22. `public/_headers` and `public/_redirects` are picked up automatically. Check
   that preview deployments (`*.pages.dev`) answer with `X-Robots-Tag: noindex`; if they do not, add a
   rule so previews are never indexed with production canonicals.
4. **Enable CI.** `.github/workflows/ci.yml` runs `npm run check` on pull requests. Open a PR to see
   the first run. If the visual snapshots differ only because CI's Chromium is newer than the one
   that produced the baselines, run the workflow manually with "update snapshots" and commit the
   artifact (see §6).
5. **Analytics (🟡).** Only cookieless and self-hosted: deploy Umami or Plausible behind the same
   origin (e.g. a Cloudflare route to `/stats/script.js`) and set `PUBLIC_ANALYTICS_SCRIPT_URL`
   (must start with `/`) and `PUBLIC_ANALYTICS_WEBSITE_ID`. Events sent: `calculo`, `copiar`,
   `compartir`, `pdf`, each with the tool name only — never inputs. Third-party URLs are ignored.
6. **Privacy notice (🟡).** Add an "Aviso de privacidad" page (LFPDPPP). The site stores nothing
   server-side; say so, and mention that shared links contain the values typed.
7. **Contact / error-report channel (🟡).** A way for users and HR to report a wrong figure (the
   report's KPI "error reports per 1,000 uses").

## 4. Search Console and indexing (🟡 at launch)

1. Add a **Domain property** for the production domain and a **URL-prefix property for
   `/es-mx/`** (one per locale folder, as the research recommends).
2. Submit `https://<domain>/sitemap.xml`.
3. Request indexing for the six pages in this order: aguinaldo (season), finiquito, liquidación,
   UMA y salario mínimo 2026, prima vacacional, vacaciones.
4. Check *Enhancements*: FAQ, Breadcrumbs (and Dataset for the UMA page) should validate.
5. Inspect one URL with the live test: confirm the canonical is the production URL and the
   `hreflang` es-MX / x-default pair is read.
6. Bing Webmaster Tools: import from Search Console.
7. Track the KPIs in docs/research/REPORT.md §E (days 0–14 indexation; 15–60 impressions and CTR;
   60–120 top-20 for one 1K–10K term, tool completion rate > 40 %).

## 5. Content and SEO follow-ups (⚪)

- Geo-located SERP check for "calculadora aguinaldo", "calculadora finiquito", "calculadora de
  liquidación" (REPORT.md validation item 1).
- Verify PROFEDET still publishes no calculator of its own (REPORT.md validation item).
- Sibling pages from the keyword research: PTU (May peak), prima de antigüedad, SDI, horas extra
  (40-hour reform), "tabla ISR 2026" deep-link anchors.
- Replace the first-draft pictograms with a commissioned set.

## 6. Technical notes for the owner

- `npm run check` = types, lint, format, unit + golden, build, JS budget, Playwright (e2e, axe in
  light/dark, keyboard, visual) and Lighthouse CI. Run it before every merge.
- Visual baselines were produced with Chromium 141 in the build container; CI installs
  Playwright's Chromium 156. A 2 % pixel tolerance usually absorbs the difference; if not,
  refresh the baselines from CI (§3.4) rather than loosening the tolerance.
- Astro is pinned to 7.3.8 (not 5.x): Astro 5.18.2 has open advisories, including a critical RCE
  in image optimisation, fixed only in ≥ 7.2.8.
- Fonts: `scripts/subset-fonts.py` regenerates the Spanish Archivo subset; other locales will need
  their own subset (latin-ext for pl/tr/de; a CJK family for ja).
