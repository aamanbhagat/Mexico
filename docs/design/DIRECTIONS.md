# Visual directions — decision record

Brief: a multi-country site of everyday and business calculators. First product: Mexico's
payroll-payout suite (aguinaldo, finiquito, liquidación, prima vacacional, vacaciones). Users
are mostly on phones, often anxious (just dismissed) or checking a December payment; HR and
accountants verify figures. The page must answer fast, show *why* (articles, sources) and let
people take the result away (link, PDF).

All three directions were rendered as the **real aguinaldo calculator page** (same markup,
same engine, same copy) with the inputs `?s=15000` (monthly salary $15,000). Only the token set
and a scoped override sheet change. Rebuild them with `npm run build:lab` and open
`/lab/direcciones/<name>/`.

| | Light 1440 | Light 390 | Dark 1440 | Dark 390 |
|---|---|---|---|---|
| A · Línea | [png](../screenshots/directions/linea-1440-light.png) | [png](../screenshots/directions/linea-390-light.png) | [png](../screenshots/directions/linea-1440-dark.png) | [png](../screenshots/directions/linea-390-dark.png) |
| B · Sobre de raya | [png](../screenshots/directions/sobre-1440-light.png) | [png](../screenshots/directions/sobre-390-light.png) | [png](../screenshots/directions/sobre-1440-dark.png) | [png](../screenshots/directions/sobre-390-dark.png) |
| C · Sumadora | [png](../screenshots/directions/sumadora-1440-light.png) | [png](../screenshots/directions/sumadora-390-light.png) | [png](../screenshots/directions/sumadora-1440-dark.png) | [png](../screenshots/directions/sumadora-390-dark.png) |

## A · Línea (chosen)

Mexico City's Metro and the 1968 Olympic wayfinding system: every line has a color and a
pictogram, every stop is a dot on a line. Here every **calculator is a line** and every
**concept of the calculation is a stop**: gross → exempt → taxable → ISR → net, in the order
the law applies them.

- **Typography:** Archivo (Omnibus-Type), one variable family. Headings and the result figure
  are set *expanded* (`font-stretch: 118%`, weight 800) like station signage; body text at normal
  width. Tabular figures everywhere money appears.
- **Palette:** white `#ffffff`, black `#000000`, warm grey `#f3f3f1`; line colors —
  aguinaldo `#b0005e`, finiquito `#00529b`, liquidación `#b33a00`, prima vacacional `#007a44`,
  vacaciones `#8a6400`, UMA `#6b4423` (each ≥ 4.5:1 against white; lighter twins for dark mode).
- **Motion personality:** *transit*. Short, decisive, no bounce on numbers: the headline figure
  travels to its new value on a critically damped spring (Motion `spring`, 220 ms); switches
  use a spring thumb; FAQ panels open with an ease-out height. Pages cross-fade with native
  cross-document View Transitions. Everything stops under `prefers-reduced-motion`.

## B · Sobre de raya

The manila envelope wages were paid in ("día de raya").

- **Typography:** Bitter (slab, Huerta Tipográfica) for text; Courier Prime for "typed" amounts.
- **Palette:** bond `#f1f2ee`, manila `#e6c574` / flap `#d9b45c`, ink `#22252a`, ballpoint blue
  `#1e3a8a`, stamp red `#a1241a`.
- **Motion personality:** *typed* — amounts appear as if typed onto the envelope.

## C · Sumadora

The desk adding machine in every despacho contable: the result prints on a paper roll.

- **Typography:** Instrument Sans for the interface; Martian Mono for the tape.
- **Palette:** casing grey `#e2e5e7`, machine graphite `#2b2f34`, paper `#fffef8`, ink `#1b1d20`,
  ribbon red `#c1121f`, key green `#0e6a4d`.
- **Motion personality:** *feed* — the tape advances a line when a figure changes.

## Decision: Línea

1. **Structure carries information.** The station line is the calculation path, not decoration;
   the line color tells you which tool you are in. Both scale to a catalog of dozens of tools in
   nine countries (BR land units, JP text tools, PL word tools…) — Sobre de raya is Mexico- and
   payroll-specific and does not travel.
2. **Legibility of money.** Expanded Archivo numerals at 48 px with tabular figures are the most
   scannable of the three. Courier Prime (B) is thin and letter-spaced; Martian Mono (C) is so wide
   that concept details wrap on a 390 px tape.
3. **Trust signals stay neutral.** In B the "Revisión legal: pendiente" badge became a red rubber
   stamp that reads as *rejected*. In C the green-on-graphite readout falls into the generic
   "dark panel + acid accent" look. A uses plain black and white and spends its color only on the
   line.
4. **Performance.** One font file (≈ 90 KB, latin, wght + wdth axes) instead of two families.
5. **Accessibility.** Color is never the only signal: every tool also has its pictogram and name,
   deductions carry a minus sign and the word "menos" for screen readers, and every line color
   passes 4.5:1.

What we keep from the others: B's idea that the review state is visible next to the result,
and C's red-for-deductions convention (ISR is shown in the negative color with a minus sign).

## Self-critique / next passes

- Archivo with both axes is the heaviest single file; if LCP on slow 4G regresses, subset the
  width axis to the display range or move body text to the 35 KB weight-only file.
- The black segmented "on" state is heavy on long forms; revisit with real users.
- Pictograms are first drafts; commission a consistent set before adding more tools.
