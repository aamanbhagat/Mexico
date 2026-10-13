# Launch checklist — MX-01 (es-MX payroll suite) and BR-01 (pt-BR land units)

Sections 1–6 cover MX-01; section 7 covers BR-01.

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


---

# 7. BR-01 — pt-BR land-unit converter (`/pt-br/`)

Status on 13 Oct 2026: nine pages build, `npm run check` passes for MX and BR together, every BR
page meets the CLAUDE.md budgets (29 KB JS gzip). **Do not promote it before 7.1–7.3.** The pages
already say on screen that each value's check against the original document is pending, so an
early soft launch is honest; promotion should wait.

## 7.1 Technical review (🔴 before promotion)

Not a legal tool (CLAUDE.md §8 does not require a lawyer), but people will use these numbers in
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
