/**
 * Names of the Javanese and Islamic calendar cycles, in the spelling used by the Kementerian
 * Agama (Kemenag) calendar and most Indonesian references. Order matters: every index used by
 * the engine points into these arrays.
 */

/** Seven-day week (saptawara), Sunday first: index = (JDN + 1) mod 7. */
export const DINA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
export type Dina = (typeof DINA)[number];

/** Five-day market week (pancawara): index = JDN mod 5 (17 Aug 1945, JDN 2431685, is Legi). */
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'] as const;
export type Pasaran = (typeof PASARAN)[number];

/** The 30 wuku of the 210-day pawukon; each starts on a Sunday. */
export const WUKU = [
  'Sinta',
  'Landep',
  'Wukir',
  'Kurantil',
  'Tolu',
  'Gumbreg',
  'Warigalit',
  'Warigagung',
  'Julungwangi',
  'Sungsang',
  'Galungan',
  'Kuningan',
  'Langkir',
  'Mandasiya',
  'Julungpujut',
  'Pahang',
  'Kuruwelut',
  'Marakeh',
  'Tambir',
  'Medangkungan',
  'Maktal',
  'Wuye',
  'Manahil',
  'Prangbakat',
  'Bala',
  'Wugu',
  'Wayang',
  'Kulawu',
  'Dukut',
  'Watugunung',
] as const;
export type Wuku = (typeof WUKU)[number];

/** Months of the Sultan Agungan lunar year (Kemenag spelling; "Sura" in literary Javanese). */
export const SASI = [
  'Suro',
  'Sapar',
  'Mulud',
  'Bakdamulud',
  'Jumadilawal',
  'Jumadilakir',
  'Rejeb',
  'Ruwah',
  'Pasa',
  'Sawal',
  'Sela',
  'Besar',
] as const;
export type Sasi = (typeof SASI)[number];

/** The eight years of a windu. Ehe, Dal and Jimakir are long years (wuntu, 355 days). */
export const TAHUN = ['Alip', 'Ehe', 'Jimawal', 'Je', 'Dal', 'Be', 'Wawu', 'Jimakir'] as const;
export type Tahun = (typeof TAHUN)[number];

/** The four windu of the 32-year cycle. */
export const WINDU = ['Adi', 'Kuntara', 'Sangara', 'Sancaya'] as const;
export type Windu = (typeof WINDU)[number];

/** Islamic months, Indonesian spelling (Kemenag "Kalender Hijriah Indonesia"). */
export const BULAN_HIJRIAH = [
  'Muharam',
  'Safar',
  'Rabiulawal',
  'Rabiulakhir',
  'Jumadilawal',
  'Jumadilakhir',
  'Rajab',
  'Syakban',
  'Ramadan',
  'Syawal',
  'Zulkaidah',
  'Zulhijah',
] as const;
export type BulanHijriah = (typeof BULAN_HIJRIAH)[number];

/** URL slug of a weton ("selasa-pon"). */
export function wetonSlug(dina: Dina, pasaran: Pasaran): string {
  return `${dina}-${pasaran}`.toLowerCase();
}
