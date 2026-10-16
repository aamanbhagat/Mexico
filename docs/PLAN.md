# Plan and running checklist

Source of truth for priorities: `docs/research/REPORT.md` (MX-01 is opportunity #2; aguinaldo must
be live before the November–December peak; ID-01 is #4, kalender Jawa 2027 must be indexable by
mid-November). Rules: `AGENTS.md`.

## Project 0 — Green baseline and Vercel deployment

- [x] Sync `main` and confirm es-MX, pt-BR and id home pages and routes exist.
- [x] Reproduce the full quality gate: Playwright cannot find its browser locally; Lighthouse LCP
      exceeds 1.8 s on `/id/` and six pt-BR conversion pages. Keep the full output in
      `/tmp/mexico-main-baseline-initial.log` (local environment only).
- [x] Install Playwright's pinned browser, align visual snapshots without disabling tests and
      optimize LCP without changing budgets (standalone Playwright: 609 passed, 95 skipped).
- [x] Port redirects, security headers and asset caching to `vercel.json`; test the mapping and
      remove Cloudflare-only configuration.
- [x] Require a valid `SITE_URL` for builds, reject the old placeholder, document Vercel setup and
      verify canonical, hreflang, sitemap and robots use the configured origin.
- [x] Keep `CLAUDE.md` as a one-line pointer to the tracked `AGENTS.md`; update deployment docs.
- [x] Run standalone Playwright and the complete `npm run check` on Node 22 (16 Oct 2026:
      609 passed, 95 skipped; 24/24 Lighthouse routes pass, maximum median LCP 1.65 s).
- [ ] Commit, push and open a PR into `main` without merging. GitHub Actions jobs currently have
      no steps (account billing); publishing also requires Git credentials for this workspace.
- [x] Leave the production domain and deployment to the owner, deferred as requested.
- [x] Identify and stop the stale preview on port 4321; use the existing large data disk for
      temporary performance reports instead of filling the system partition.
- [x] Measure five unmodified Lighthouse runs on the pt-BR Norte page (median 1660 ms, hero lede
      paragraph) and identify the slowest page in each of the three published locales.
- [x] Give Playwright a dedicated, configurable preview port (default 4329) that rejects occupied
      ports instead of reusing a different server.
- [x] Replace 82 visual baselines captured against the reused stale preview after inspecting
      mobile/desktop and light/dark output; standalone Playwright: 609 passed, 95 skipped.
- [x] Improve the measured LCP cause without relaxing any budgets; repeat five-run measurements
      on Norte (median 1364 ms) and each locale's slowest page (all medians below 1650 ms).
- [ ] Make `npm run check` record its full output and a dated per-step summary with Node version
      and the tested commit SHA; commit the successful check report.
- [ ] Run the entire local quality gate, then push `fix/main-baseline` and open an unmerged PR.

## Phase 1 — Foundation ✅

- [x] Research moved to `docs/research/`; `frontend-design` skill vendored in `.claude/skills/`
- [x] Astro 7.3 static build, TypeScript strictest, Preact islands, Tailwind v4 (see README for
      why not Astro 5 / React)
- [x] Scripts: `dev`, `build`, `check` (+ `test`, `test:e2e`, `lhci`, `budget`, `screenshots`,
      `params:report`)
- [x] ESLint (TS, Astro, jsx-a11y, hooks) + Prettier; GitHub Actions configured for PRs (no jobs starting)
- [x] Locale registry: es-MX, pt-BR and id live; ja, pl, de, es-ES, en, tr defined, unpublished,
      guarded by `scripts/postbuild.mjs`
- [x] hreflang + sitemap helpers (`src/i18n/routes.ts`, `/sitemap.xml`, `/robots.txt`)
- [x] Parameter registry `src/data/parameters/mx/*.json` + typed loader that picks the version in
      force on a date and refuses dates outside known validity
- [x] Three visual directions rendered as the real aguinaldo page → **Línea** chosen
      (`docs/design/DIRECTIONS.md`, `docs/screenshots/directions/`)
