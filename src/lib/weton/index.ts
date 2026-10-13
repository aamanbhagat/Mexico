/**
 * Weton domain helpers for Indonesia: binds the calendar engine to the registry (default neptu
 * table, Kemenag Hijri month starts) and evaluates the jodoh methods. Pure functions, used by the
 * static pages at build time and by the islands in the browser.
 */
import {
  dayInfo,
  neptuOf,
  type CalendarOptions,
  type DayInfo,
  type JavaneseConvention,
  type Neptu,
  type Weton,
} from '../calendar/javanese';
import {
  defaultNeptuTable,
  jodohMethods,
  kemenagHijriTable,
  wetonMethodsData,
  type JodohMethod,
  type JodohResult,
  type PangarasanLabel,
} from '../params/id';

let cached: CalendarOptions | undefined;

/** Engine options for Indonesia: default neptu table, Kemenag Hijri table, keraton (Asapon) dates. */
export function idCalendarOptions(convention: JavaneseConvention = 'keraton'): CalendarOptions {
  if (convention !== 'keraton') return { ...idCalendarOptions(), convention };
  cached ??= { neptu: defaultNeptuTable(), hijriTable: kemenagHijriTable(), convention: 'keraton' };
  return cached;
}

export function wetonDay(iso: string, convention: JavaneseConvention = 'keraton'): DayInfo {
  return dayInfo(iso, idCalendarOptions(convention));
}

export function neptuOfWeton(weton: Weton): Neptu {
  return neptuOf(weton, defaultNeptuTable());
}

/* Jodoh ------------------------------------------------------------------------------------------ */

export interface JodohOutcome {
  method: JodohMethod;
  neptuA: number;
  neptuB: number;
  total: number;
  quotient: number;
  /** Raw remainder of total ÷ divisor (0 … divisor − 1). */
  remainder: number;
  /** Remainder as the primbon counts it: 0 becomes the divisor. */
  counted: number;
  result: JodohResult;
}

export function jodohWith(method: JodohMethod, a: Weton, b: Weton): JodohOutcome {
  const neptuA = neptuOfWeton(a).total;
  const neptuB = neptuOfWeton(b).total;
  const total = neptuA + neptuB;
  const remainder = total % method.divisor;
  const counted = remainder === 0 ? method.divisor : remainder;
  const result = method.results.find((r) => r.remainder === counted);
  if (!result) throw new Error(`Method ${method.id} has no result for remainder ${counted}`);
  return { method, neptuA, neptuB, total, quotient: Math.floor(total / method.divisor), remainder, counted, result };
}

export function jodohAll(a: Weton, b: Weton): JodohOutcome[] {
  return jodohMethods().map((m) => jodohWith(m, a, b));
}

export function jodohMethodById(id: string): JodohMethod | undefined {
  return jodohMethods().find((m) => m.id === id);
}

/* Watak (tradition) ------------------------------------------------------------------------------- */

export function pangarasanOf(neptu: number): { labels: PangarasanLabel[]; note?: string | undefined } {
  const entry = wetonMethodsData().pangarasan.entries.find((e) => e.neptu === neptu);
  return entry ? { labels: entry.labels, note: entry.note } : { labels: [] };
}

export function keblatOf(pasaran: string): { arah: string; warna: string } | undefined {
  return wetonMethodsData().keblat.pasaran[pasaran];
}
