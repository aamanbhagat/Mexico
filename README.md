# Tabula — everyday and business calculators

Multi-country, multi-language calculator site. Live locales:

- **es-MX** — Mexico's payroll-payout suite (aguinaldo, finiquito, liquidación, prima vacacional,
  vacaciones) plus a reference page of official 2026 values.
- **pt-BR** — BR-01, the land-unit converter: alqueire (paulista, mineiro/goiano, baiano, do Norte,
  alqueirão…), tarefa, litro de terra, quadra and braça² ↔ hectare, m², acre, with the value used
  in each state and its source.
- **id** — weton and Javanese calendar (ID-01): cek weton, weton jodoh with every method side by side,
  weton hari ini, 35 weton pages and printable *kalender Jawa* 2026–2027 (year + month pages).

Project rules live in [`AGENTS.md`](AGENTS.md); the research behind every
page in [`docs/research/`](docs/research/REPORT.md).

```bash
npm ci
npm run dev        # http://localhost:4321/es-mx/  ·  /pt-br/  ·  /id/
npx playwright install --with-deps chromium  # one-time local setup for browser tests
SITE_URL=https://ci.tabula.test npm run build  # static site in dist/
SITE_URL=https://ci.tabula.test npm run check  # full quality gate
```

Node 22. A build requires `SITE_URL` to be a valid HTTPS origin; an unset value or the old
`calculadoras.example` placeholder fails immediately. For local checks, use a reserved `.test`
origin (`SITE_URL=https://ci.tabula.test npm run check`), or copy `.env.example` to `.env` and set
its `SITE_URL`. The production domain is not set in this repository. On Vercel, go to
**Project → Settings → Environment Variables** and set `SITE_URL` to the project's public HTTPS
address (such as its assigned `*.vercel.app` URL) before building. Update it if the public domain
changes; canonicals, hreflang, sitemap, robots and OG URLs all derive from this origin.
The PR workflow sets a reserved `.test` origin for checks; it does not configure deployment.

## Stack

| Choice | Why |
|---|---|
| **Astro 7.3** (static) | Requested Astro 5, but 5.18.2 carries open advisories (one critical RCE in image optimisation, two high XSS/SSRF) fixed only in ≥ 7.2.8. Same APIs for a static site. |
| **Preact islands** (React-compatible hooks API) | React + ReactDOM alone are ~58 KB gzip, leaving nothing of the 70 KB/page budget. With Preact a calculator page ships ~25 KB. Switch the integration to `compat: true` to use React libraries. |
| Tailwind CSS v4 + `src/styles/tokens.css` | Utilities read the tokens; tokens are the single source of design values. |
| Motion (`spring` generator) | Critically damped spring for the number roll (≈2 KB instead of 19 KB for the full `animate`). |
| Native cross-document View Transitions | Page transitions with zero JavaScript. |
| Vitest, Playwright + axe-core, Lighthouse CI | Golden tests, e2e/a11y/visual, performance budgets. |
| Vercel static deployment | `vercel.json`: directory URLs, 302 root redirect, security headers and asset caching. |

## Layout

