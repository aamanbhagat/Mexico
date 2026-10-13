/** Types shared by page components and content modules (kept out of .astro files so .ts can import them). */
import type { Tool } from '../../i18n/tools';

export interface RelatedLink {
  href: string;
  label: string;
  tool: Tool;
}