- [x] Tokens (`src/styles/tokens.css`), light/dark, components: money field, date field,
      segmented control, radio cards, switch, result card with spring number roll, breakdown
      "line", copy/share/PDF, disclaimer, sources, FAQ accordion
- [x] Vercel static config (`vercel.json`: redirect, headers, caching), strict CSP
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

## Project 3 — ID-01 weton and kalender Jawa (/id/) ✅ built, launch gated (see LAUNCH_CHECKLIST §ID-01)

Source: docs/research/REPORT.md opportunity #4 (ID-01, 51 keywords, 5 heads at 10K–100K); the date
engine is shared with #8 (ID-09). Hard deadline: kalender Jawa 2027 live and indexable by mid-November 2026.

- [x] Research with sources (search only: the build environment cannot open the pages): calendar
      rules, kurup, windu, Kemenag Hijri month starts 1447–1449, SKB 2026/2027, jodoh methods, keblat,
      pangarasan — conflicts recorded below and in the data files
- [x] Engine `src/lib/calendar/javanese/` (pure, reusable by ID-09): JDN, dina, pasaran, neptu, wuku,
      Sultan Agungan date with kurup Aboge → Asapon → Anenhing and the Aboge convention, Hijri from the
      Kemenag table with tabular fallback flagged ≈, month grids, weton date lists
- [x] Golden tests: 38 dates, each with ≥ 2 cited sources (today, 1 Suro 1958–1961, leap Besar 1959,
      kurup boundaries 1936/2052, isbat dates, Galungan/Kuningan wuku), plus rule tests (159 unit tests)
- [x] Registry `src/data/parameters/id/`: `weton-methods.json` (neptu table, jodoh sisa 8 default,
      sisa 7, 5, 4, the not-implemented sisa 9, keblat, pangarasan), `hijri-kemenag.json` (basis per
      month), `hari-libur.json` (SKB 2026, 2027); typed loader `src/lib/params/id.ts`
- [x] Locale `id` published: hreflang (locale homes), sitemap, per-locale lastmod, shared chrome
      localized through `src/i18n/ui.ts` (es-MX output unchanged)
- [x] Pages (65): /id/, /id/weton/, /id/weton/jodoh/, /id/weton/hari-ini/, 35 × /id/weton/{hari}-{pasaran}/,
      /id/kalender-jawa/{2026,2027}/ + 24 month pages
- [x] Features: crossing neptu grid, method switcher with all methods visible, birth-date field with
      numeric keypads, copy/share, OG card per weton/tool/year/month, printable calendars (2 months per
      A4), day dialog, today marks refreshed on the device, daily rebuild workflow
- [x] Quality: axe (light/dark, 390/1440) zero violations on all 72 pages, no horizontal scroll at 390 px,
      visual baselines per /id/ template, ID e2e suite, Lighthouse budgets on 8 /id/ pages
- [x] Screenshots `docs/screenshots/id-01/`
- [ ] Javanese-calendar specialist review recorded in `src/data/reviews.json` (owner)
- [ ] Kemenag/SKB values flipped to `verified: true` from the primary PDFs (owner)
- [ ] Search Console URL-prefix property for /id/ and indexing requests (owner, before 15 Nov 2026)

### ID-01 source conflicts and how they are handled

