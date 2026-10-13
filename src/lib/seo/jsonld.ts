import { SITE, absoluteUrl } from '../../config/site';

export interface Crumb {
  name: string;
  path: string;
}

export interface FaqItem {
  q: string;
  /** Plain-text answer (also rendered as the visible answer). */
  a: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function webAppLd(args: {
  name: string;
  description: string;
  path: string;
  inLanguage: string;
  dateModified: string;
  country?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    inLanguage: args.inLanguage,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requiere JavaScript para recalcular en vivo.',
    isAccessibleForFree: true,
    dateModified: args.dateModified,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
    publisher: { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
    ...(args.country ? { areaServed: { '@type': 'Country', name: args.country } } : {}),
  };
}

/** Serialises JSON-LD safely inside a <script> element. */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
