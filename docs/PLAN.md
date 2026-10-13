# Plan and running checklist

Source of truth for priorities: `docs/research/REPORT.md` (MX-01 is opportunity #2; aguinaldo must
be live before the November–December peak). Rules: `CLAUDE.md`.

## Phase 1 — Foundation ✅

- [x] Research moved to `docs/research/`; `frontend-design` skill vendored in `.claude/skills/`
- [x] Astro 7.3 static build, TypeScript strictest, Preact islands, Tailwind v4 (see README for
      why not Astro 5 / React)
- [x] Scripts: `dev`, `build`, `check` (+ `test`, `test:e2e`, `lhci`, `budget`, `screenshots`,
      `params:report`)
- [x] ESLint (TS, Astro, jsx-a11y, hooks) + Prettier; GitHub Actions running `npm run check` on PRs
- [x] Locale registry: es-MX live; pt-BR, id, ja, pl, de, es-ES, en, tr defined, unpublished,
      guarded by `scripts/postbuild.mjs`
- [x] hreflang + sitemap helpers (`src/i18n/routes.ts`, `/sitemap.xml`, `/robots.txt`)
- [x] Parameter registry `src/data/parameters/mx/*.json` + typed loader that picks the version in
      force on a date and refuses dates outside known validity
- [x] Three visual directions rendered as the real aguinaldo page → **Línea** chosen
      (`docs/design/DIRECTIONS.md`, `docs/screenshots/directions/`)
- [x] Tokens (`src/styles/tokens.css`), light/dark, components: money field, date field,
      segmented control, radio cards, switch, result card with spring number roll, breakdown
      "line", copy/share/PDF, disclaimer, sources, FAQ accordion
- [x] Cloudflare Pages config (`wrangler.toml`, `public/_headers`, `public/_redirects`), strict CSP
      with build-time hashes, OG images generated at build

## Phase 2 — MX-01 calculators (es-MX) ✅

- [x] Shared engine `src/lib/engine/mx/` (LFT + LISR): aguinaldo, vacaciones, prima vacacional,
      finiquito, liquidación; ISR art. 96, art. 174 RLISR, separation payments
- [x] Golden tests: public examples (PROFEDET, INADEM, CCL Sinaloa) + independent Decimal
      re-derivation (`tests/golden/golden.py`)
- [x] `/es-mx/calculadora-aguinaldo/`
- [x] `/es-mx/calculadora-finiquito/`
- [x] `/es-mx/calculadora-liquidacion/`
- [x] `/es-mx/calculadora-prima-vacacional/`
- [x] `/es-mx/calculadora-vacaciones/`
- [x] `/es-mx/uma-salario-minimo-2026/`
- [x] Each page: answer-first intro, Cómo se calcula, 3 worked examples (same objects as the
      tests), FAQ from research keywords, sources with verification state, last-updated date,
      disclaimer, data-driven "Revisión legal: pendiente"
- [x] Shareable URL state, PDF export, copy, Web Share; inputs typed before hydration are kept

## Phase 3 — Quality gate ✅ (launch blocked on review — see LAUNCH_CHECKLIST)

- [x] `npm run check` green: types, lint, format, 84 unit/golden tests, build, JS budget,
      Playwright (e2e, axe light/dark, keyboard, visual), Lighthouse CI budgets
- [x] Screenshots 390/1440 × light/dark of every page in `docs/screenshots/`
- [x] `docs/LAUNCH_CHECKLIST.md`
- [ ] Legal + payroll review recorded in `src/data/reviews.json` (owner)
- [ ] Parameters flipped to `verified: true` after checking primary sources (owner)
- [ ] Production `SITE_URL`, brand, Search Console (owner)

## Project 2 — BR-01 land units (pt-BR) ✅ (launch blocked on review — see LAUNCH_CHECKLIST §7)

Source of truth: `docs/research/REPORT.md` opportunity #1 and the 60 BR-01 rows of
`docs/research/top20_search_volume_keywords.csv`.

- [x] Research: INDA/MDA "tabela de medidas agrárias não decimais" (Ministério da Agricultura
      1946, INDA 1966), IBGE (RBG 1950; 1948 publication located), IEA-SP, Canal Rural, Bolema/
      Vidya (Arraias-TO), UFAL, UFPE, NIST, Inmetro, plus the commercial pages that rank. No
      primary PDF could be opened from the build environment → every value `verified: false`.
- [x] `src/data/parameters/br/land-units.json`: 19 units (7 alqueires, 4 tarefas, litro, 3 quadras,
      braça², ha, m², acre) with m², braças, regions, own source, retrieved_on, verified, notes and
      `also_reported` disagreements; 27 UFs mapped (usual / named / historical) with per-claim sources
- [x] Generic engine `src/lib/land-units/` (BigInt rationals, ABNT NBR 5891 rounding, locale I/O,
      catalog validation, area and price conversion) — ready for ID/JP/ES/PL/TR catalogs
- [x] Golden tests for every BR variant + Python Fraction re-derivation (`tests/golden/land_units.py`)
- [x] pt-BR locale live: copy, decimal comma/thousands dot, hreflang (homes paired, BR pages
      self-only), sitemap, OG images, JSON-LD, `/pt-br/` home
- [x] Shared components localized once (layouts, header, footer, toggle, badge, sources, shell,
      actions, fields); MX pages unchanged (visual baselines pass)
- [x] Pages: hub + alqueire paulista, mineiro-goiano, baiano, do Norte, tarefa, litro de terra,
      hectare-para-alqueire
- [x] Features: two-way conversion between all units; state selector with value used + source +
      divergence; per-state table; price normaliser; URL state; copy; share; print (page or table)
- [x] Content: instant answer, por que os sites divergem, como calculamos, worked examples (same
      objects as the tests), FAQ from the keywords, sources, last-updated, CAR/ITR/CCIR note
- [x] `npm run check` green for MX + BR; screenshots in `docs/screenshots/br-01/`
- [ ] Technical review (agrimensor/topógrafo) recorded in `src/data/reviews.json` (owner)
- [ ] Primary documents opened and values flipped to `verified: true` (owner, §7.2)
- [ ] Search Console property for `/pt-br/` (owner, §7.4)

## Next

1. Close the MX launch blockers before mid-November (aguinaldo season); BR-01 has no seasonal
   deadline but needs the §7 review before promotion.
2. BR-01 follow-ups: "preço do alqueire por região" page fed by INCRA RAMT/PPR (per hectare)
   and IEA/Deral data; per-state landing anchors (`#uf-mt`) once Search Console shows demand.
3. Reuse the land-unit engine for the next locale (ID tumbak/bata or JP 坪/反 — the engine already
   handles 400/121 m² exactly) and the PTU calculator for MX.
