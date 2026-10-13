/**
 * Locale registry. One folder per locale (`/es-mx/`, `/id/`, `/pt-br/`…).
 * A locale is only built, linked, listed in the sitemap and emitted in hreflang
 * when `published` is true. Everything else is defined so routes, formatting and
 * hreflang codes are ready the day a market launches.
 */
export const LOCALES = {
  'es-mx': {
    code: 'es-mx',
    hreflang: 'es-MX',
    htmlLang: 'es-MX',
    intl: 'es-MX',
    currency: 'MXN',
    country: 'MX',
    name: 'Español (México)',
    published: true,
  },
  'pt-br': {
    code: 'pt-br',
    hreflang: 'pt-BR',
    htmlLang: 'pt-BR',
    intl: 'pt-BR',
    currency: 'BRL',
    country: 'BR',
    name: 'Português (Brasil)',
    published: true,
  },
  id: {
    code: 'id',
    hreflang: 'id-ID',
    htmlLang: 'id',
    intl: 'id-ID',
    currency: 'IDR',
    country: 'ID',
    name: 'Bahasa Indonesia',
    published: true,
  },
  ja: {
    code: 'ja',
    hreflang: 'ja-JP',
    htmlLang: 'ja',
    intl: 'ja-JP',
    currency: 'JPY',
    country: 'JP',
    name: '日本語',
    published: false,
  },
  pl: {
    code: 'pl',
    hreflang: 'pl-PL',
    htmlLang: 'pl',
    intl: 'pl-PL',
    currency: 'PLN',
    country: 'PL',
    name: 'Polski',
    published: false,
  },
  de: {
    code: 'de',
    hreflang: 'de-DE',
    htmlLang: 'de',
    intl: 'de-DE',
    currency: 'EUR',
    country: 'DE',
    name: 'Deutsch',
    published: false,
  },
  'es-es': {
    code: 'es-es',
    hreflang: 'es-ES',
    htmlLang: 'es-ES',
    intl: 'es-ES',
    currency: 'EUR',
    country: 'ES',
    name: 'Español (España)',
    published: false,
  },
  en: {
    code: 'en',
    hreflang: 'en',
    htmlLang: 'en',
    intl: 'en-US',
    currency: 'USD',
    country: '',
    name: 'English',
    published: false,
  },
  tr: {
    code: 'tr',
    hreflang: 'tr-TR',
    htmlLang: 'tr',
    intl: 'tr-TR',
    currency: 'TRY',
    country: 'TR',
    name: 'Türkçe',
    published: false,
  },
} as const satisfies Record<string, LocaleDef>;

export interface LocaleDef {
  code: string;
  /** BCP 47 value used in hreflang. */
  hreflang: string;
  htmlLang: string;
  /** Locale passed to Intl.NumberFormat / DateTimeFormat. */
  intl: string;
  currency: string;
  country: string;
  name: string;
  published: boolean;
}

export type LocaleCode = keyof typeof LOCALES;

export const DEFAULT_LOCALE: LocaleCode = 'es-mx';

export function getLocale(code: LocaleCode): LocaleDef {
  return LOCALES[code];
}

export function isLocaleCode(value: string): value is LocaleCode {
  return Object.hasOwn(LOCALES, value);
}

export function publishedLocales(): LocaleDef[] {
  return Object.values(LOCALES).filter((l) => l.published);
}
