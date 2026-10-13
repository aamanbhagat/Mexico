import { describe, expect, it } from 'vitest';
import {
  autoDecimals,
  catalogProblems,
  compileCatalog,
  convertArea,
  convertPrice,
  div,
  formatRational,
  fromNumber,
  isExactAt,
  mul,
  parseLocaleNumber,
  parseRational,
  rat,
  toCanonical,
  toDecimal,
  type LandUnitCatalog,
} from '../../../src/lib/land-units';

describe('exact rationals', () => {
  it('parses decimals, exponents and fractions exactly', () => {
    expect(parseRational('24200')).toEqual(rat(24200n));
    expect(parseRational('4046.8564224')).toEqual(rat(40468564224n, 10000000n));
    expect(parseRational('-1.5')).toEqual(rat(-3n, 2n));
    expect(parseRational('1e-7')).toEqual(rat(1n, 10000000n));
    expect(parseRational('400/121')).toEqual(rat(400n, 121n));
    expect(parseRational('1/0')).toBeNull();
    expect(parseRational('abc')).toBeNull();
    expect(parseRational('1,5')).toBeNull();
  });

  it('keeps 2.42 ha exact where floats drift (24 200 ÷ 10 000)', () => {
    expect(24200 / 10000 - 2.42).toBe(0); // fine here…
    expect(0.1 * 3).not.toBe(0.3); // …but not in general
    const r = div(rat(24200n), rat(10000n));
    expect(toCanonical(r)).toBe('2.42');
    expect(toCanonical(mul(fromNumber(0.1), rat(3n)))).toBe('0.3');
  });

  it('rounds half to even (ABNT NBR 5891) or half up on request', () => {
    // NBR 5891 examples: 4,5500 → 4,6 and 4,8500 → 4,8; 25,7750 → 25,78 and 31,7250 → 31,72.
    expect(toDecimal(parseRational('4.55')!, 1)).toBe('4.6');
    expect(toDecimal(parseRational('4.85')!, 1)).toBe('4.8');
    expect(toDecimal(parseRational('25.775')!, 2)).toBe('25.78');
    expect(toDecimal(parseRational('31.725')!, 2)).toBe('31.72');
    // 5 followed by a non-zero digit always rounds up.
    expect(toDecimal(parseRational('4.8501')!, 1)).toBe('4.9');
    expect(toDecimal(parseRational('2.425')!, 2, 'half-up')).toBe('2.43');
    expect(toDecimal(parseRational('-2.425')!, 2, 'half-up')).toBe('-2.43');
    expect(toDecimal(parseRational('-0.004')!, 2)).toBe('0.00');
    expect(toDecimal(rat(1n, 3n), 4)).toBe('0.3333');
  });

  it('handles units without a finite decimal (Japanese tsubo = 400/121 m²)', () => {
    // 1 坪 = 1 間² and 1 間 = 6 尺 = 20/11 m (Measurement Act units, reused later for /ja/).
    const tsubo = { area: parseRational('400/121')! };
    const m2 = { area: rat(1n) };
    expect(toCanonical(tsubo.area)).toBe('400/121');
    expect(toDecimal(convertArea(rat(1n), tsubo, m2), 4)).toBe('3.3058');
    // 1 反 = 300 坪 → 991.7355 m²
    expect(toDecimal(convertArea(rat(300n), tsubo, m2), 4)).toBe('991.7355');
    expect(isExactAt(tsubo.area, 30)).toBe(false);
  });
});

