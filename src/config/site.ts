/**
 * Site-wide configuration. The working brand name can be changed before launch;
 * the public origin comes from SITE_URL at build time (see docs/LAUNCH_CHECKLIST.md).
 */
export const SITE = {
  /** Working brand name. Short, neutral across the nine planned languages. */
  name: 'Tabula',
  /**
   * Public origin. Astro validates SITE_URL before a build; localhost is only for development.
   */
  origin: (process.env['SITE_URL'] ?? 'http://localhost:4321').replace(/\/$/, ''),
  /** Analytics: cookieless and self-hosted only. Empty = disabled (default). */
  analyticsScriptUrl: process.env['PUBLIC_ANALYTICS_SCRIPT_URL'] ?? '',
  analyticsWebsiteId: process.env['PUBLIC_ANALYTICS_WEBSITE_ID'] ?? '',
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE.origin}/`).toString();
}
