/**
 * Exact rational arithmetic on BigInt fractions.
 *
 * Land units are defined by exact areas: 24 200 m², 4 046.856 422 4 m² (acre) or 400/121 m²
 * (the Japanese tsubo, which has no finite decimal expansion). Converting with floats turns
 * 2.42 ha into 2.4199999999999999 and makes rounding at the last shown digit unreliable.
 * Every conversion therefore runs on reduced fractions and is rounded once, for display.
 */
export interface Rational {
  /** Numerator (carries the sign). */
  readonly n: bigint;
  /** Denominator, always > 0. */
  readonly d: bigint;
}

const ZERO = 0n;
const ONE = 1n;
const TEN = 10n;

function gcd(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) [x, y] = [y, x % y];
  return x;
}

export function rat(n: bigint, d: bigint = ONE): Rational {
  if (d === ZERO) throw new RangeError('Denominator cannot be zero');
  if (d < ZERO) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return g > ONE ? { n: n / g, d: d / g } : { n, d };
}

const DECIMAL = /^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;
const FRACTION = /^([+-]?\d+)\/(\d+)$/;

/**
 * Parses a canonical number string: "24200", "-1.5", "4046.8564224", "1e-7" or "400/121".
 * Locale-formatted input ("1.234,5") goes through `parseLocaleNumber` first.
 */
export function parseRational(text: string): Rational | null {
  const s = text.trim();
  const f = FRACTION.exec(s);
  if (f) {
    const d = BigInt(f[2] as string);
    return d === ZERO ? null : rat(BigInt(f[1] as string), d);
  }
  const m = DECIMAL.exec(s);
  if (!m) return null;
  const [, sign, int = '0', frac = '', exp = '0'] = m;
  let n = BigInt(int + frac);
  let d = TEN ** BigInt(frac.length);
  const e = Number(exp);
  if (Math.abs(e) > 400) return null;
  if (e > 0) n *= TEN ** BigInt(e);
  if (e < 0) d *= TEN ** BigInt(-e);
  return rat(sign === '-' ? -n : n, d);
}

/** Exact value of what a JS number prints as (its shortest round-trip decimal). */
export function fromNumber(x: number): Rational {
  if (!Number.isFinite(x)) throw new RangeError(`Not a finite number: ${x}`);
  return parseRational(String(x)) as Rational;
}

export const mul = (a: Rational, b: Rational): Rational => rat(a.n * b.n, a.d * b.d);
export const div = (a: Rational, b: Rational): Rational => {
  if (b.n === ZERO) throw new RangeError('Division by zero');
  return rat(a.n * b.d, a.d * b.n);
};
export const add = (a: Rational, b: Rational): Rational => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rational, b: Rational): Rational => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const cmp = (a: Rational, b: Rational): -1 | 0 | 1 => {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
};
export const equals = (a: Rational, b: Rational): boolean => a.n === b.n && a.d === b.d;
export const isZero = (a: Rational): boolean => a.n === ZERO;
export const isNegative = (a: Rational): boolean => a.n < ZERO;

/** Float approximation (for animation and square roots only, never for shown figures). */
export function toNumber(a: Rational): number {
  // Scale down huge parts first so very large or precise values do not overflow to Infinity/NaN.
  const s = toDecimal(a, 17, 'half-even');
  return Number(s);
}

export type RoundingMode = 'half-even' | 'half-up';

/**
 * Rounds to `decimals` places and returns a canonical string ("2.42", "-0.5", "4"),
 * always with exactly `decimals` digits after the point.
 * `half-even` follows ABNT NBR 5891 (a 5 followed only by zeros rounds to the even digit);
 * `half-up` rounds ties away from zero, like most spreadsheets.
 */
export function toDecimal(a: Rational, decimals: number, mode: RoundingMode = 'half-even'): string {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 40) throw new RangeError(`Bad decimals: ${decimals}`);
  const negative = a.n < ZERO;
  const absN = negative ? -a.n : a.n;
  const scale = TEN ** BigInt(decimals);
  const scaled = absN * scale;
  let q = scaled / a.d;
  const r = scaled % a.d;
  const twice = r * 2n;
  if (twice > a.d || (twice === a.d && (mode === 'half-up' || q % 2n === ONE))) q += ONE;
  let digits = q.toString();
  if (decimals > 0) {
    digits = digits.padStart(decimals + 1, '0');
    digits = `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
  }
  const isZeroResult = q === ZERO;
  return negative && !isZeroResult ? `-${digits}` : digits;
}

/** True when `a` has a finite decimal expansion with at most `decimals` places. */
export function isExactAt(a: Rational, decimals: number): boolean {
  return (a.n * TEN ** BigInt(decimals)) % a.d === ZERO;
}

/** True when the fraction has any finite decimal expansion (denominator only has 2s and 5s). */
export function isTerminating(a: Rational): boolean {
  let d = a.d;
  while (d % 2n === ZERO) d /= 2n;
  while (d % 5n === ZERO) d /= 5n;
  return d === ONE;
}

/** Canonical string for storage/URLs: exact decimal when terminating, else "n/d". */
export function toCanonical(a: Rational): string {
  if (!isTerminating(a)) return `${a.n}/${a.d}`;
  for (let k = 0; k <= 60; k += 1) if (isExactAt(a, k)) return trimZeros(toDecimal(a, k));
  return `${a.n}/${a.d}`;
}

export function trimZeros(s: string): string {
  if (!s.includes('.')) return s;
  return s.replace(/0+$/, '').replace(/\.$/, '');
}
