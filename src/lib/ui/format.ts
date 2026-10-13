/**
 * Formatting helpers shared by islands and static pages. Money and parsing are es-MX (the only
 * locale with money so far); dates and integers take an Intl locale and default to es-MX.
 */

const LOCALE = 'es-MX';

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const days = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** Cached Intl.DateTimeFormat in UTC (ISO dates carry no time zone). */
function dateFormat(intl: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${intl}|${JSON.stringify(options)}`;
  let f = dateFormats.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(intl, { ...options, timeZone: 'UTC' });
    dateFormats.set(key, f);
  }
  return f;
}

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

export function formatInteger(value: number, intl = LOCALE): string {
  return intl === LOCALE ? integer.format(value) : new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(value);
}

export function formatPct(value: number): string {
  return `${days.format(value)} %`;
}

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

/** "13 de octubre de 2026" (es-MX) · "13 Oktober 2026" (id-ID) */
export function formatDateLong(iso: string, intl = LOCALE): string {
  return dateFormat(intl, { day: 'numeric', month: 'long', year: 'numeric' }).format(toDate(iso));
}

/** "13/10/2026" */
export function formatDateShort(iso: string, intl = LOCALE): string {
  return dateFormat(intl, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(toDate(iso));
}

/** "Selasa, 13 Oktober 2026" (id-ID) */
export function formatDateWithWeekday(iso: string, intl = LOCALE): string {
  return dateFormat(intl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(toDate(iso));
}

/** Localized month name of a 1-based month ("Oktober"). */
export function formatMonthName(month: number, intl = LOCALE): string {
  return dateFormat(intl, { month: 'long' }).format(new Date(Date.UTC(2026, month - 1, 1)));
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

/** Today's date as ISO in a time zone (used for defaults on the client). */
export function todayIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Today's date as ISO in Mexico City time. */
export function todayInMexico(now = new Date()): string {
  return todayIn('America/Mexico_City', now);
}
