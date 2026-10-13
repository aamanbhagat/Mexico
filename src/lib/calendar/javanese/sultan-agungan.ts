/**
 * The Javanese lunar calendar of Sultan Agung (Anno Javanico), computed arithmetically:
 *
 *   - Months alternate 30 and 29 days (Suro 30, Sapar 29, … Sela 30, Besar 29).
 *   - A windu has 8 years; Ehe, Dal and Jimakir are long years (wuntu, 355 days) because
 *     Besar gets a 30th day. 5 × 354 + 3 × 355 = 2835 days per windu.
 *   - Every 120 years (a kurup) one long year is shortened, so 1 Suro of an Alip year moves one
 *     day earlier in both the week and the pasaran: Aboge (Alip Rebo Wage, 1747–1866 J) →
 *     Asapon (Alip Selasa Pon, 1867–1986 J) → Anenhing (Alip Senin Pahing, 1987–2106 J).
 *
 * Epoch: 1 Suro 1867 J (Alip, first year of Asapon) = Selasa Pon 24 March 1936 (JDN 2428252).
 * Asapon dates are computed directly; the other kurup are the same arithmetic shifted by one day.
 *
 * The "Aboge" option reproduces the communities (e.g. in Banyumas) that never left the Aboge
 * kurup: their dates run one day behind Asapon.
 *
 * Where published calendars disagree (some print the Javanese date aligned to the Hijri date
 * instead), see docs/PLAN.md › "ID-01 source conflicts". The Kemenag calendar uses this
 * arithmetic (1 Suro 1960 = 17 June 2026, one day after 1 Muharam 1448 = 16 June 2026).
 */
import { SASI, TAHUN, WINDU, type Sasi, type Tahun, type Windu } from './names';
import { mod } from './jdn';

export const ASAPON_EPOCH_JDN = 2428252; // 1 Suro 1867 J = 24 Mar 1936
export const ASAPON_EPOCH_YEAR = 1867;

/** Year lengths in windu order Alip … Jimakir. */
export const YEAR_LENGTHS = [354, 355, 354, 354, 355, 354, 354, 355] as const;
export const WINDU_DAYS = 2835;
const MONTH_LENGTHS = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29] as const;

export type Kurup = 'Aboge' | 'Asapon' | 'Anenhing';

export const KURUP: { name: Kurup; alip: string; fromYear: number; toYear: number }[] = [
  { name: 'Aboge', alip: 'Rebo Wage', fromYear: 1747, toYear: 1866 },
  { name: 'Asapon', alip: 'Selasa Pon', fromYear: 1867, toYear: 1986 },
  { name: 'Anenhing', alip: 'Senin Pahing', fromYear: 1987, toYear: 2106 },
];

/** "keraton": the kurup in force on each date (Asapon today). "aboge": Aboge communities. */
export type JavaneseConvention = 'keraton' | 'aboge';

export interface JavaneseDate {
  day: number;
  /** 1 = Suro … 12 = Besar. */
  month: number;
  monthName: Sasi;
  year: number;
  tahun: Tahun;
  /** Position in the windu, 1 = Alip … 8 = Jimakir. */
  yearOfWindu: number;
  windu: Windu;
  kurup: Kurup;
  /** Long year (wuntu, 355 days). */
  longYear: boolean;
  daysInMonth: number;
}

interface Raw {
  year: number;
  dayOfYear: number; // 0-based
}

/** Asapon arithmetic extended in both directions (no kurup shifts). */
function asaponRaw(jdn: number): Raw {
  const days = jdn - ASAPON_EPOCH_JDN;
  const windu = Math.floor(days / WINDU_DAYS);
  let rest = days - windu * WINDU_DAYS;
  let yi = 0;
  while (rest >= (YEAR_LENGTHS[yi] as number)) {
    rest -= YEAR_LENGTHS[yi] as number;
    yi += 1;
  }
  return { year: ASAPON_EPOCH_YEAR + windu * 8 + yi, dayOfYear: rest };
}