```
src/
  config/site.ts               brand, origin (SITE_URL), analytics switches
  i18n/locales.ts, routes.ts   locale registry (es-MX, pt-BR and id published) + hreflang/sitemap helpers
  i18n/ui.ts, tools.ts         interface strings per locale; tools registry (homes, footer, related)
  data/parameters/mx/*.json    dated, sourced legal values (UMA, salarios mínimos, ISR tariff…)
  data/parameters/br/land-units.json  every regional land unit: m², braças, regions, source, verified
  data/parameters/id/*.json    weton methods, Kemenag Hijri month starts, SKB holidays (with sources)
  data/reviews.json            review state (legal / technical / expert) that drives the badge on each page
  lib/params/                  typed loader: value in force on a date, refuses unknown dates; registry.ts = all countries
  lib/engine/mx/               LFT + LISR engine (pure functions)
  lib/land-units/              country-agnostic land-unit engine: exact rationals, NBR 5891 rounding,
                               locale number I/O, catalog validation (reused later for ID/JP/ES/PL/TR)
  lib/calendar/javanese/       Javanese calendar engine: pasaran, neptu, wuku, Sultan Agungan date
                               (kurup), Hijri (Kemenag table) — shared with the ID-09 date tools
  lib/weton/                   jodoh methods, calendar page models
  lib/ui/                      formatting, URL state, PDF writer, analytics events
  components/ui/               field, result and action primitives (Preact)
  components/calc/             calculator islands; shell.tsx = the shared calculator shell
  components/weton/, kalender/ weton islands, crossing neptu grid, month grids (id)
  content/es-mx/, pt-br/, id/  worked examples shared by pages and golden tests; per-locale wording
  layouts/, pages/             Astro templates and routes; og/, sitemap.xml, robots.txt endpoints
tests/unit/                    Vitest: registry contract, engine golden tests, utilities
tests/unit/calendar/           Javanese calendar golden dates (each with ≥ 2 cited sources)
tests/e2e/                     Playwright: SEO, calculators, axe (light/dark), keyboard, visual
tests/golden/golden.py         independent Decimal re-derivation of every MX example
tests/golden/land_units.py     independent Fraction re-derivation of every BR example
docs/                          PLAN, LAUNCH_CHECKLIST, design directions, screenshots
```

## Adding or correcting a land unit (pt-BR)

Edit `src/data/parameters/br/land-units.json`: each unit has `m2` (exact; fractions such as
`400/121` are allowed), optional `dims` in braças, `regions`, its own `source_url`/`source_title`/
`retrieved_on`/`verified`/`notes`, and `also_reported` for values other sources give. Each state
lists the units recorded there (`usual`, `named` or `historical`) with the sources of each claim,
and `defaults` per family only when the sources agree. `npm test` rejects a catalog whose braças do
not reproduce the area, that links a region one way only, or that cites an unknown source. Bump
`UPDATED` in `src/content/pt-br/meta.ts`.

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

Playwright starts its own preview on port 4329 and refuses to reuse an occupied port. Set
`PLAYWRIGHT_PORT` to another free port when needed; the development server remains on 4321.
`npm run check` runs Playwright through `npm run test:e2e:docker` in the official
`mcr.microsoft.com/playwright:v1.64.0-noble` image; the exact image version is read from
`package-lock.json`. Install Docker and run `npm ci` on the host before checking. To regenerate
all visual baselines in that same browser/font environment, run
`npm run test:e2e:docker -- visual.spec.ts --update-snapshots` after building. Direct
`npx playwright test` remains available for local debugging, but do not use it to update
committed baselines. On hosts where Docker requires passwordless sudo, set
`PLAYWRIGHT_DOCKER_SUDO=1` for the Docker test step.
Lighthouse runs every configured route three times with simulated mobile throttling and evaluates
the median, without changing any performance budgets. A full `npm run check` records all step
output and its dated summary (tested commit SHA, Node version, pass/fail per step) in
`docs/check-reports/<branch-name>-<short-commit-sha>.log` (slashes in branch names become hyphens).
Commit the code before running the gate, then commit the successful report in a follow-up commit
so its filename and summary identify the tested code revision.

## Design

Direction **Línea** (transit wayfinding): every calculator is a line with its own color and
pictogram, every step of the calculation a stop. Decision record and the two rejected directions:
[`docs/design/DIRECTIONS.md`](docs/design/DIRECTIONS.md); the pt-BR land tools extend it with the
"terra roxa" line and plots drawn to scale: [`docs/design/BR-01.md`](docs/design/BR-01.md).
Screenshots of every page: [`docs/screenshots/`](docs/screenshots/) (BR-01 in
[`docs/screenshots/br-01/`](docs/screenshots/br-01/)).
