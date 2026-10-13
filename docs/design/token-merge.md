# Token and stylesheet merge: BR-01 (pt-BR) + ID-01 (id) into one system

Both project branches were built from the same Phase 3 `main` and edited the same two files,
`src/styles/tokens.css` and `src/styles/global.css`. This records how they were combined and why.
Rule applied: **one token set; where values diverged, keep the more accessible one.**

## Result

**No token value diverged.** Neither branch changed or removed any existing token or rule: every
change on both sides was an addition. Checked mechanically against the common ancestor: `tokens.css`
has 0 deleted lines on either side (BR +7, ID +31), and 0 of the 208 top-level rules in `global.css` were
modified or removed by either branch. So there was no "more accessible" value to pick; both sets of
additions are kept.

| Token | From | Light | Dark | Notes |
|---|---|---|---|---|
| `--line-terra` | BR-01 | `#8c2f1c` | `#f2876b` | pt-BR land tools (terra roxa) |
| `--line-weton` | ID-01 | `#2b3990` | `#9aa6ff` | weton, hari ini |
| `--line-jodoh` | ID-01 | `#9c1f4f` | `#ff8fb6` | weton jodoh |
| `--line-kalender` | ID-01 | `#8a4b0f` | `#e0a46a` | Javanese calendars |
| `--date-red` | ID-01 | `#c0271b` | `#ff8a7a` | Sundays and holidays ("tanggal merah") |
| `--pasaran-*` | ID-01 | fixed | fixed | The five pasaran colours; always shown with their names, never colour alone |

### Contrast, measured on the merged file (WCAG 2.2 AA needs ≥ 4.5:1)

Each tool colour is used both as a chip (background, with `--line-on` text) and as accent text on the
page background; both were measured, in both themes.

| Tool | Light chip / text | Dark chip / text | Origin |
|---|---|---|---|
| aguinaldo | 6.98 | 6.40 | base |
| finiquito | 7.84 | 7.30 | base |
| liquidacion | 5.96 | 7.81 | base |
| prima-vacacional | 5.43 | 8.63 | base |
| vacaciones | 5.38 | 9.55 | base |
| uma | 8.48 | 8.12 | base |
| **terra** | 8.27 | 7.34 | BR-01 |
| **weton** | 10.04 | 8.05 | ID-01 |
| **jodoh** | 7.71 | 8.56 | ID-01 |
| **kalender** | 6.79 | 8.41 | ID-01 |
| `--date-red` on page background | 5.92 | 7.96 | ID-01 |

All pass with margin (lowest: 5.38). The measurement is in the script history of this merge; re-run it
whenever a tool colour changes.

## Stylesheet (`global.css`)

Merged at rule level, not line level: a line-based union produced broken CSS (it split `.kal-notes`
and dropped its closing brace), so the file is rebuilt from the parsed top-level rules.
Result: 451 rules = the exact union of both branches, 0 duplicates, 0 missing, parses with
lightningcss (`errorRecovery: false`).

Choices that were not mechanical:

1. **Identical rules written by both branches** (`.line-map*`, `.home-hero h1`, `.site-header`): kept once.
2. **Two `@media print` blocks collided semantically.** BR's is the site-wide print layout (it
   powers "Imprimir tabela" on the land converter); ID's styles the printed calendar and contained
   `.section { display: none !important }`, which on a pt-BR page would have hidden the whole
   conversion table. Kept BR's as the site-wide block. Scoped ID's to `body[data-tool='kalender']`,
   and moved its `@page { size: A4 portrait; margin: 12mm }` to a **named page** (`@page kalender`,
   applied through `.kal-year { page: kalender }`) so that margin does not leak onto other locales' prints.
3. Tool colour selectors: `[data-tool='weton' | 'hari-ini' | 'jodoh' | 'kalender' | 'terra']` all live in `tokens.css` beside the originals.

## Shared components (not tokens, but the same "no parallel systems" rule)

| Concern | BR-01 | ID-01 | Merged |
|---|---|---|---|
| Interface strings | `siteUi()` / `CALC_UI` | `ui()` | BR's structure, `id` added to both dictionaries; ID's `ui()` removed |
| Calculator shell | `calc/shell.tsx` (`locale`, `detailsHref`, `clock`) | `display`, `headlineText`, `labels`, `anchor`, `todayFn` | BR's, plus `display`, `headlineText`, `formLabel`, `detailsLabel`; `anchor`→`detailsHref`, `todayFn`→`clock` |
| Result actions | `locale` + `CALC_UI` | `labels` + `shareUrl` | `locale` + `CALC_UI`, plus `shareUrl` |
| Date formatting | `formatDateLongIn(iso, intl)` | `formatDateLong(iso, intl)` + weekday/month helpers | ID's (superset); one function |
| Parameter lookup | `BR_PARAM_FILES` | `PARAM_FILES` (MX+ID) | `PARAM_FILES` covers MX+ID+BR |
| Review badge | `kind: legal / technical` | single pending text | `kind: legal / technical / expert` (expert = Javanese-calendar specialist) |
| Skip-link target | `#contenido` | `#isi` for every non-es-MX locale | per-locale `mainId`: `contenido`, `conteudo`, `isi` (ID's rule would have put an Indonesian word on pt-BR pages) |
| Breadcrumbs | `parent` | `parents[]`, `crumb` | `parents[]`, `crumb` |
| Footer / related links | `TOOLS` registry | hard-coded | `TOOLS` registry, `id` entries added |
