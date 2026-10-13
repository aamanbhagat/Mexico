/**
 * Editorial dates and calendar coverage for the /id/ pages. UPDATED is the date shown as
 * "Diperbarui …" and used in dateModified; bump it whenever page content or parameters change.
 */
export const UPDATED = '2026-10-13';

/**
 * Years with a published Javanese calendar. Add the next year here (and its Kemenag Hijri months
 * and SKB holidays in src/data/parameters/id/) every September–October: see docs/LAUNCH_CHECKLIST.md.
 */
export const KALENDER_YEARS = [2026, 2027] as const;
export type KalenderYear = (typeof KALENDER_YEARS)[number];

/** Indonesian month names and URL slugs (/id/kalender-jawa/2027/januari/). */
export const BULAN = [
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
export type BulanSlug = Lowercase<(typeof BULAN)[number]>;
export const BULAN_SLUGS = BULAN.map((b) => b.toLowerCase()) as BulanSlug[];

/** Time zone used for "today": Java is on WIB (UTC+7). */
export const TIME_ZONE = 'Asia/Jakarta';

/** Day the static HTML is generated (WIB); pages refresh "today" on the client. */
export const BUILD_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
