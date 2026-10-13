/**
 * Javanese calendar engine (pure, no I/O). Given a Gregorian ISO date it returns the weekday,
 * pasaran, neptu, wuku, the Sultan Agungan date (month, year, windu, kurup) and the Hijri date.
 *
 * Inputs that are legal or methodological choices (neptu table, Kemenag month starts) are passed
 * in by the caller from the parameter registry; nothing here is hard-coded data that could change.
 * Shared by ID-01 (weton, kalender Jawa) and ID-09 (Indonesian date tools).
 */
import { isIsoDate } from '../../engine/dates';
import {
  daysUntilWeton,
  dinaIndex,
  neptuOf,
  pasaranIndex,
  wetonOf,
  wukuOf,
  type Neptu,
  type NeptuTable,
  type Weton,
  type WukuInfo,
} from './cycles';
import { hijriDate, type HijriDate, type HijriMonthStart } from './hijri';
import { daysInGregorianMonth, isoFromJdn, jdnFromIso, jdnFromYmd, parseIso } from './jdn';
import { javaneseDate, type JavaneseConvention, type JavaneseDate } from './sultan-agungan';

export * from './names';
export * from './jdn';
export * from './cycles';
export * from './hijri';
export * from './sultan-agungan';

/** Dates the engine answers for: wide enough for any living person's birth date. */
export const SUPPORTED_RANGE = { from: '1900-01-01', to: '2100-12-31' } as const;

export type CalendarError = 'invalid-date' | 'out-of-range';

export interface CalendarOptions {
  neptu: NeptuTable;
  hijriTable?: readonly HijriMonthStart[] | undefined;
  convention?: JavaneseConvention | undefined;
}

export interface DayInfo {
  iso: string;
  jdn: number;
  /** 0 = Minggu … 6 = Sabtu. */
  dinaIndex: number;
  /** 0 = Legi … 4 = Kliwon. */
  pasaranIndex: number;
  weton: Weton;
  neptu: Neptu;
  wuku: WukuInfo;
  javanese: JavaneseDate;
  hijri: HijriDate;
}

export function checkDate(iso: string): CalendarError | null {
  if (!isIsoDate(iso)) return 'invalid-date';
  if (iso < SUPPORTED_RANGE.from || iso > SUPPORTED_RANGE.to) return 'out-of-range';
  return null;
}

export function dayInfoJdn(jdn: number, opts: CalendarOptions): DayInfo {
  const weton = wetonOf(jdn);
  return {
    iso: isoFromJdn(jdn),
    jdn,
    dinaIndex: dinaIndex(jdn),
    pasaranIndex: pasaranIndex(jdn),
    weton,
    neptu: neptuOf(weton, opts.neptu),
    wuku: wukuOf(jdn),
    javanese: javaneseDate(jdn, opts.convention),
    hijri: hijriDate(jdn, opts.hijriTable),
  };
}

/** Everything about one day. Throws RangeError for invalid or unsupported dates (see checkDate). */
export function dayInfo(iso: string, opts: CalendarOptions): DayInfo {
  const err = checkDate(iso);
  if (err) throw new RangeError(`${err}: ${iso}`);
  return dayInfoJdn(jdnFromIso(iso), opts);
}

/** Every day of a Gregorian month (1–12), in order. */
export function monthDays(year: number, month: number, opts: CalendarOptions): DayInfo[] {
  const first = jdnFromYmd({ y: year, m: month, d: 1 });
  return Array.from({ length: daysInGregorianMonth(year, month) }, (_, i) => dayInfoJdn(first + i, opts));
}

/** Calendar weeks (Minggu-first) for a month grid; null pads the days outside the month. */
export function monthWeeks(days: readonly DayInfo[]): (DayInfo | null)[][] {
  const first = days[0];
  if (!first) return [];
  const cells: (DayInfo | null)[] = [...Array<null>(first.dinaIndex).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks: (DayInfo | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** The next `count` dates (from `iso` inclusive) that fall on a weton: one every 35 days. */
export function nextWetonDates(iso: string, weton: Weton, count: number): string[] {
  const first = jdnFromIso(iso) + daysUntilWeton(jdnFromIso(iso), weton);
  return Array.from({ length: count }, (_, i) => isoFromJdn(first + 35 * i));
}

/** All dates in [fromIso, toIso] that fall on a weton. */
export function wetonDatesBetween(fromIso: string, toIso: string, weton: Weton): string[] {
  const end = jdnFromIso(toIso);
  const out: string[] = [];
  for (let jdn = jdnFromIso(fromIso) + daysUntilWeton(jdnFromIso(fromIso), weton); jdn <= end; jdn += 35) out.push(isoFromJdn(jdn));
  return out;
}

export { parseIso };
