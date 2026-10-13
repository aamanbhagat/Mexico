/**
 * Locale-aware reading and writing of exact numbers. Separators come from Intl, so the same
 * code serves pt-BR (1.234,56), es-MX (1,234.56), id-ID (1.234,56), ja-JP (1,234.56),
 * pl-PL (1 234,56) and tr-TR (1.234,56).
 */
import { parseRational, toDecimal, isExactAt, trimZeros, type Rational, type RoundingMode } from './rational';

export interface Separators {
  group: string;
  decimal: string;
}

const cache = new Map<string, Separators>();

export function separatorsFor(locale: string): Separators {
  const hit = cache.get(locale);
  if (hit) return hit;
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(1234567.5);
  const seps = {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
  cache.set(locale, seps);
  return seps;
}

const SPACES = /[\s\u00a0\u202f]/g;

/**
 * Reads what a person types in a number field, forgiving the usual mix-ups:
 *  - "1.234,5" and "1234,5" in pt-BR; "1,234.5" and "1234.5" in es-MX;
 *  - the other locale's decimal mark when it cannot be a thousands separator
 *    ("2.42" in pt-BR is 2,42 because a group always has three digits);
 *  - spaces and narrow no-break spaces as thousands separators (pl-PL, fr).
 * Returns null for anything that is not a plain non-negative or negative number.
 */
export function parseLocaleNumber(text: string, locale: string): Rational | null {
  const { group, decimal } = separatorsFor(locale);
  let s = text.trim().replace(SPACES, '');
  if (s === '') return null;
  s = s.replace(/^\+/, '');
  const sign = s.startsWith('-') || s.startsWith('−') ? '-' : '';
  s = s.replace(/^[-−]/, '');
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const other = decimal === ',' ? '.' : ',';
  const hasDecimal = s.includes(decimal);
  const hasOther = s.includes(other);
  let normalized: string;

  if (hasDecimal && hasOther) {
    // Both marks: the last one is the decimal mark, the other groups thousands.
    const lastDec = s.lastIndexOf(decimal);
    const lastOther = s.lastIndexOf(other);
    const dec = lastDec > lastOther ? decimal : other;
    const grp = dec === decimal ? other : decimal;
    const [int = '', frac = ''] = splitOnce(s, dec);
    if (frac.includes(grp) || !validGroups(int, grp)) return null;
    normalized = `${int.split(grp).join('')}.${frac}`;
  } else if (hasDecimal) {
    const pieces = s.split(decimal);
    if (pieces.length > 2) {
      // "1,234,567" in a comma-decimal locale can only be grouping typed the other way.
      if (!validGroups(s, decimal)) return null;
      normalized = pieces.join('');
    } else {
      normalized = `${pieces[0]}.${pieces[1]}`;
    }
  } else if (hasOther) {
    const pieces = s.split(other);
    const looksGrouped = validGroups(s, other) && pieces.length >= 2 && (other === group || pieces.length > 2);
    if (looksGrouped && (pieces.length > 2 || (pieces[1] as string).length === 3)) {
      normalized = pieces.join('');
    } else if (pieces.length === 2) {
      normalized = `${pieces[0]}.${pieces[1]}`;
    } else {
      return null;
    }
  } else {
    normalized = s;
  }
  if (normalized.startsWith('.')) normalized = `0${normalized}`;
  if (normalized.endsWith('.')) normalized = normalized.slice(0, -1);
  return parseRational(sign + normalized);
}

function splitOnce(s: string, sep: string): [string, string] {
  const i = s.lastIndexOf(sep);
  return [s.slice(0, i), s.slice(i + 1)];
}

/** "1.234.567" is well grouped; "12.34" is not. */
function validGroups(int: string, sep: string): boolean {
  if (!int.includes(sep)) return true;
  const parts = int.split(sep);
  const [head = '', ...rest] = parts;
  // A grouped number never starts with 0 ("0.605" is a decimal, not 605).
  return head.length >= 1 && head.length <= 3 && !head.startsWith('0') && rest.every((p) => p.length === 3);
}

export interface FormatOptions {
  /** Most decimals shown. */
  maxDecimals: number;
  /** Fewest decimals shown (trailing zeros beyond it are trimmed). */
  minDecimals?: number;
  mode?: RoundingMode;
  /** Group thousands (default true). */
  grouping?: boolean;
}

/** Formats an exact value with the locale's separators, rounding once (ABNT NBR 5891 by default). */
export function formatRational(value: Rational, locale: string, opts: FormatOptions): string {
  const { group, decimal } = separatorsFor(locale);
  const min = opts.minDecimals ?? 0;
  let s = toDecimal(value, opts.maxDecimals, opts.mode ?? 'half-even');
  if (opts.maxDecimals > min) {
    const [i = '', f = ''] = s.split('.');
    const trimmed = trimZeros(`${i}.${f}`);
    const [ti = '', tf = ''] = trimmed.split('.');
    s = tf.length < min ? `${ti}.${tf.padEnd(min, '0')}` : trimmed;
  }
  const negative = s.startsWith('-');
  const [int = '', frac] = (negative ? s.slice(1) : s).split('.');
  const grouped = opts.grouping === false ? int : int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${negative ? '−' : ''}${grouped}${frac ? `${decimal}${frac}` : ''}`;
}

/** True when the shown figure equals the exact value (no rounding happened). */
export function isShownExactly(value: Rational, maxDecimals: number): boolean {
  return isExactAt(value, maxDecimals);
}
