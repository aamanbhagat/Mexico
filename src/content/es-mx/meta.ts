/**
 * Editorial dates for the es-MX pages. UPDATED is the date shown as "Actualizado el …"
 * and used in dateModified; bump it whenever page content or parameters change.
 */
export const UPDATED = '2026-10-13';

/** Day the static HTML is generated; the calculators replace it with the visitor's date on load. */
export const BUILD_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Mexico_City',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
