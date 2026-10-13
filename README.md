# Tabula — everyday and business calculators

Multi-country, multi-language calculator site. Live locales:

- **es-MX** — Mexico's payroll-payout suite (aguinaldo, finiquito, liquidación, prima vacacional,
  vacaciones) plus a reference page of official 2026 values.
- **id** — weton and Javanese calendar (ID-01): cek weton, weton jodoh with every method side by side,
  weton hari ini, 35 weton pages and printable *kalender Jawa* 2026–2027 (year + month pages). Project rules live in [`CLAUDE.md`](CLAUDE.md); the research behind every
page in [`docs/research/`](docs/research/REPORT.md).

```bash
npm ci
npm run dev        # http://localhost:4321/es-mx/ and /id/
npm run build      # static site in dist/
npm run check      # the full quality gate (see below)
```

Node 22. Set `SITE_URL` to the production origin when building for production.

## Stack

| Choice | Why |
|---|---|
| **Astro 7.3** (static) | Requested Astro 5, but 5.18.2 carries open advisories (one critical RCE in image optimisation, two high XSS/SSRF) fixed only in ≥ 7.2.8. Same APIs for a static site. |
| **Preact islands** (React-compatible hooks API) | React + ReactDOM alone are ~58 KB gzip, leaving nothing of the 70 KB/page budget. With Preact a calculator page ships ~25 KB. Switch the integration to `compat: true` to use React libraries. |
| Tailwind CSS v4 + `src/styles/tokens.css` | Utilities read the tokens; tokens are the single source of design values. |
| Motion (`spring` generator) | Critically damped spring for the number roll (≈2 KB instead of 19 KB for the full `animate`). |
| Native cross-document View Transitions | Page transitions with zero JavaScript. |
| Vitest, Playwright + axe-core, Lighthouse CI | Golden tests, e2e/a11y/visual, performance budgets. |
| Cloudflare Pages | `wrangler.toml`, `public/_headers` (security + caching), `public/_redirects`. |

## Layout

```
src/
  config/site.ts               brand, origin (SITE_URL), analytics switches
  i18n/locales.ts, routes.ts   locale registry (es-MX and id published) + hreflang/sitemap helpers
  i18n/ui.ts                   interface strings of the shared chrome, per locale
  data/parameters/mx/*.json    dated, sourced legal values (UMA, salarios mínimos, ISR tariff…)
  data/parameters/id/*.json    weton methods, Kemenag Hijri month starts, SKB holidays (with sources)
  data/reviews.json            legal-review state that drives the badge on each page
  lib/params/                  typed loader: value in force on a date, refuses unknown dates
  lib/engine/mx/               LFT + LISR engine (pure functions)
  lib/calendar/javanese/       Javanese calendar engine: pasaran, neptu, wuku, Sultan Agungan date
                               (kurup), Hijri (Kemenag table) — shared with the ID-09 date tools
  lib/weton/                   jodoh methods, calendar page models
  lib/ui/                      formatting, URL state, PDF writer, analytics events
  components/ui/               field, result and action primitives (Preact)
  components/calc/             calculator islands (es-MX)
  components/weton/, kalender/ weton islands, crossing neptu grid, month grids (id)
  content/es-mx/, content/id/  worked examples shared by pages and golden tests
  layouts/, pages/             Astro templates and routes; og/, sitemap.xml, robots.txt endpoints
tests/unit/                    Vitest: registry contract, engine golden tests, utilities
tests/e2e/                     Playwright: SEO, calculators, axe (light/dark), keyboard, visual
tests/unit/calendar/           Javanese calendar golden dates (each with ≥ 2 cited sources)
tests/golden/golden.py         independent Decimal re-derivation of every example
docs/                          PLAN, LAUNCH_CHECKLIST, design directions, screenshots
```

## Adding or updating a legal value

1. Add a version to the parameter's JSON with `value`, `effective_from` (and `effective_to` when
   the validity end is legally known), `source_url`, `source_title`, `retrieved_on`,
   `verified`, `notes`.
2. `npm test` validates the registry contract (ascending dates, https sources, consistency checks).
3. Set `verified: true` only after comparing with the primary official document.
4. Bump `UPDATED` in `src/content/es-mx/meta.ts`.

## Quality gate — `npm run check`

Types (`astro check`) → ESLint → Prettier → Vitest (unit + golden) → build → JS budget
(≤ 70 KB gzip per page) → Playwright (e2e, axe WCAG 2.2 AA in light and dark, keyboard, visual)
→ Lighthouse CI (≥ 95 in every category, LCP < 1.8 s, CLS < 0.05, TBT < 200 ms as the lab proxy
for INP, JS < 70 KB).

## Design

Direction **Línea** (transit wayfinding): every calculator is a line with its own color and
pictogram, every step of the calculation a stop. Decision record and the two rejected directions:
[`docs/design/DIRECTIONS.md`](docs/design/DIRECTIONS.md). Screenshots of every page:
[`docs/screenshots/`](docs/screenshots/).
