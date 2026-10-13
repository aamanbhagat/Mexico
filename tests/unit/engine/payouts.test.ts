/**
 * Golden tests for the Mexico payout engine. Each case is a worked example shown on the
 * es-MX pages (src/content/es-mx/examples.ts). Sources are cited per example; ISR figures
 * were re-derived independently in tests/golden/golden.py.
 */
import { describe, expect, it } from 'vitest';
import {
  AGUINALDO_EXAMPLES,
  FINIQUITO_EXAMPLES,
  LIQUIDACION_EXAMPLES,
  PRIMA_VACACIONAL_EXAMPLES,
  VACACIONES_EXAMPLES,
} from '../../../src/content/es-mx/examples';
import {
  calculateAguinaldo,
  calculatePrimaVacacional,
  calculateSeparation,
  calculateVacaciones,
  separationRights,
  vacationDaysForYear,
  vacationSchedule,
  type Outcome,
} from '../../../src/lib/engine/mx/lft';
import { mxValue } from '../../../src/lib/params/mx';

function unwrap<T>(o: Outcome<T>): T {
  if (!o.ok) throw new Error(`engine error: ${JSON.stringify(o.error)}`);
  return o.value;
}

describe('aguinaldo (art. 87 LFT, art. 93 fr. XIV LISR)', () => {
  it.each(AGUINALDO_EXAMPLES.map((e) => [e.id, e] as const))('%s', (_id, ex) => {
    const r = unwrap(calculateAguinaldo(ex.input));
    expect(r.daysWorked).toBe(ex.expected.daysWorked);
    expect(r.gross).toBe(ex.expected.gross);
    expect(r.exempt).toBe(ex.expected.exempt);
    expect(r.taxable).toBe(ex.expected.taxable);
    expect(r.isrArt96).toBe(ex.expected.isrArt96);
    expect(r.isrArt174).toBe(ex.expected.isrArt174);
    expect(r.net).toBe(ex.expected.net);
  });

  it('PROFEDET: $500 diarios × 15 días = $7,500', () => {
    // https://www.gob.mx/profedet/articulos/preguntas-frecuentes-sobre-aguinaldo
    const r = unwrap(
      calculateAguinaldo({ salary: { amount: 500, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96' }),
    );
    expect(r.gross).toBe(7500);
  });

  it('INADEM: 214 days at $333.33 is within $0.11 of their rounded $2,931.37', () => {
    // INADEM rounds 4,999.95 / 365 to 13.698 before × 214; the exact figure is $2,931.48.
    const ex = AGUINALDO_EXAMPLES[1];
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculateAguinaldo(ex.input));
    expect(r.gross).toBe(2931.48);
    expect(Math.round(Math.abs(r.gross - 2931.37) * 100)).toBeLessThanOrEqual(11);
  });

  it('CCL Sinaloa: 233 days worked → 9.57 days of aguinaldo (they truncate 15/365)', () => {
    const r = unwrap(
      calculateAguinaldo({
        salary: { amount: 100, period: 'diario' },
        aguinaldoDays: 15,
        year: 2025,
        startDate: '2025-05-01',
        endDate: '2025-12-19',
        withholding: 'art96',
      }),
    );
    expect(r.daysWorked).toBe(233);
    expect(Math.trunc(r.proportionalDays * 100) / 100).toBe(9.57);
  });

  it('uses the 2026 exempt amount (30 × 117.31 = 3,519.30), not 2025’s 3,394.20', () => {
    const r = unwrap(
      calculateAguinaldo({ salary: { amount: 1000, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96' }),
    );
    expect(r.exemptCap).toBe(3519.3);
    const r2025 = unwrap(
      calculateAguinaldo({ salary: { amount: 1000, period: 'diario' }, aguinaldoDays: 15, year: 2025, withholding: 'art96' }),
    );
    expect(r2025.exemptCap).toBe(3394.2);
  });

  it('caps a leap year at the full aguinaldo', () => {
    const r = unwrap(
      calculateAguinaldo({
        salary: { amount: 100, period: 'diario' },
        aguinaldoDays: 15,
        year: 2026,
        startDate: '2020-01-01',
        withholding: 'art96',
      }),
    );
    expect(r.proportionalDays).toBe(15);
  });

  it('rejects fewer than 15 days, empty salary, and reversed dates', () => {
    expect(
      calculateAguinaldo({ salary: { amount: 500, period: 'diario' }, aguinaldoDays: 10, year: 2026, withholding: 'art96' }),
    ).toMatchObject({
      ok: false,
      error: { code: 'aguinaldo-days-below-minimum', min: 15 },
    });
    expect(
      calculateAguinaldo({ salary: { amount: 0, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96' }),
    ).toMatchObject({
      ok: false,
      error: { code: 'salary-required' },
    });
    expect(
      calculateAguinaldo({
        salary: { amount: 500, period: 'diario' },
        aguinaldoDays: 15,
        year: 2026,
        startDate: '2026-05-01',
        endDate: '2026-04-01',
        withholding: 'art96',
      }),
    ).toMatchObject({ ok: false, error: { code: 'end-before-start' } });
  });

  it('refuses a year whose parameters are not published yet', () => {
    expect(
      calculateAguinaldo({ salary: { amount: 500, period: 'diario' }, aguinaldoDays: 15, year: 2027, withholding: 'art96' }),
    ).toMatchObject({
      ok: false,
      error: { code: 'params-unavailable' },
    });
  });

  it('warns when the salary is under the minimum wage of the zone', () => {
    const r = unwrap(
      calculateAguinaldo({ salary: { amount: 400, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96', zone: 'zlfn' }),
    );
    expect(r.warnings).toContain('below-minimum-wage');
  });

  it('cites the parameters it used', () => {
    const r = unwrap(
      calculateAguinaldo({ salary: { amount: 500, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96' }),
    );
    const ids = r.citations.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['mx.uma', 'mx.isr.tarifa-mensual', 'mx.lft.aguinaldo', 'mx.lisr.exenciones']));
    expect(r.citations.find((c) => c.id === 'mx.uma')?.effective_from).toBe('2026-02-01');
  });
});

describe('prima vacacional (art. 80 LFT)', () => {
  it.each(PRIMA_VACACIONAL_EXAMPLES.map((e) => [e.id, e] as const))('%s', (_id, ex) => {
    const r = unwrap(calculatePrimaVacacional(ex.input));
    expect(r.gross).toBe(ex.expected.gross);
    expect(r.exempt).toBe(ex.expected.exempt);
    expect(r.taxable).toBe(ex.expected.taxable);
    expect(r.isrArt96).toBe(ex.expected.isrArt96);
    expect(r.isrArt174).toBe(ex.expected.isrArt174);
  });

  it('CCL Sinaloa: $500 × 12 días = $6,000; prima 25 % = $1,500', () => {
    const ex = PRIMA_VACACIONAL_EXAMPLES[0];
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculatePrimaVacacional(ex.input));
    expect(r.vacationPay).toBe(6000);
    expect(r.gross).toBe(1500);
  });

  it('rejects a premium under 25 %', () => {
    expect(
      calculatePrimaVacacional({
        salary: { amount: 500, period: 'diario' },
        vacationDays: 12,
        primaPct: 20,
        paymentDate: '2026-06-01',
        withholding: 'art96',
      }),
    ).toMatchObject({ ok: false, error: { code: 'prima-below-minimum', min: 25 } });
  });
});

describe('vacaciones (art. 76 LFT, reforma 2023)', () => {
  it.each(VACACIONES_EXAMPLES.map((e) => [e.id, e] as const))('%s', (_id, ex) => {
    const r = unwrap(calculateVacaciones(ex.input));
    expect(r.seniority.completedYears).toBe(ex.expected.completedYears);
    expect(r.daysEarned).toBe(ex.expected.daysEarned);
    expect(r.daysNextYear).toBe(ex.expected.daysNextYear);
    expect(r.vacationPay).toBe(ex.expected.vacationPay);
    expect(r.primaVacacional).toBe(ex.expected.primaVacacional);
  });

  it('produces the PROFEDET/DOF 2022 table: 12,14,16,18,20, then 22…30 by five-year bands', () => {
    const rule = mxValue('mx.lft.vacaciones', '2026-01-01');
    expect([1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 25, 26, 30, 31].map((n) => vacationDaysForYear(n, rule))).toEqual([
      12, 14, 16, 18, 20, 22, 22, 24, 24, 26, 26, 28, 28, 30, 30, 32,
    ]);
    expect(vacationSchedule(rule, 30).slice(5)).toEqual([
      { from: 6, to: 10, days: 22 },
      { from: 11, to: 15, days: 24 },
      { from: 16, to: 20, days: 26 },
      { from: 21, to: 25, days: 28 },
      { from: 26, to: 30, days: 30 },
    ]);
  });

  it('keeps the pre-2023 table for older dates (6, 8, 10, 12, then +2 every 5 years)', () => {
    const rule = mxValue('mx.lft.vacaciones', '2022-06-01');
    expect([1, 2, 3, 4, 5, 9, 10].map((n) => vacationDaysForYear(n, rule))).toEqual([6, 8, 10, 12, 14, 14, 16]);
  });
});

function checkSeparation(ex: (typeof FINIQUITO_EXAMPLES)[number]) {
  const r = unwrap(calculateSeparation(ex.input));
  expect(r.seniority.completedYears).toBe(ex.expected.completedYears);
  expect(r.integratedDaily).toBe(ex.expected.integratedDaily);
  const byId = Object.fromEntries(r.concepts.map((c) => [c.id, c.gross]));
  expect(byId).toEqual(ex.expected.concepts);
  expect(r.gross).toBe(ex.expected.gross);
  expect(r.isrOrdinary).toBe(ex.expected.isrOrdinary);
  expect(r.isrSeparation).toBe(ex.expected.isrSeparation);
  expect(r.net).toBe(ex.expected.net);
  // Breakdown always adds up.
  expect(Math.round(r.concepts.reduce((a, c) => a + c.gross, 0) * 100) / 100).toBe(r.gross);
  for (const c of r.concepts) expect(Math.round((c.exempt + c.taxable) * 100) / 100).toBe(c.gross);
}

describe('finiquito (renuncia)', () => {
  it.each(FINIQUITO_EXAMPLES.map((e) => [e.id, e] as const))('%s', (_id, ex) => checkSeparation(ex));
});

describe('liquidación (arts. 48, 50, 162 LFT)', () => {
  it.each(LIQUIDACION_EXAMPLES.map((e) => [e.id, e] as const))('%s', (_id, ex) => checkSeparation(ex));

  it('CCL Sinaloa: SDI $349.31 × 5 años → $31,437.90 + $34,931.00 + $20,958.60 = $87,327.50', () => {
    const ex = LIQUIDACION_EXAMPLES[0];
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculateSeparation(ex.input));
    expect(r.separationGross).toBe(87327.5);
  });

  it('caps the prima de antigüedad at 2 × salario mínimo of the zone (art. 486)', () => {
    const ex = LIQUIDACION_EXAMPLES[1];
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculateSeparation(ex.input));
    expect(r.seniorityCap).toBe(630.08);
    expect(r.seniorityBase).toBe(630.08);
    expect(r.warnings).toContain('cap-applied');
    const zlfn = unwrap(calculateSeparation({ ...ex.input, zone: 'zlfn' }));
    expect(zlfn.seniorityCap).toBe(881.74);
  });

  it('can compare the cap with 2 UMA (minority criterion) without changing the default', () => {
    const ex = LIQUIDACION_EXAMPLES[1];
    if (!ex) throw new Error('missing example');
    const uma = unwrap(calculateSeparation({ ...ex.input, seniorityCapBase: 'uma' }));
    expect(uma.seniorityCap).toBe(234.62);
    expect(unwrap(calculateSeparation(ex.input)).seniorityCapBase).toBe('salario_minimo');
  });

  it('exempts 90 UMA per year of service, counting more than six months as a full year', () => {
    const ex = LIQUIDACION_EXAMPLES[1]; // 8 years and ~9.8 months
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculateSeparation(ex.input));
    expect(r.yearsForExemption).toBe(9);
    expect(r.separationExemptCap).toBe(95021.1);
  });

  it('pays rights according to the separation cause', () => {
    expect(separationRights('renuncia', 14, false, 15)).toEqual({ constitutional: false, twentyDays: false, seniorityPremium: false });
    expect(separationRights('renuncia', 15, false, 15)).toEqual({ constitutional: false, twentyDays: false, seniorityPremium: true });
    expect(separationRights('despido_justificado', 2, false, 15)).toEqual({
      constitutional: false,
      twentyDays: false,
      seniorityPremium: true,
    });
    expect(separationRights('despido_injustificado', 2, false, 15)).toEqual({
      constitutional: true,
      twentyDays: false,
      seniorityPremium: true,
    });
    expect(separationRights('despido_injustificado', 2, true, 15)).toEqual({
      constitutional: true,
      twentyDays: true,
      seniorityPremium: true,
    });
    expect(separationRights('rescision_trabajador', 2, false, 15)).toEqual({
      constitutional: true,
      twentyDays: true,
      seniorityPremium: true,
    });
  });

  it('excludes the aguinaldo when it was already paid', () => {
    const ex = FINIQUITO_EXAMPLES[0];
    if (!ex) throw new Error('missing example');
    const r = unwrap(calculateSeparation({ ...ex.input, aguinaldoAlreadyPaid: true }));
    expect(r.concepts.some((c) => c.id === 'aguinaldo')).toBe(false);
    expect(r.warnings).toContain('aguinaldo-already-paid-excluded');
  });
});
