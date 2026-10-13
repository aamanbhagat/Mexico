import type { IsrBracket } from '../../params/mx';

/**
 * ISR under the monthly tariff of art. 96 LISR:
 * cuota fija + (ingreso − límite inferior) × porcentaje.
 * Income that falls in the one-cent gap between brackets uses the lower bracket.
 * Returns the tariff tax before the subsidio para el empleo (not applied here).
 */
export function isrMonthly(income: number, tariff: readonly IsrBracket[]): number {
  if (!(income > 0)) return 0;
  let bracket: IsrBracket | undefined;
  for (const row of tariff) {
    if (row.lower <= income) bracket = row;
    else break;
  }
  if (!bracket) return 0;
  return bracket.fixed + (income - bracket.lower) * (bracket.rate_pct / 100);
}

/** Effective rate of a monthly salary: ISR(salary) / salary. */
export function effectiveRate(monthlySalary: number, tariff: readonly IsrBracket[]): number {
  return monthlySalary > 0 ? isrMonthly(monthlySalary, tariff) / monthlySalary : 0;
}

/**
 * Art. 96 LISR general rule: the taxable extra is added to the month's ordinary
 * income; the ISR attributable to it is the difference in tariff tax.
 */
export function isrMarginal(monthlyBase: number, taxableExtra: number, tariff: readonly IsrBracket[]): number {
  if (!(taxableExtra > 0)) return 0;
  return isrMonthly(monthlyBase + taxableExtra, tariff) - isrMonthly(monthlyBase, tariff);
}

/**
 * Art. 174 RLISR optional procedure for aguinaldo and prima vacacional:
 * 1) monthly equivalent = taxable / 365 × 30.4;
 * 2) rate = [ISR(monthly + equivalent) − ISR(monthly)] / equivalent;
 * 3) withholding = rate × taxable.
 */
export function isrArt174(
  monthlyBase: number,
  taxable: number,
  tariff: readonly IsrBracket[],
  daysInYear: number,
  daysInMonth: number,
): { withholding: number; rate: number; monthlyEquivalent: number } {
  if (!(taxable > 0)) return { withholding: 0, rate: 0, monthlyEquivalent: 0 };
  const monthlyEquivalent = (taxable / daysInYear) * daysInMonth;
  const rate = isrMarginal(monthlyBase, monthlyEquivalent, tariff) / monthlyEquivalent;
  return { withholding: rate * taxable, rate, monthlyEquivalent };
}

/**
 * Art. 96 LISR (penúltimo párrafo) for separation payments — indemnizaciones and prima
 * de antigüedad: when the taxable amount is at least the last ordinary monthly salary it
 * is taxed at that salary's effective rate; otherwise it is added to the month's income.
 */
export function isrSeparation(
  lastMonthlySalary: number,
  otherTaxableThisMonth: number,
  taxableSeparation: number,
  tariff: readonly IsrBracket[],
): { withholding: number; method: 'effective-rate' | 'added-to-income'; rate: number } {
  if (!(taxableSeparation > 0)) return { withholding: 0, method: 'effective-rate', rate: 0 };
  if (taxableSeparation >= lastMonthlySalary) {
    const rate = effectiveRate(lastMonthlySalary, tariff);
    return { withholding: taxableSeparation * rate, method: 'effective-rate', rate };
  }
  const base = lastMonthlySalary + otherTaxableThisMonth;
  const withholding = isrMarginal(base, taxableSeparation, tariff);
  return { withholding, method: 'added-to-income', rate: withholding / taxableSeparation };
}
