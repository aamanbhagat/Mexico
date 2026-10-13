/**
 * The repeating cycles counted on the Julian Day Number:
 *   - dina (7-day week)        index = (JDN + 1) mod 7, 0 = Minggu
 *   - pasaran (5-day week)     index = JDN mod 5, 0 = Legi
 *   - weton (selapan, 35 days) the pair (dina, pasaran); 7 and 5 are coprime, so every pair
 *                              occurs exactly once every 35 days
 *   - wuku (pawukon, 210 days) 30 weeks of 7 days, each starting on a Sunday
 *
 * Anchors (see tests/unit/calendar/javanese.test.ts for the sources):
 *   - 17 Aug 1945 (JDN 2431685) was Jumat Legi.
 *   - Wuku Sinta began on Sunday 1 Nov 2026 (wuku Kulawu ran 11–17 Oct 2026 and Tolu 29 Nov–5 Dec 2026
 *     per Kemenag-based calendars; Balinese Galungan, Rabu Kliwon of the 11th wuku, fell on 17 Jun 2026).
 */
import { DINA, PASARAN, WUKU, type Dina, type Pasaran, type Wuku } from './names';
import { mod } from './jdn';

export function dinaIndex(jdn: number): number {
  return mod(jdn + 1, 7);
}

export function pasaranIndex(jdn: number): number {
  return mod(jdn, 5);
}

export function dinaOf(jdn: number): Dina {
  return DINA[dinaIndex(jdn)] as Dina;
}

export function pasaranOf(jdn: number): Pasaran {
  return PASARAN[pasaranIndex(jdn)] as Pasaran;
}

/** JDN of the first day (Minggu) of wuku Sinta in a known cycle: 1 Nov 2026. */
export const WUKU_SINTA_ANCHOR_JDN = 2461346;

export interface WukuInfo {
  /** 0 = Sinta … 29 = Watugunung. */
  index: number;
  name: Wuku;
  /** Day within the wuku week, 0 = Minggu. */
  day: number;
  /** Day within the 210-day pawukon, 0-based. */
  dayOfPawukon: number;
}

export function wukuOf(jdn: number): WukuInfo {
  const dayOfPawukon = mod(jdn - WUKU_SINTA_ANCHOR_JDN, 210);
  const index = Math.floor(dayOfPawukon / 7);
  return { index, name: WUKU[index] as Wuku, day: dayOfPawukon % 7, dayOfPawukon };
}

/* Weton and neptu ----------------------------------------------------------------------------- */

export interface Weton {
  dina: Dina;
  pasaran: Pasaran;
}

/** Neptu values per day and per pasaran (kept in the parameter registry, passed in here). */
export interface NeptuTable {
  dina: Record<Dina, number>;
  pasaran: Record<Pasaran, number>;
}

export interface Neptu {
  dina: number;
  pasaran: number;
  total: number;
}

export function wetonOf(jdn: number): Weton {
  return { dina: dinaOf(jdn), pasaran: pasaranOf(jdn) };
}

export function neptuOf(weton: Weton, table: NeptuTable): Neptu {
  const dina = table.dina[weton.dina];
  const pasaran = table.pasaran[weton.pasaran];
  return { dina, pasaran, total: dina + pasaran };
}

/** All 35 weton, Minggu Legi first, ordered by day then pasaran. */
export function allWeton(): Weton[] {
  return DINA.flatMap((dina) => PASARAN.map((pasaran) => ({ dina, pasaran })));
}

/** Days from `jdn` (inclusive) to the next day with this weton: 0–34. */
export function daysUntilWeton(jdn: number, weton: Weton): number {
  const wantDina = DINA.indexOf(weton.dina);
  const wantPasaran = PASARAN.indexOf(weton.pasaran);
  for (let k = 0; k < 35; k += 1) {
    if (dinaIndex(jdn + k) === wantDina && pasaranIndex(jdn + k) === wantPasaran) return k;
  }
  /* c8 ignore next */
  throw new Error('unreachable: every weton occurs within 35 days');
}

/** Wuku in which a weton falls: six of the thirty, since 210 / 35 = 6. */
export function wukuOfWeton(weton: Weton): Wuku[] {
  const start = WUKU_SINTA_ANCHOR_JDN;
  const first = start + daysUntilWeton(start, weton);
  return Array.from({ length: 6 }, (_, i) => wukuOf(first + 35 * i).name);
}