describe('locale number input and output', () => {
  it('reads pt-BR the way Brazilians type it', () => {
    expect(toCanonical(parseLocaleNumber('2,42', 'pt-BR')!)).toBe('2.42');
    expect(toCanonical(parseLocaleNumber('1.234,5', 'pt-BR')!)).toBe('1234.5');
    expect(toCanonical(parseLocaleNumber('1.234', 'pt-BR')!)).toBe('1234');
    expect(toCanonical(parseLocaleNumber('1.234.567', 'pt-BR')!)).toBe('1234567');
    expect(toCanonical(parseLocaleNumber(' 24 200 ', 'pt-BR')!)).toBe('24200');
  });

  it('forgives a dot typed as decimal mark when it cannot be grouping', () => {
    expect(toCanonical(parseLocaleNumber('2.42', 'pt-BR')!)).toBe('2.42');
    expect(toCanonical(parseLocaleNumber('0.605', 'pt-BR')!)).toBe('0.605');
    expect(toCanonical(parseLocaleNumber('1,234.5', 'pt-BR')!)).toBe('1234.5');
  });

  it('reads es-MX with the opposite convention', () => {
    expect(toCanonical(parseLocaleNumber('1,234.5', 'es-MX')!)).toBe('1234.5');
    expect(toCanonical(parseLocaleNumber('1,234', 'es-MX')!)).toBe('1234');
    expect(toCanonical(parseLocaleNumber('2,42', 'es-MX')!)).toBe('2.42');
  });

  it('rejects what is not a number', () => {
    for (const bad of ['', '.', ',', 'abc', '1,2,3', '12.34.5', '1..2', '2 ha']) {
      expect(parseLocaleNumber(bad, 'pt-BR'), bad).toBeNull();
    }
  });

  it('writes pt-BR with comma decimals, dot thousands and a real minus sign', () => {
    expect(formatRational(parseRational('24200')!, 'pt-BR', { maxDecimals: 4 })).toBe('24.200');
    expect(formatRational(parseRational('2.42')!, 'pt-BR', { maxDecimals: 4 })).toBe('2,42');
    expect(formatRational(parseRational('30991.7355')!, 'pt-BR', { maxDecimals: 2, minDecimals: 2 })).toBe('30.991,74');
    expect(formatRational(parseRational('30000')!, 'pt-BR', { maxDecimals: 2, minDecimals: 2 })).toBe('30.000,00');
    expect(formatRational(parseRational('-1.5')!, 'pt-BR', { maxDecimals: 2 })).toBe('−1,5');
    expect(formatRational(parseRational('1234.5')!, 'es-MX', { maxDecimals: 2 })).toBe('1,234.5');
  });

  it('shows enough decimals for small results', () => {
    expect(autoDecimals(parseRational('7.26')!)).toBe(4);
    // 1 m² = 0.0000413… alqueire paulista: four significant digits, not "0".
    const tiny = div(rat(1n), rat(24200n));
    const places = autoDecimals(tiny);
    expect(places).toBe(8);
    expect(formatRational(tiny, 'pt-BR', { maxDecimals: places })).toBe('0,00004132');
  });
});

describe('conversions', () => {
  const ha = { area: rat(10000n) };
  const paulista = { area: rat(24200n) };
  it('is symmetric: area there and back returns the input exactly', () => {
    const there = convertArea(rat(7n), paulista, ha);
    expect(toCanonical(convertArea(there, ha, paulista))).toBe('7');
  });

  it('converts prices per area in the opposite direction to areas', () => {
    // R$ 30.000/ha ↔ R$ 72.600 per alqueire paulista.
    expect(toCanonical(convertPrice(rat(30000n), ha, paulista))).toBe('72600');
    expect(toCanonical(convertPrice(rat(72600n), paulista, ha))).toBe('30000');
  });
});

describe('catalog validation catches broken data', () => {
  const base: LandUnitCatalog = {
    linear: { id: 'braca', name: 'braça', plural: 'braças', meters: '2.2', source: 's' },
    rounding: { mode: 'half-even', standard: 'ABNT NBR 5891', url: 'https://example.org' },
    sources: { s: { title: 'Fonte', url: 'https://example.org', kind: 'oficial', retrieved_on: '2026-10-13', opened: false } },
    units: [
      {
        id: 'a',
        family: 'alqueire',
        name: 'A',
        plural: 'As',
        symbol: 'a',
        m2: '24200',
        dims: [50, 100],
        regions: ['SP'],
        region_label: 'SP',
        source_url: 'https://example.org',
        source_title: 'Fonte oficial',
        retrieved_on: '2026-10-13',
        verified: false,
        sources: ['s'],
        also_reported: [],
      },
    ],
    states: { SP: { name: 'São Paulo', units: [{ id: 'a', status: 'usual', sources: ['s'] }], defaults: { alqueire: 'a' } } },
  };

  it('accepts a consistent catalog', () => {
    expect(catalogProblems(base)).toEqual([]);
    expect(compileCatalog(base).byId.get('a')?.area).toEqual(rat(24200n));
  });

  it('rejects dimensions that do not match the area', () => {
    const bad = structuredClone(base);
    bad.units[0]!.m2 = '24000';
    expect(catalogProblems(bad).join()).toMatch(/50×100 braças ≠ 24000 m²/);
    expect(() => compileCatalog(bad)).toThrow(/Invalid land-unit catalog/);
  });

  it('rejects unknown sources, http links and one-sided region links', () => {
    const bad = structuredClone(base);
    bad.units[0]!.sources = ['nope'];
    bad.units[0]!.source_url = 'http://example.org';
    bad.units[0]!.regions = ['SP', 'RJ'];
    bad.states['SP']!.defaults = { tarefa: 'a' };
    const problems = catalogProblems(bad).join('\n');
    expect(problems).toMatch(/unknown source "nope"/);
    expect(problems).toMatch(/source_url must be https/);
    expect(problems).toMatch(/region "RJ" is not in states/);
    expect(problems).toMatch(/defaults.tarefa: "a" is not a tarefa/);
  });
});
