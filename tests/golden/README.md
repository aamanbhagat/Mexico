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
