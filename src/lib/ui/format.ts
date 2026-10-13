/** Formatting helpers shared by islands and static pages (es-MX by default; dates for any locale). */

const LOCALE = 'es-MX';

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const days = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const longDates = new Map<string, Intl.DateTimeFormat>();
const shortDate = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

/** "$7,500.00" */
export function formatMoney(value: number): string {
  return money.format(Object.is(value, -0) ? 0 : value);
}

/** "7,500.00" (no currency sign), for tables and inputs. */
export function formatAmount(value: number): string {
  return plain.format(value);
}

/** "9.58" days, trimmed. */
export function formatDays(value: number): string {
  return days.format(value);
}

export function formatInteger(value: number): string {
  return integer.format(value);
}

export function formatPct(value: number): string {
  return `${days.format(value)} %`;
}

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

/** "13 de octubre de 2026" (es-MX) or "13 de outubro de 2026" (pt-BR). */
export function formatDateLongIn(iso: string, intl: string): string {
  let f = longDates.get(intl);
  if (!f) {
    f = new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    longDates.set(intl, f);
  }
  return f.format(toDate(iso));
}

/** "13 de octubre de 2026" */
export function formatDateLong(iso: string): string {
  return formatDateLongIn(iso, LOCALE);
}

/** "13/10/2026" */
export function formatDateShort(iso: string): string {
  return shortDate.format(toDate(iso));
}

/**
 * Parses what people type in a Mexican money field: "15,000", "15000.5", "$ 1,234.56".
 * In es-MX the comma groups thousands and the dot marks decimals.
 */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[^\d.]/g, '');
  if (cleaned === '' || cleaned === '.') return null;
  const [int = '', ...rest] = cleaned.split('.');
  const normalized = rest.length ? `${int}.${rest.join('')}` : int;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Today's date as ISO in Mexico City time (used for defaults on the client). */
export function todayInMexico(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts;
}
