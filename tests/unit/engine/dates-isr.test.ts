import { describe, expect, it } from 'vitest';
import { addMonths, inclusiveDays, isIsoDate, seniority } from '../../../src/lib/engine/dates';
import { round2 } from '../../../src/lib/engine/money';
import { effectiveRate, isrArt174, isrMarginal, isrMonthly, isrSeparation } from '../../../src/lib/engine/mx/isr';
import { mxValue } from '../../../src/lib/params/mx';

const T2026 = mxValue('mx.isr.tarifa-mensual', '2026-06-01');

describe('dates', () => {
  it('validates ISO dates strictly', () => {
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
  });

  it('counts inclusive days (INADEM: 1 jun – 31 dic = 214)', () => {
    expect(inclusiveDays('2026-06-01', '2026-12-31')).toBe(214);
    // CCL Sinaloa: 1 may – 19 dic = 233
    expect(inclusiveDays('2025-05-01', '2025-12-19')).toBe(233);
  });

  it('completes a year the day before the anniversary', () => {
    expect(seniority('2020-03-01', '2021-02-28').completedYears).toBe(1);
    expect(seniority('2020-03-01', '2021-02-27').completedYears).toBe(0);
    const s = seniority('2021-10-16', '2026-10-15');
    expect(s.completedYears).toBe(5);
    expect(s.exactYears).toBe(5);
  });

  it('handles 29 February starts', () => {
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(seniority('2024-02-29', '2025-02-27').completedYears).toBe(1);
  });
});

describe('ISR monthly tariff 2026 (Anexo 8 RMF 2026, art. 96 LISR)', () => {
  it('matches the published example: $15,000 → $1,402.82', () => {
    // 1,339.14 + (15,000 − 14,644.65) × 17.92 % = 1,402.82 (example reproduced by several tariff publishers)
    expect(round2(isrMonthly(15000, T2026))).toBe(1402.82);
  });

  it('applies the first bracket at 1.92 %', () => {
    expect(round2(isrMonthly(800, T2026))).toBe(round2((800 - 0.01) * 0.0192));
  });

  it('is zero for zero income and continuous at bracket limits', () => {
    expect(isrMonthly(0, T2026)).toBe(0);
    for (const row of T2026.slice(1)) {
      const below = isrMonthly(row.lower - 0.01, T2026);
      const at = isrMonthly(row.lower, T2026);
      expect(Math.abs(at - below)).toBeLessThan(0.02);
    }
  });

  it('marginal ISR equals tariff difference', () => {
    expect(isrMarginal(15200, 3980.7, T2026)).toBeCloseTo(isrMonthly(19180.7, T2026) - isrMonthly(15200, T2026), 10);
  });

  it('art. 174 RLISR never withholds more than art. 96 on a progressive tariff', () => {
    for (const [base, taxable] of [
      [9582.47, 1206.3],
      [15200, 3980.7],
      [25000, 21480.7],
      [80000, 60000],
    ] as const) {
      const a96 = isrMarginal(base, taxable, T2026);
      const a174 = isrArt174(base, taxable, T2026, 365, 30.4).withholding;
      expect(a174).toBeLessThanOrEqual(a96 + 1e-9);
    }
  });

  it('separation payments ≥ last monthly salary use its effective rate', () => {
    const r = isrSeparation(10000, 0, 35000, T2026);
    expect(r.method).toBe('effective-rate');
    expect(r.withholding).toBeCloseTo(35000 * effectiveRate(10000, T2026), 10);
  });

  it('separation payments below the monthly salary are added to income', () => {
    const r = isrSeparation(30000, 0, 5000, T2026);
    expect(r.method).toBe('added-to-income');
    expect(r.withholding).toBeCloseTo(isrMarginal(30000, 5000, T2026), 10);
  });
});
