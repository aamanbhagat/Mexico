/**
 * Indonesian wording shared by the weton islands and the static /id/ pages: date parts, how a
 * Javanese or Hijri date is written, and what each Hijri "basis" means. Kept small: it ships in
 * the islands' JavaScript.
 */
import type { DayInfo, HijriBasis, HijriDate, JavaneseDate, Weton } from '../../lib/calendar/javanese';
import { formatDateLong, formatDateWithWeekday } from '../../lib/ui/format';

export const INTL = 'id-ID';

export const BULAN_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const DATE_PART_LABELS = { day: 'Tanggal', month: 'Bulan', year: 'Tahun', choose: 'Pilih' };

export const tanggal = (iso: string) => formatDateLong(iso, INTL);
export const tanggalHari = (iso: string) => formatDateWithWeekday(iso, INTL);

export function wetonName(w: Weton): string {
  return `${w.dina} ${w.pasaran}`;
}

/** "1 Jumadilawal 1960" */
export function jawaShort(j: JavaneseDate): string {
  return `${j.day} ${j.monthName} ${j.year}`;
}

/** "1 Jumadilawal 1960, tahun Be, windu Sancaya" */
export function jawaLong(j: JavaneseDate): string {
  return `${jawaShort(j)}, tahun ${j.tahun}, windu ${j.windu}`;
}

/** "2 Jumadilawal 1448 H" (with ≈ when it may move by a day) */
export function hijriShort(h: HijriDate): string {
  return `${h.approx ? '≈ ' : ''}${h.day} ${h.monthName} ${h.year} H`;
}

export const BASIS_LABEL: Record<HijriBasis, string> = {
  isbat: 'hasil sidang isbat Kemenag',
  'kalender-kemenag': 'Kalender Hijriah Indonesia (Kemenag)',
  skb: 'mengikuti tanggal libur SKB 3 Menteri',
  perkiraan: 'perkiraan; menunggu ketetapan Kemenag',
  'hisab-urfi': 'hisab urfi (aritmetika); bisa selisih 1–2 hari dari Kemenag',
};

/** One-line summary used by copy-to-clipboard. */
export function daySummary(d: DayInfo): string {
  return [
    `${tanggalHari(d.iso)}`,
    `Weton: ${wetonName(d.weton)} (neptu ${d.neptu.total} = ${d.weton.dina} ${d.neptu.dina} + ${d.weton.pasaran} ${d.neptu.pasaran})`,
    `Tanggal Jawa: ${jawaLong(d.javanese)}`,
    `Hijriah: ${hijriShort(d.hijri)}`,
    `Wuku: ${d.wuku.name}`,
  ].join('\n');
}
