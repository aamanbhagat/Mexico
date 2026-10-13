# Golden values

`golden.py` re-derives every worked example with Python `Decimal` arithmetic, written
separately from the TypeScript engine, so the unit tests compare two independent
implementations of the same rules instead of checking the engine against itself.

Run it with `python3 -I tests/golden/golden.py` and copy any changed figure into
`src/content/es-mx/examples.ts` (the pages and the tests read the same objects).

Where a public source publishes the same case, the test also asserts that source's figure:

| Example | Source | Their figure | Ours | Why they differ |
|---|---|---|---|---|
| Aguinaldo, año completo, $500/día | PROFEDET FAQ | $7,500.00 | $7,500.00 | — |
| Aguinaldo proporcional, 214 días, $333.33/día | INADEM (gob.mx) | $2,931.37 | $2,931.48 | INADEM rounds 4,999.95 ÷ 365 to 13.698 before multiplying by 214 |
| Aguinaldo, 233 días de 15 | CCL Sinaloa | 9.57 días | 9.575 días | CCL truncates 15 ÷ 365 to 0.04109 |
| Vacaciones + prima, 12 días, $500/día | CCL Sinaloa | $6,000 + $1,500 | $6,000 + $1,500 | — |
| Liquidación, SDI $349.31, 5 años | CCL Sinaloa | $31,437.90 / $34,931.00 / $20,958.60 | same | — |

ISR figures have no published counterpart: they are derived from the Anexo 8 RMF 2026 tariff
and need review by a payroll accountant before launch (see docs/LAUNCH_CHECKLIST.md).

## Land units (pt-BR, BR-01)

`land_units.py` re-derives every worked example in `src/content/pt-br/examples.ts` with Python
`Fraction`s straight from `src/data/parameters/br/land-units.json`, and checks that each unit's
braça dimensions reproduce its area exactly. Run it with `python3 -I tests/golden/land_units.py`.

`tests/unit/land-units/golden.test.ts` also asserts the figures published by the sources:

| Assertion | Source | Their figure | Ours |
|---|---|---|---|
| Alqueire paulista | IEA-SP convention; INDA/MDA row 11 | 2,42 ha | 24.200 m² = 2,42 ha |
| Alqueire paulista in acres | IBGE, Revista Brasileira de Geografia (1950) | 5,98 acres | 5,98 (2 d.p.) |
| Alqueire mineiro | INDA/MDA row 12 | 100 × 100 braças, 4,84 ha | same |
| Alqueire do Norte | INDA/MDA | 75 × 75 braças, 2,72 ha | 27.225 m² (2,72 rounded) |
| 100 × 200 / 200 × 200 / 50 × 75 / 50 × 50 braças | INDA/MDA | 9,68 / 19,36 / 1,82 / 1,21 ha | same |
| Tarefa cearense | INDA/MDA row 67 | 3.630 m², 0,36 ha | same |
| Tarefa AL/SE | INDA/MDA row 66 | 3.053 m², **0,03 ha** | 0,31 ha — the table's hectare column is a misprint |
| Tarefa = 4 quadras de 15 braças | Bolema (SciELO), Arraias-TO | 4.356 m² | same |
| Tarefa de 25 × 25 braças | UFAL exam item | 25 × 25 braças of 2,20 m | 3.025 m² |
| Litro de terra; 80 per mineiro, 40 per paulista | Canal Rural (topographer) | 605 m² | same |
| Quadra gaúcha / quadra de sesmaria | INDA/MDA; RS sources | 132 × 132 m; 132 × 6.600 m | 1,74 ha; 87,12 ha |
| Acre | NIST SP 811 | 4.046,856 422 4 m² | exact |
