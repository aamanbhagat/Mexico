import archive from '../../data/parameters/mx/udis.json';
import { mexicoDay } from './date';

export interface UdiRecord {
  value: string;
  effective_from: string;
  source_url: string;
  source_title: string;
  retrieved_on: string;
  retrieved_at: string;
  verified: boolean;
  notes: string;
}

export const UDI_RECORDS: UdiRecord[] = archive.rates;
export const UDI_BY_DATE = new Map(UDI_RECORDS.map((rate) => [rate.effective_from, rate]));
export const UDI_RETRIEVED_AT = archive.retrieved_at;
export const UDI_FIRST_DAY = UDI_RECORDS[0]?.effective_from ?? '';
export const UDI_LAST_DAY = UDI_RECORDS.at(-1)?.effective_from ?? '';
export const UDI_BUILD_DAY = mexicoDay();

if (!UDI_BY_DATE.has(UDI_BUILD_DAY)) throw new Error(`No Banxico SP68257 rate dated ${UDI_BUILD_DAY}; refusing to build`);

export function udiFor(date: string): UdiRecord {
  const rate = UDI_BY_DATE.get(date);
  if (!rate) throw new Error(`No Banxico SP68257 rate dated ${date}`);
  return rate;
}

export function yearDates(year: number): UdiRecord[] {
  return UDI_RECORDS.filter((rate) => rate.effective_from.startsWith(`${year}-`) && rate.effective_from <= UDI_BUILD_DAY);
}

export function monthEndChart(end: string): UdiRecord[] {
  const [year, month] = end.split('-').map(Number) as [number, number];
  const points: UdiRecord[] = [];
  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const monthEnd = new Date(Date.UTC(year, month - monthsAgo, 0)).toISOString().slice(0, 10);
    const day = monthsAgo === 0 ? end : monthEnd;
    const rate = UDI_BY_DATE.get(day);
    if (rate) points.push(rate);
  }
  return points;
}
