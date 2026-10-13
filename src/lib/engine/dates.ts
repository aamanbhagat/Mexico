/**
 * Calendar arithmetic on ISO dates (YYYY-MM-DD), always in UTC so results never
 * depend on the visitor's time zone. Employment periods are inclusive of both the
 * first and the last day worked.
 */
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export function isIsoDate(value: string): boolean {
  const m = ISO.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(mo) - 1 && date.getUTCDate() === Number(d);
}

function toUtc(iso: string): number {
  if (!isIsoDate(iso)) throw new RangeError(`Invalid ISO date: ${iso}`);
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return fromUtc(toUtc(iso) + days * DAY_MS);
}

/** Adds calendar months; a 31st (or 29 Feb) rolls back to the last day of the target month. */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const targetMonthIndex = m - 1 + months;
  const ty = y + Math.floor(targetMonthIndex / 12);
  const tm = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return fromUtc(Date.UTC(ty, tm, Math.min(d, lastDay)));
}

export function addYears(iso: string, years: number): string {
  return addMonths(iso, years * 12);
}

/** Whole days from `a` to `b` (b − a). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

/** Days in the inclusive range [from, to]; 0 if `to` is before `from`. */
export function inclusiveDays(from: string, to: string): number {
  return Math.max(0, diffDays(from, to) + 1);
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

export function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}

export function minDate(a: string, b: string): string {
  return a < b ? a : b;
}

export interface Seniority {
  /** Full years of service completed by the last day worked. */
  completedYears: number;
  /** Anniversary that opened the current (incomplete) service year. */
  lastAnniversary: string;
  nextAnniversary: string;
  /** Days of the current service year already worked (inclusive of the last day). */
  daysIntoYear: number;
  /** Length of the current service year (365 or 366). */
  daysInServiceYear: number;
  /** completedYears + daysIntoYear / daysInServiceYear. */
  exactYears: number;
  /** Total calendar days worked, inclusive. */
  totalDays: number;
}

/**
 * Seniority for an employment that ran from `start` to `end` inclusive.
 * A year is completed on the day before each anniversary: 2020-03-01 → 2021-02-28 is one year.
 */
export function seniority(start: string, end: string): Seniority {
  if (end < start) throw new RangeError('End date is before start date');
  const endExclusive = addDays(end, 1);
  let completedYears = 0;
  while (addYears(start, completedYears + 1) <= endExclusive) completedYears += 1;
  const lastAnniversary = addYears(start, completedYears);
  const nextAnniversary = addYears(start, completedYears + 1);
  const daysIntoYear = diffDays(lastAnniversary, endExclusive);
  const daysInServiceYear = diffDays(lastAnniversary, nextAnniversary);
  return {
    completedYears,
    lastAnniversary,
    nextAnniversary,
    daysIntoYear,
    daysInServiceYear,
    exactYears: completedYears + daysIntoYear / daysInServiceYear,
    totalDays: inclusiveDays(start, end),
  };
}
