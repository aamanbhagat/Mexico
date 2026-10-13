/** Types shared by page components and content modules (kept out of .astro files so .ts can import them). */
export type StationTool =
  'aguinaldo' | 'finiquito' | 'liquidacion' | 'prima-vacacional' | 'vacaciones' | 'uma' | 'weton' | 'jodoh' | 'kalender' | 'hari-ini';

export interface RelatedLink {
  href: string;
  label: string;
  tool: StationTool;
}
