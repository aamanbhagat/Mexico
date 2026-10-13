/**
 * Hijri date as used in Indonesia.
 *
 * Indonesia's Ministry of Religious Affairs (Kemenag) fixes the start of each month with the
 * MABIMS criteria (moon altitude ≥ 3°, elongation ≥ 6.4°) and, for Ramadan, Syawal and Zulhijah,
 * a sidang isbat. Those dates cannot be derived reliably by a formula, so they are data: a table
 * of month starts (src/data/parameters/id/hijri-kemenag.json) passed in by the caller.
 *
 * Outside that table the engine falls back to the arithmetical (tabular, "hisab urfi") calendar,
 * which can differ from Kemenag by a day or two, and says so (`basis: 'hisab-urfi'`, approx).
 */
import { BULAN_HIJRIAH, type BulanHijriah } from './names';

/** Where a month start comes from. */
export type HijriBasis =
  /** Decided at a Kemenag sidang isbat. */
  | 'isbat'
  /** Printed in Kemenag's Kalender Hijriah Indonesia. */
  | 'kalender-kemenag'
  /** Implied by a national holiday in the SKB 3 Menteri (e.g. Maulid = 12 Rabiulawal). */
  | 'skb'
  /** Secondary sources only: may move by a day once Kemenag confirms it. */
  | 'perkiraan'
  /** Arithmetical fallback outside the table. */
  | 'hisab-urfi';

export interface HijriMonthStart {
  year: number;
  /** 1 = Muharam … 12 = Zulhijah. */
  month: number;
  /** JDN of the first day of the month. */
  startJdn: number;
  basis: Exclude<HijriBasis, 'hisab-urfi'>;
}

export interface HijriDate {
  day: number;
  month: number;
  monthName: BulanHijriah;
  year: number;
  basis: HijriBasis;
  /** True when the date may differ from Kemenag's by a day. */
  approx: boolean;
}

const ISLAMIC_EPOCH_JDN = 1948440; // 1 Muharam 1 AH = Friday 16 July 622 (Julian)

/**
 * Tabular Islamic calendar (30-year cycle, leap years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29),
 * after Reingold & Dershowitz, Calendrical Calculations, "islamic-from-fixed".
 */
export function tabularHijri(jdn: number): { year: number; month: number; day: number } {
  const year = Math.floor((30 * (jdn - ISLAMIC_EPOCH_JDN) + 10646) / 10631);
  const priorDays = jdn - tabularJdn(year, 1, 1);
  const month = Math.floor((11 * priorDays + 330) / 325);
  const day = jdn - tabularJdn(year, month, 1) + 1;
  return { year, month, day };
}

/** JDN of a tabular Hijri date. */
export function tabularJdn(year: number, month: number, day: number): number {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + ISLAMIC_EPOCH_JDN - 1;
}

/**
 * Hijri date of `jdn`. `table` must be sorted by startJdn; its last entry only closes the
 * previous month (a month needs the next month's start to know its length).
 */
export function hijriDate(jdn: number, table: readonly HijriMonthStart[] = []): HijriDate {
  const first = table[0];
  const last = table[table.length - 1];
  if (first && last && jdn >= first.startJdn && jdn < last.startJdn) {
    let i = 0;
    while (i + 1 < table.length && (table[i + 1] as HijriMonthStart).startJdn <= jdn) i += 1;
    const m = table[i] as HijriMonthStart;
    const next = table[i + 1] as HijriMonthStart;
    const day = jdn - m.startJdn + 1;
    return {
      day,
      month: m.month,
      monthName: BULAN_HIJRIAH[m.month - 1] as BulanHijriah,
      year: m.year,
      basis: m.basis,
      // An estimated start moves the whole month by up to a day. An estimated end only puts the
      // 30th in doubt (it may be the 1st of the next month): days 1–29 of a known month are certain.
      approx: m.basis === 'perkiraan' || (next.basis === 'perkiraan' && day >= 30),
    };
  }
  const t = tabularHijri(jdn);
  return { ...t, monthName: BULAN_HIJRIAH[t.month - 1] as BulanHijriah, basis: 'hisab-urfi', approx: true };
}

/** Checks a month-start table: ascending, consecutive months, 29 or 30 days each. */
export function validateHijriTable(table: readonly HijriMonthStart[]): string[] {
  const problems: string[] = [];
  for (let i = 1; i < table.length; i += 1) {
    const a = table[i - 1] as HijriMonthStart;
    const b = table[i] as HijriMonthStart;
    const expected = a.month === 12 ? { year: a.year + 1, month: 1 } : { year: a.year, month: a.month + 1 };
    if (b.year !== expected.year || b.month !== expected.month) problems.push(`${b.year}/${b.month} does not follow ${a.year}/${a.month}`);
    const len = b.startJdn - a.startJdn;
    if (len !== 29 && len !== 30) problems.push(`${a.year}/${a.month} would last ${len} days`);
  }
  return problems;
}