/** JDN of 1 Suro of `year` in plain Asapon arithmetic. */
function asaponNewYear(year: number): number {
  const n = year - ASAPON_EPOCH_YEAR;
  const windu = Math.floor(n / 8);
  let jdn = ASAPON_EPOCH_JDN + windu * WINDU_DAYS;
  for (let i = 0; i < mod(n, 8); i += 1) jdn += YEAR_LENGTHS[i] as number;
  return jdn;
}

const ANENHING_START_JDN = asaponNewYear(1987) - 1; // 1986 Jimakir is shortened by one day

/** Day shift relative to Asapon arithmetic, and the kurup in force. */
function shiftFor(jdn: number, convention: JavaneseConvention): { shift: number; kurup: Kurup } {
  if (convention === 'aboge') return { shift: -1, kurup: 'Aboge' };
  if (jdn < ASAPON_EPOCH_JDN) return { shift: -1, kurup: 'Aboge' };
  if (jdn >= ANENHING_START_JDN) return { shift: 1, kurup: 'Anenhing' };
  return { shift: 0, kurup: 'Asapon' };
}

function isLong(year: number): boolean {
  return (YEAR_LENGTHS[mod(year - ASAPON_EPOCH_YEAR, 8)] as number) === 355;
}

/** Earliest JDN the engine accepts for the Javanese date: 1 Suro 1747 J (start of Aboge). */
export const JAVANESE_MIN_JDN = asaponNewYear(1747) + 1;
/** Latest: end of Anenhing (1 Suro 2107 J would start the next kurup). */
export const JAVANESE_MAX_JDN = asaponNewYear(2107) - 3;

export function javaneseDate(jdn: number, convention: JavaneseConvention = 'keraton'): JavaneseDate {
  if (jdn < JAVANESE_MIN_JDN || jdn > JAVANESE_MAX_JDN) {
    throw new RangeError(`Javanese date is only computed between the Aboge and Anenhing kurup (JDN ${jdn}).`);
  }
  const { shift, kurup } = shiftFor(jdn, convention);
  const { year, dayOfYear } = asaponRaw(jdn + shift);
  const longYear = isLong(year);
  let rest = dayOfYear;
  let month = 0;
  for (;;) {
    const len = month === 11 && longYear ? 30 : (MONTH_LENGTHS[month] as number);
    if (rest < len) break;
    rest -= len;
    month += 1;
  }
  // The last year before a kurup change loses its 30th of Besar: the shifted arithmetic already
  // skips that day, so the label the shifted day lands on is correct; only the month length changes.
  const shortenedYear =
    convention === 'keraton' && ((year === ASAPON_EPOCH_YEAR - 1 && kurup === 'Aboge') || (year === 1986 && kurup === 'Asapon'));
  const effectiveLong = longYear && !shortenedYear;
  const daysInMonth = month === 11 ? (effectiveLong ? 30 : 29) : (MONTH_LENGTHS[month] as number);
  const yearOfWindu = mod(year - ASAPON_EPOCH_YEAR, 8) + 1;
  const winduIndex = mod(Math.floor((year - ASAPON_EPOCH_YEAR) / 8), 4);
  return {
    day: rest + 1,
    month: month + 1,
    monthName: SASI[month] as Sasi,
    year,
    tahun: TAHUN[yearOfWindu - 1] as Tahun,
    yearOfWindu,
    windu: WINDU[winduIndex] as Windu,
    kurup,
    longYear: effectiveLong,
    daysInMonth,
  };
}

/** JDN of 1 Suro of a Javanese year under the keraton convention. */
export function newYearJdn(year: number, convention: JavaneseConvention = 'keraton'): number {
  const base = asaponNewYear(year);
  if (convention === 'aboge') return base + 1;
  if (year < ASAPON_EPOCH_YEAR) return base + 1;
  if (year >= 1987) return base - 1;
  return base;
}

/** JDN of the first day of a Javanese month. */
export function monthStartJdn(year: number, month: number, convention: JavaneseConvention = 'keraton'): number {
  let jdn = newYearJdn(year, convention);
  for (let i = 0; i < month - 1; i += 1) jdn += MONTH_LENGTHS[i] as number;
  return jdn;
}
