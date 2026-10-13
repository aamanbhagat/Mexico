/**
 * Julian Day Number arithmetic on ISO dates (proleptic Gregorian). Every cycle of the Javanese
 * calendar (week, pasaran, wuku, windu) is a plain modulo of the day count, so the whole engine
 * runs on integers: no Date objects, no time zones.
 */
import { isIsoDate } from '../../engine/dates';

export interface Ymd {
  y: number;
  m: number;
  d: number;
}

/** Fliegel & Van Flandern (1968): Gregorian date → JDN (the integer day that starts at noon). */
export function jdnFromYmd({ y, m, d }: Ymd): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function ymdFromJdn(jdn: number): Ymd {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * m + 2) / 5) + 1,
    m: m + 3 - 12 * Math.floor(m / 10),
    y: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

export function parseIso(iso: string): Ymd {
  if (!isIsoDate(iso)) throw new RangeError(`Invalid ISO date: ${iso}`);
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return { y, m, d };
}

export function jdnFromIso(iso: string): number {
  return jdnFromYmd(parseIso(iso));
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function isoFromJdn(jdn: number): string {
  const { y, m, d } = ymdFromJdn(jdn);
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Non-negative remainder (JavaScript's % keeps the sign of the dividend). */
export function mod(n: number, k: number): number {
  return ((n % k) + k) % k;
}

export function daysInGregorianMonth(y: number, m: number): number {
  return jdnFromYmd({ y: m === 12 ? y + 1 : y, m: m === 12 ? 1 : m + 1, d: 1 }) - jdnFromYmd({ y, m, d: 1 });
}
