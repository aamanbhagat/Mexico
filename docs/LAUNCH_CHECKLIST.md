# Launch checklists

- [MX-01 — es-MX payroll-payout suite](#launch-checklist--mx-01-es-mx-payroll-payout-suite) (sections 1–6)
- [BR-01 — pt-BR land-unit converter](#7-br-01--pt-br-land-unit-converter-pt-br) (section 7)
- [ID-01 — weton and kalender Jawa (/id/)](#launch-checklist--id-01-weton-and-kalender-jawa-id) — **deadline: kalender Jawa
  2027 live and indexable by 15 November 2026**

# Launch checklist — MX-01 (es-MX payroll-payout suite)

Status on 16 Oct 2026: the full local quality gate passes on Node 22 (including 609 passing browser
tests and 24/24 Lighthouse routes); GitHub Actions cannot run while account billing is locked (see
`docs/PLAN.md`).
Every page must meet the AGENTS.md budgets, and **it must not go live until the blocking items below
are done**. Aguinaldo demand
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

1. **Brand and domain (deferred).** "Tabula" is a working name (`src/config/site.ts`). Selecting or
   buying a custom domain is deferred at the owner's request; the Vercel-assigned hostname can be
   used until then.
2. **Production origin.** In **Vercel → Project → Settings → Environment Variables**, set `SITE_URL`
   to the exact public HTTPS origin of the project (the assigned `*.vercel.app` hostname is fine).
   Set it for each environment being built; a missing value or `calculadoras.example` fails the
   build. Canonical, hreflang, sitemap, robots and OG URLs all derive from it. `.env.example`
   documents the variable for local use; CI uses a reserved `.test` origin, never a production URL.
3. **Vercel.** Import this repository as a static Astro project; Node 22, `npm ci`, build command
   `npm run build`, output `dist`. `vercel.json` supplies the 302 root redirect, security headers,
   and immutable/OG caching; HTML uses Vercel's default `public, max-age=0, must-revalidate`.
   Check that preview deployments are blocked from indexing before sharing their URLs; production
   canonical URLs must not cause previews to be indexed as duplicates.
4. **Enable CI.** `.github/workflows/ci.yml` runs `npm run check` on pull requests. Open a PR to see
   the first run. Make visual snapshots with the Playwright Chromium version installed by the
   workflow (`npx playwright install --with-deps chromium`), not a system browser.
   **🔴 Confirmed on 15 Oct 2026:** the latest scheduled run on `main` ended in ~4 s with
   *no runner assigned* (`runner_id: 0`, no steps, no log). GitHub's annotation says the account
   is locked due to a billing issue. Restore Actions billing, then re-run the PR check. Until then
   the local `npm run check` is the only quality gate.
5. **Analytics (🟡).** Only cookieless and self-hosted: deploy Umami or Plausible behind the same
   origin (e.g. a same-origin route to `/stats/script.js`) and set `PUBLIC_ANALYTICS_SCRIPT_URL`
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
- Visual baselines use Playwright 1.64's Chromium 156 headless shell, matching the browser the CI
  workflow installs. Regenerate intended visual changes locally with `npx playwright test
  tests/e2e/visual.spec.ts --update-snapshots`, never by increasing the 2 % pixel tolerance.
- Astro is pinned to 7.3.8 (not 5.x): Astro 5.18.2 has open advisories, including a critical RCE
  in image optimisation, fixed only in ≥ 7.2.8.
- Fonts: `scripts/subset-fonts.py` regenerates the Archivo subset from published locale source;
  future locales may need extended Latin support (pl/tr/de) or a CJK family (ja).


---

# 7. BR-01 — pt-BR land-unit converter (`/pt-br/`)

Status on 13 Oct 2026: nine pages build, `npm run check` passes for MX and BR together, every BR
page meets the AGENTS.md budgets (29 KB JS gzip). **Do not promote it before 7.1–7.3.** The pages
already say on screen that each value's check against the original document is pending, so an
early soft launch is honest; promotion should wait.

## 7.1 Technical review (🔴 before promotion)

Not a legal tool (AGENTS.md §8 does not require a lawyer), but people will use these numbers in
land deals. Hire a licensed **agrimensor/topógrafo** (CREA) with rural-registry experience in at
least two regions (ideally SP/PR and BA or MG). Record the result in `src/data/reviews.json` for
every `br.*` key (`"kind": "technical"`, `status`, `reviewer`, `credentials`, `reviewed_on`); the
"Revisão técnica: pendente" badge changes by itself.

Questions for the reviewer:

1. **Bahia: 9,68 ha or 4,84 ha?** Most current pages call the 100 × 200-braça alqueire (9,68 ha)
   "baiano"; the INDA/MDA table lists the 100 × 100-braça alqueire (4,84 ha) in BA and the 9,68 ha
   one in MG and MT. The converter defaults to 9,68 ha in BA and always shows 4,84 ha next to it.
   Confirm the default, or tell us to remove the default (as for MT).
2. **Mato Grosso:** paulista (2,42 ha, Aegro) vs goiano (4,84 ha, Calculadora Rural). No default
   today. Is there a regional split (north vs Araguaia) we can encode by mesorregião?
3. **Maranhão and Piauí:** do Norte (27.225 m²) vs baiano (96.800 m²). No default today.
4. **Alagoas and Sergipe tarefa:** 3.053 m² (INDA/MDA row 66), 3.052 m² (many pages, UFPE) or
   3.025 m² (25 × 25 braças, UFAL). The default is 3.053 m² with the 25 × 25 shown alongside.
5. **Litro de terra = 605 m² everywhere?** Only one value was found (MG, GO, SP, PR). Any region
   with a different litro (or a "prato") that should be added?
6. **States with no record** (AC, AP, RR, RO, SC, DF): the converter says so instead of guessing.
   One weak page claims RO uses the paulista (24.000 m²); not included.
7. **Quadra de sesmaria (87,12 ha, RS):** only weak sources (blog + content site), consistent with
   the arithmetic; a copy of the INDA table shows a "quadra de sesmaria" of 1.089 ha in MG that we
   could not check.
8. **Native-speaker copy review** of all nine pages (pt-BR editor), especially the FAQ answers.

## 7.2 Unit values still `verified: false` (🔴 before promotion)

The build environment could not open ipeadata.gov.br, biblioteca.ibge.gov.br, gov.br, embrapa.br,
iea.agricultura.sp.gov.br or any other source host (egress policy; only web-search snippets were
readable). Every value below is corroborated by at least one independent source **and** by its
braça arithmetic (the build fails if braças × 2,2² ≠ m²), but none was checked against the
document itself. For each row: open the source, compare, then set `"verified": true` on that unit
in `src/data/parameters/br/land-units.json` (and `"opened": true` on the source). Regenerate with
`npm run params:report -- --unverified`.

**Primary documents to open first:** the Ipeadata PDF
(<https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf>) settles 13 of the 19 rows;
the 1948 IBGE/Ministério da Agricultura book *Unidades agrárias não decimais em uso no Brasil*
(IBGE catalog id 249155; also on archive.org as `unidadesagr1948pes`) lists units **per município**
and should become the per-state source of record.

| Unit | Basis | Value | Verified | Source |
|---|---|---|---|---|
| `ha` | customary | 10000 m² | **no** | [Inmetro — Quadro Geral de Unidades de Medida no Brasil](https://www.gov.br/inmetro/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos-em-metrologia/quadro-geral-de-unidades-de-medida-no-brasil.pdf) |
| `m2` | customary | 1 m² | **no** | [Inmetro — Quadro Geral de Unidades de Medida no Brasil](https://www.gov.br/inmetro/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos-em-metrologia/quadro-geral-de-unidades-de-medida-no-brasil.pdf) |
| `acre` | customary | 4046.8564224 m² | **no** | [NIST Special Publication 811 — Guide for the Use of the International System of Units, Appendix B](https://www.nist.gov/pml/special-publication-811) |
| `alqueire-paulista` | customary | 24200 m² (50 × 100 braças) | **no** | [Instituto de Economia Agrícola (SP) — Informações Econômicas: alqueire paulista (2,42 ha)](https://iea.agricultura.sp.gov.br/ftpiea/IE/2016/ie-0816.pdf) |
| `alqueire-mineiro` | customary | 48400 m² (100 × 100 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — linha 12, Alqueire Mineiro, 100 × 100 braças, 4,84 ha](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `alqueire-baiano` | customary | 96800 m² (100 × 200 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — alqueire de 100 × 200 braças, 9,68 ha](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `alqueire-norte` | customary | 27225 m² (75 × 75 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — alqueire de 75 × 75 braças, 2,72 ha, "todos" os estados](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `alqueirao` | customary | 193600 m² (200 × 200 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — alqueire de 440 × 440 m, 19,36 ha (MG, BA, GO)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `alqueire-50x75` | customary | 18150 m² (50 × 75 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — alqueire de 50 × 75 braças, 1,82 ha (MG, MT)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `alqueire-50x50` | customary | 12100 m² (50 × 50 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — alqueire de 50 × 50 braças, 1,21 ha (SP, MG)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `tarefa-baiana` | customary | 4356 m² (30 × 30 braças) | **no** | [Bolema (SciELO) — Saberes quilombolas: 1 tarefa = 4 quadras de 15 braças = 4.356 m²](https://www.scielo.br/j/bolema/a/LM5VKtbPWQSbVdnFcb5pjZs/?lang=pt) |
| `tarefa-cearense` | customary | 3630 m² | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — linha 67, Tarefa, 3.630 m², 0,36 ha (CE)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `tarefa-al-se` | customary | 3053 m² | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — linha 66, Tarefa, 3.053 m² (AL, SE)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `tarefa-25x25` | customary | 3025 m² (25 × 25 braças) | **no** | [UFAL — questão de concurso: tarefa de 25 × 25 braças (braça de 2,20 m) na região canavieira de Alagoas](https://www.qconcursos.com/questoes-de-concursos/questoes/6b3a0dfdfdb) |
| `litro` | customary | 605 m² | **no** | [Canal Rural — Especialistas mostram como é realizado o processo de medição de terras (1 litro de terra = 605 m²)](https://www.canalrural.com.br/programas/especialistas-mostram-como-realizado-processo-medicao-terras-26577/) |
| `quadra-gaucha` | customary | 17424 m² (60 × 60 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — quadra de 132 × 132 m, ≈ 1,74 ha (RS)](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |
| `quadra-sesmaria` | customary | 871200 m² (60 × 3000 braças) | **no** | [Mário Bento — Começando a entender a minha terra I (quadra de 132 m de frente por 6.600 m de fundo)](https://mariobento.blogspot.com/2010/10/comecando-entender-minha-terra_593.html) |
| `quadra-15` | customary | 1089 m² (15 × 15 braças) | **no** | [Bolema (SciELO) — Saberes quilombolas: 1 quadra tem 15 braças de lado](https://www.scielo.br/j/bolema/a/LM5VKtbPWQSbVdnFcb5pjZs/?lang=pt) |
| `braca2` | customary | 4.84 m² (1 × 1 braças) | **no** | [Tabela de medidas agrárias não decimais (Ministério da Agricultura 1946; INDA 1966) — braça de 2,20 m](https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf) |

Rows to read carefully in the INDA/MDA table: 50 × 50 braças (one copy says SP, MG; another SP,
MS), 50 × 75 (MG, MT), 100 × 200 (MG, MT), 200 × 200 (MG, BA, GO), 75 × 75 ("todos"/"quase
todos"), tarefa rows 66 (AL, SE: hectare column misprinted 0,03) and 67 (CE), quadra 132 × 132 (RS).

## 7.3 Things only you can do (🔴 unless noted)

1. **Brand/domain/SITE_URL** as in §3 — the pt-BR pages share the origin.
2. **Privacy notice in pt-BR (🟡)** — "Aviso de privacidade" under the LGPD: nothing is stored
   server-side; shared links contain the values typed.
3. **Contact for corrections (🟡)** — a "reportar um valor errado" channel; per-state disagreements
   are exactly what users will want to correct.
4. **Fonts (⚪):** the Archivo subset covers every pt-BR letter (ã õ ç â ê ô à) and ² × −. Archivo
   itself has no `≈` (U+2248) glyph, so the "approximately" sign renders in the fallback face
   (Arial/system). It is legible; a designer may prefer a drawn glyph or a different mark.

## 7.4 Search Console and indexing for `/pt-br/` (🟡 at launch)

1. In the existing Domain property, add a **URL-prefix property for `https://<domain>/pt-br/`**
   (one per locale folder, as for `/es-mx/`).
2. The same `/sitemap.xml` lists the nine pt-BR URLs with `hreflang` (`pt-BR` + `x-default`; the two
   locale homes are paired `es-MX`/`pt-BR`). Resubmit it after deploy.
3. Request indexing in this order (volume per the BR-01 keyword file): hub
   `/pt-br/conversor-alqueire-hectare/`, `/pt-br/hectare-para-alqueire/`,
   `…/alqueire-mineiro-goiano/` ("alqueire goiano" 1K–10K), `…/alqueire-paulista/`,
   `…/alqueire-baiano/`, `…/litro-de-terra/`, `…/alqueire-do-norte/`, `…/tarefa-em-hectare/`,
   then `/pt-br/`.
4. URL Inspection → live test on the hub: canonical = production URL; hreflang read; FAQ and
   Breadcrumb rich results valid; WebApplication detected.
5. Performance report filtered to `/pt-br/` and country = Brazil: track the five 1K–10K heads
   (alqueire em hectare, alqueire goiano, alqueire para hectare, hectare para alqueire, quantos
   hectares tem um alqueire) — KPI per REPORT.md §E (indexed in 14 days; top-20 for one head in
   60–120 days).
6. Geo-located SERP check on google.com.br for the same five terms (REPORT.md "validate before
   development") and Keyword Planner volume for "preço do alqueire" before building the price page.
7. Bing Webmaster Tools: re-import from Search Console.

---

# Launch checklist — ID-01 (weton and kalender Jawa, /id/)

Status on 13 Oct 2026: 65 pages build, `npm run check` passes for /id/ and /es-mx/ (see the report in
the PR/commit), the engine has 38 golden dates with ≥ 2 sources each. Unlike MX-01 these pages give no
legal or tax figures, so the **only hard blockers are the deploy itself and Search Console**; the
verification items below can follow launch, but the pages already say "menunggu" (pending) until they
are done. Demand for *kalender jawa 2027* starts in December: get the pages indexed by mid-November.

## ID-1. Deploy and index (🔴 blocking, by 15 Nov 2026)

1. Deploy the branch to production (same Vercel project; `SITE_URL` set — see MX-01 §3).
2. **Search Console**: add a **URL-prefix property for `https://<domain>/id/`** (the research recommends
   one property per locale folder; the Domain property from MX-01 also covers it).
3. Submit `https://<domain>/sitemap.xml` (it now lists the 65 /id/ URLs with hreflang id-ID and their
   own `lastmod`).
4. **Request indexing** (URL Inspection → Request indexing), in this order, within the daily quota:
   1. `/id/kalender-jawa/2027/` (deadline page), then `/id/kalender-jawa/2027/januari/` … `/desember/`
   2. `/id/weton/`, `/id/weton/hari-ini/`, `/id/weton/jodoh/`, `/id/kalender-jawa/2026/`
   3. the 35 `/id/weton/{hari}-{pasaran}/` pages (they are linked from every weton page, so crawling
      also finds them)
5. Live-test one URL: canonical = production URL; hreflang `id-ID` + `x-default`; rendered HTML shows
   the weton of *today* in "Weton hari ini" (the page recomputes it on the device).
6. Enhancements: FAQ and Breadcrumbs should validate on the /id/ pages.
7. Bing Webmaster Tools: import from Search Console.
8. Track REPORT.md §E KPIs for the 5 heads: *hitung weton*, *hitung weton jawa*, *hitung weton jodoh*,
   *weton hari ini*, *kalender jawa 2026* (and *kalender jawa 2027* from December).

## ID-2. Daily rebuild (🟡 at launch)

`Weton hari ini`, the "berikutnya" marks on weton pages and the "today" cell of the calendars are
recomputed in the visitor's browser, so they are never stale. To also refresh the static HTML that
crawlers see, create a **Vercel deploy hook** and store its URL as the GitHub repository
secret **`VERCEL_DEPLOY_HOOK`**: `.github/workflows/daily-rebuild.yml` calls it at 00:05 WIB.
This scheduled hook will not run until the repository's GitHub Actions issue is resolved.

## ID-3. Cultural review (🟡 before promotion)

Ask a specialist in Javanese calendrics (penanggalan Jawa: e.g. a lecturer in Javanese literature or a
keraton abdi dalem who keeps the calendar) to review `src/data/parameters/id/weton-methods.json`, the
engine rules and the copy. Record them in `src/data/reviews.json` under `id.weton`, `id.weton.jodoh`,
`id.weton.hari-ini` and `id.kalender`; the badge "Tinjauan ahli penanggalan Jawa: menunggu" changes
by itself. Questions:

1. **Kurup**: Asapon since 1 Suro 1867 (24 Mar 1936), Anenhing from 26 Aug 2052 (we derive the day
   from the kurup name; sources print 25, 26 or 27 Aug). Confirm, and whether the keraton has
   announced the 2052 switch.
2. **Leap years** Ehe, Dal, Jimakir; the shortened Besar at the kurup change. Confirm.
3. **Windu**: Adi → Kuntara → Sangara → Sancaya, with 1955–1962 J in Sancaya. Confirm, and supply the
   *lambang* (Langkir/Kulawu) rule if it should be shown (not shown today: no source found).
4. **Jodoh methods**: sisa 8 as default (most cited); sisa 7 order (Satriya Wirang at 5, Lebu Katiup
   Angin at 7); sisa 5 (Sri, Dana, Lara, Pati, Lungguh) and its remainder-0 rule; sisa 4 spellings.
   Can you supply the full **sisa 9 per-person** table from Betaljemur Adammakna? (Not implemented.)
5. **Pangarasan**: which list is authoritative for neptu 10, 11, 14–17? (See PLAN.md conflicts.)
6. **Keblat** colours/directions per pasaran; Kliwon "manca warna".
7. Wording of the disclaimer ("tradisi budaya, bukan ramalan pasti") and of the Pati/Punggel/Pegat
   descriptions.
8. Should "lahir setelah magrib" use the next day's weton by default? (Today: we compute the Gregorian
   date and explain the custom in the FAQ.)

## ID-4. Data still `verified: false` (🟡, values shown with their source and state)

The build environment could not open detik.com, kemenag.go.id, setneg.go.id or the other sources (egress
policy), so every value was cross-checked through search-result summaries of two or more sources but
**none was read from the primary document**. Regenerate with `npm run params:report -- --unverified`.

| File (`src/data/parameters/id/`) | What to check | Where |
|---|---|---|
| `hijri-kemenag.json` 1447 (Rajab → Zulhijah) | each month start | *Kalender Hijriah Indonesia 2026* (Kemenag Bimas Islam PDF); isbat press releases for Ramadan (19 Feb), Syawal (21 Mar), Zulhijah (18 May) |
| `hijri-kemenag.json` 1448 | Muharam–Rajab from the 2026 calendar; **Syakban (9 Jan) and Ramadan (8 Feb) 2027 are estimates**; **Zulkaidah 1448 is unknown (we use 8 Apr 2027, hisab urfi)** | *Kalender Hijriah Indonesia 2027* (released, per detik) |
| `hijri-kemenag.json` 1449 | Muharam (6 Jun), Rabiulawal (4 Aug), Rajab (30 Nov) follow the SKB; **Safar, Rabiulakhir, Jumadilawal, Jumadilakhir and Syakban are estimates** from the global calendar | *Kalender Hijriah Indonesia 2027* |
| `hari-libur.json` 2026 | 17 libur, 8 cuti | SKB No. 1497/2/5 Tahun 2025 (PDF from Kemenko PMK / Kemnaker) |
| `hari-libur.json` 2027 | 18 libur, 8 cuti; Iduladha 17 May and Waisak 20 May (two outlets only); Isra Mikraj twice (5 Jan, 26 Dec) | SKB 2027 (signed 15 Sep 2026) |
| `weton-methods.json` | neptu table, the four jodoh tables, keblat, pangarasan | Kitab Primbon Betaljemur Adammakna (print); see ID-3 |

Where a month start is an estimate, every affected day is printed with "≈" on the pages and the dialog
says "perkiraan; menunggu ketetapan Kemenag". When you confirm a month, set its `basis` to
`kalender-kemenag` (or `isbat`) and the "≈" disappears. Run `npm test` after every change: the table
must stay consecutive with 29/30-day months.

## ID-5. Every year (🔴 calendar duty)

- **September–October 2027: publish `/id/kalender-jawa/2028/`** before the December demand. Steps:
  1. add `2028` to `KALENDER_YEARS` in `src/content/id/meta.ts` (routes, sitemap, OG, header follow);
  2. extend `hijri-kemenag.json` to cover 2028 (1449 Ramadan → 1450 Syakban) from *Kalender Hijriah
     Indonesia 2028*;
  3. add the SKB 2028 holidays to `hari-libur.json` (usually signed in September);
  4. add golden dates for 2028 (1 Suro 1962 is computed as Kamis Pon, 25 May 2028 — confirm
     against Kemenag) and run `npm run check`;
  5. capture screenshots (`npm run screenshots -- id-01`), request indexing for the new pages.
- January: confirm the year's Ramadan/Syawal/Zulhijah isbat dates and flip them to `isbat`.
- Keep 2026 online after it ends (people look up past dates); consider dropping it from the header nav.

## ID-6. Policy and product (🟡)

- **Ads**: the pages are framed as tradition ("tradisi/budaya, bukan kepastian"), with no paid readings.
  Before enabling ads, check AdSense's policy for astrology/esoteric content and keep ad slots off the
  jodoh result (REPORT.md validation item).
- **Privacy notice** in Bahasa Indonesia (UU PDP No. 27/2022): no data is stored server-side; shared
  links contain the dates typed.
- **Error reports**: a contact for wrong dates (REPORT.md KPI "error reports per 1,000 uses").
