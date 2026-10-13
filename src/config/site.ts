/**
 * Site-wide configuration. The brand name and production origin are placeholders
 * until the owner picks them (see docs/LAUNCH_CHECKLIST.md). Change them here only.
 */
export const SITE = {
  /** Working brand name. Short, neutral across the nine planned languages. */
  name: 'Tabula',
  /**
   * Production origin. Read from SITE_URL at build time so previews and
   * production can differ. `.example` is a reserved TLD: it can never go live by accident.
   */
  origin: (process.env['SITE_URL'] ?? 'https://calculadoras.example').replace(/\/$/, ''),
  /** Analytics: cookieless and self-hosted only. Empty = disabled (default). */
  analyticsScriptUrl: process.env['PUBLIC_ANALYTICS_SCRIPT_URL'] ?? '',
  analyticsWebsiteId: process.env['PUBLIC_ANALYTICS_WEBSITE_ID'] ?? '',
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE.origin}/`).toString();
}