| Topic | Conflict | Handling |
|---|---|---|
| 1 Suro 1960 | Kemenag calendar (detik, GNFI, Katadata July): Rabu Kliwon 17 Jun 2026. Katadata (June), Unesa calendar: 16 Jun (aligned to 1 Muharam). | Asapon arithmetic = Kemenag (17 Jun). FAQ explains the Hijri-aligned variant. |
| 1 Suro 1959 | Kompas TV (Kemenag): 27 Jun 2025. GNFI table: "30 Besar 1958" on 27 Jun, 1 Suro on 28 Jun. | Kemenag. 28 Jun is the Aboge date; "30 Besar" is impossible (Je is a short year). |
| Aboge vs Asapon | Aboge communities run one day behind. | Keraton/Kemenag (Asapon) by default; the Aboge date is shown under the result when it differs. |
| Leap years | No conflict found: GNFI and the EPJ paper both give Ehe, Dal, Jimakir (355 days). | Used as is; it is also the only set that reproduces the kurup names (Alip Rebo Wage → Selasa Pon). |
| Asapon start | 24 Mar 1936 (GNFI, Walisongo thesis) vs 17 Feb 1936 (one secondary source). | 24 Mar 1936 (Selasa Pon, as the kurup name requires). |
| Anenhing start | Sources: Asapon ends 25 or 26 Aug 2052; Anenhing starts 27 Aug. | 26 Aug 2052, the only Senin Pahing (kurup name); documented in a test. |
| Hijri 13 Oct 2026 | detik prints 1 Jumadilawal 1448 (copies the Javanese day); Katadata/Alhabib: 1 Jumadilawal = 12 Oct. | Kemenag table (2 Jumadilawal on 13 Oct). |
| Hijri Dec 2026 | kalenderku.id uses Muhammadiyah KHGT (22 Jumadilakhir on 1 Dec); Mamikos/Kemenag: 21. | Kemenag only; KHGT never used. |
| Jodoh sisa 7 | One detik article swaps Satriya Wirang (4) and Lebu Katiup Angin (6). | Order used by Popbela and detik's other list; conflict shown on the page. |
| Jodoh sisa 4 | Spellings Gentho/Gonto, Punggel/Punggul. | Gentho/Punggel, noted. |
| Jodoh sisa 5 | Sources omit the remainder 0 rule; some mention Gedhong/Lungguh variants without a full table. | Sri, Dana, Lara, Pati, Lungguh (kumparan citing Betaljemur + Popbela); 0 = 5, noted. |
| Jodoh sisa 9 per person | Only partial tables (pairs with remainder 1). | Not implemented; shown as such with the partial sources. |
| "Walisongo" method | No written source found. | Not implemented; FAQ says so. |
| Pangarasan | Neptu 10: Aras Pepet (detik) vs "Pandita Mbangun Teki" (social media only); neptu 11: Aras Tuding (detik, Ki Totok Yasmiran via ITERA) vs Lakuning Setan (Portal Pati); 14/15 lists inconsistent within JawaPos. | Both written labels shown with sources; social-media-only labels not shown; meanings only where a source gives one. |
| 2027 holidays | Idul Adha 17 May / Waisak 20 May (Metro TV, JawaPos) vs only cuti 18/19 May (Antara, Katadata); 6 vs 8 cuti bersama. | 17 and 20 May libur, 8 cuti (Setneg count); `verified: false`. |

## Next

1. Close the launch blockers: MX before the aguinaldo peak (mid-November); ID-01 Search Console and
   the kalender Jawa 2027 indexing by 15 Nov 2026; BR-01 has no seasonal deadline but needs the
   LAUNCH_CHECKLIST §7 review before promotion.
2. ID-09 on the shared engine: kalkulator umur, selisih hari, kalkulator jadian, hari kerja (uses
   `id.hari-libur`), then konversi Hijriah ↔ Masehi (uses `id.hijri-kemenag`).
3. BR-01 follow-ups: "preço do alqueire por região" page fed by INCRA RAMT/PPR (per hectare) and
   IEA/Deral data; per-state landing anchors (`#uf-mt`) once Search Console shows demand.
4. Reuse the land-unit engine for the next locale (ID tumbak/bata or JP 坪/反 — the engine already
   handles 400/121 m² exactly), and build the PTU calculator (May peak) and prima de antigüedad / SDI
   pages from the discovery list for MX.
5. Parameter-update runbook + alert for the December (salario mínimo), January (UMA) and
   September (SKB libur, Kalender Hijriah Indonesia) releases.
