import { describe, expect, it } from 'vitest';
import { buildPdf } from '../../src/lib/ui/pdf';
import { formatDateLong, formatMoney, parseAmount, todayInMexico } from '../../src/lib/ui/format';
import { bool, buildSearch, isoDate, nullableNum, oneOf, readState, type Codec } from '../../src/lib/ui/url-state';
import { alternatesFor, isLive, liveRoutes, pathFor } from '../../src/i18n/routes';
import { LOCALES, publishedLocales } from '../../src/i18n/locales';
import { reviewFor } from '../../src/lib/reviews';
import { round2 } from '../../src/lib/engine/money';

describe('es-MX formatting', () => {
  it('formats money the Mexican way', () => {
    expect(formatMoney(7500)).toBe('$7,500.00');
    expect(formatMoney(-0)).toBe('$0.00');
    expect(formatDateLong('2026-12-20')).toBe('20 de diciembre de 2026');
  });

  it('parses what people type in money fields', () => {
    expect(parseAmount('15,000')).toBe(15000);
    expect(parseAmount('$ 1,234.56')).toBe(1234.56);
    expect(parseAmount('15000.5')).toBe(15000.5);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });

  it('computes today in Mexico City, not UTC', () => {
    // 2026-10-14 03:00 UTC is still 13 October in Mexico City (UTC−6).
    expect(todayInMexico(new Date('2026-10-14T03:00:00Z'))).toBe('2026-10-13');
  });

  it('rounds money half away from zero without float artefacts', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2931.4781)).toBe(2931.48);
    expect(round2(-1.005)).toBe(-1.01);
  });
});

describe('URL state', () => {
  interface S {
    salary: number | null;
    period: 'diario' | 'mensual';
    start: string;
    paid: boolean;
  }
  const codec: Codec<S> = {
    salary: { key: 's', ...nullableNum(0, 1e6) },
    period: { key: 'p', ...oneOf(['diario', 'mensual'] as const) },
    start: { key: 'i', ...isoDate },
    paid: { key: 'ap', ...bool },
  };
  const defaults: S = { salary: null, period: 'mensual', start: '2026-01-01', paid: false };

  it('round-trips state through the query string and omits defaults', () => {
    const state: S = { salary: 500, period: 'diario', start: '2026-06-01', paid: true };
    const search = buildSearch(codec, state, defaults);
    expect(search).toBe('?s=500&p=diario&i=2026-06-01&ap=1');
    expect(readState(codec, defaults, search)).toEqual(state);
    expect(buildSearch(codec, defaults, defaults)).toBe('');
  });

  it('ignores invalid or hostile values', () => {
    expect(readState(codec, defaults, '?s=-5&p=semanal&i=2026-13-45x&ap=yes')).toEqual(defaults);
    expect(readState(codec, defaults, '?s=1e99')).toEqual(defaults);
  });
});

describe('locales, routes and hreflang', () => {
  it('publishes only es-MX for now, with the other eight defined', () => {
    expect(publishedLocales().map((l) => l.code)).toEqual(['es-mx']);
    expect(Object.keys(LOCALES).sort()).toEqual(['de', 'en', 'es-es', 'es-mx', 'id', 'ja', 'pl', 'pt-br', 'tr']);
  });

  it('emits hreflang only for live locales plus x-default', () => {
    expect(alternatesFor('home').map((a) => a.hreflang)).toEqual(['es-MX', 'x-default']);
    expect(alternatesFor('mx.aguinaldo')[0]?.href).toMatch(/\/es-mx\/calculadora-aguinaldo\/$/);
  });

  it('never lists unpublished locales as live routes', () => {
    expect(isLive('home', 'pt-br')).toBe(false);
    expect(liveRoutes().every((r) => r.locale === 'es-mx')).toBe(true);
    expect(liveRoutes()).toHaveLength(7);
    expect(pathFor('mx.uma-salario-minimo', 'es-mx')).toBe('/es-mx/uma-salario-minimo-2026/');
  });
});

describe('legal review badge is data-driven', () => {
  it('reports pending for every page until a reviewer is recorded', () => {
    for (const key of [
      'mx.aguinaldo',
      'mx.finiquito',
      'mx.liquidacion',
      'mx.prima-vacacional',
      'mx.vacaciones',
      'mx.uma-salario-minimo',
    ] as const) {
      expect(reviewFor(key).status).toBe('pending');
    }
  });
});

describe('PDF writer', () => {
  const pdf = buildPdf({
    siteName: 'Tabula',
    title: 'Cálculo de aguinaldo 2026',
    subtitle: 'Artículo 87 de la Ley Federal del Trabajo (ñ, ¿, ¡, á).',
    url: 'https://calculadoras.example/es-mx/calculadora-aguinaldo/?s=500',
    generatedOn: 'Generado el 13 de octubre de 2026',
    headline: { label: 'Aguinaldo neto', value: '$6,730.01' },
    sections: [{ title: 'Desglose', rows: [{ label: 'ISR (art. 96)', value: '−$769.99', tone: 'negative' }] }],
    notes: ['Estimación informativa.'],
  });
  const text = Buffer.from(pdf).toString('latin1');

  it('produces a well-formed PDF 1.4 file', () => {
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('has a correct cross-reference table', () => {
    const startxref = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.slice(startxref, startxref + 4)).toBe('xref');
    const offsets = [...text.slice(startxref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    offsets.forEach((off, i) => expect(text.slice(off, off + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
  });

  it('encodes Spanish characters in WinAnsi and escapes parentheses', () => {
    expect(text).toContain('C\\341lculo'); // á
    expect(text).toContain('\\(art. 96\\)');
  });
});
