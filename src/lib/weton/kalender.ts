/**
 * Build-time model of the Javanese calendar pages: every day of a month with its weton, Javanese
 * and Hijri dates, holidays (SKB 3 Menteri) and the notable Javanese dates of the month.
 */
import { monthDays, monthWeeks, suroInYear, type DayInfo } from '../calendar/javanese';
import { holidaysOf, type Holiday } from '../params/id';
import { idCalendarOptions } from './index';

export interface KalenderDay extends DayInfo {
  holidays: Holiday[];
  /** Sunday or a national holiday: printed in red on Indonesian calendars. */
  red: boolean;
}

export interface Span {
  first: string;
  last: string;
  text: string;
}

export interface MonthModel {
  year: number;
  month: number;
  days: KalenderDay[];
  weeks: (KalenderDay | null)[][];
  javanese: Span;
  hijri: Span;
  /** Days where a Javanese month starts. */
  jawaStarts: KalenderDay[];
  /** Days where a Hijri month starts. */
  hijriStarts: KalenderDay[];
  holidays: { day: KalenderDay; holiday: Holiday }[];
  jumatKliwon: KalenderDay[];
  selasaKliwon: KalenderDay[];
}

function span(first: string, last: string, sep = '–'): Span {
  return { first, last, text: first === last ? first : `${first} ${sep} ${last}` };
}

export function monthModel(year: number, month: number): MonthModel {
  const byDate = new Map<string, Holiday[]>();
  for (const h of holidaysOf(year)) byDate.set(h.date, [...(byDate.get(h.date) ?? []), h]);
  const days: KalenderDay[] = monthDays(year, month, idCalendarOptions()).map((d) => {
    const holidays = byDate.get(d.iso) ?? [];
    return { ...d, holidays, red: d.dinaIndex === 0 || holidays.some((h) => h.kind === 'libur') };
  });
  const first = days[0] as KalenderDay;
  const last = days[days.length - 1] as KalenderDay;
  const jName = (d: DayInfo) => `${d.javanese.monthName} ${d.javanese.year}`;
  const hName = (d: DayInfo) => `${d.hijri.monthName} ${d.hijri.year} H`;
  const jawa =
    first.javanese.year === last.javanese.year
      ? span(first.javanese.monthName, last.javanese.monthName).text + ` ${last.javanese.year}`
      : `${jName(first)} – ${jName(last)}`;
  const hijri =
    first.hijri.year === last.hijri.year
      ? span(first.hijri.monthName, last.hijri.monthName).text + ` ${last.hijri.year} H`
      : `${hName(first)} – ${hName(last)}`;
  return {
    year,
    month,
    days,
    weeks: monthWeeks(days) as (KalenderDay | null)[][],
    javanese: { first: jName(first), last: jName(last), text: jawa },
    hijri: { first: hName(first), last: hName(last), text: hijri },
    jawaStarts: days.filter((d) => d.javanese.day === 1),
    hijriStarts: days.filter((d) => d.hijri.day === 1),
    holidays: days.flatMap((d) => d.holidays.map((holiday) => ({ day: d, holiday }))),
    jumatKliwon: days.filter((d) => d.weton.dina === 'Jumat' && d.weton.pasaran === 'Kliwon'),
    selasaKliwon: days.filter((d) => d.weton.dina === 'Selasa' && d.weton.pasaran === 'Kliwon'),
  };
}

export interface YearModel {
  year: number;
  months: MonthModel[];
  suro: { year: number; iso: string }[];
  /** Javanese months that start in the year. */
  jawaMonths: KalenderDay[];
}

export function yearModel(year: number): YearModel {
  const months = Array.from({ length: 12 }, (_, i) => monthModel(year, i + 1));
  return { year, months, suro: suroInYear(year), jawaMonths: months.flatMap((m) => m.jawaStarts) };
}

/** Javanese dates the calendar highlights (labels are plain descriptions, not ceremony dates). */
export const JAWA_MARKERS: { month: number; day: number; label: string }[] = [
  { month: 1, day: 1, label: '1 Suro, Tahun Baru Jawa' },
  { month: 3, day: 12, label: '12 Mulud (Muludan)' },
  { month: 9, day: 1, label: '1 Pasa' },
  { month: 10, day: 1, label: '1 Sawal (Bakda)' },
  { month: 12, day: 10, label: '10 Besar (Besaran)' },
];

export function jawaMarkerOf(d: DayInfo): string | undefined {
  return JAWA_MARKERS.find((m) => m.month === d.javanese.month && m.day === d.javanese.day)?.label;
}
