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

## Next

1. Close the launch blockers above before mid-November (aguinaldo season).
2. PTU calculator (May peak) and prima de antigüedad / SDI pages from the discovery list.
3. Parameter-update runbook + alert for the December (salario mínimo) and January (UMA) releases.
