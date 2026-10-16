import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { coverage, validateParamFile, versionOn } from '../../src/lib/params/loader';
import { MX_PARAM_FILES, mxParam, mxValue } from '../../src/lib/params/mx';
import { ID_PARAM_FILES } from '../../src/lib/params/id';
import { BR_PARAM_FILES } from '../../src/lib/params/br';
import { ParamNotAvailableError } from '../../src/lib/params/types';

const DIR = join(process.cwd(), 'src/data/parameters');

function allParamFiles(): { path: string; json: unknown }[] {
  const out: { path: string; json: unknown }[] = [];
  for (const country of readdirSync(DIR)) {
    for (const file of readdirSync(join(DIR, country))) {
      if (file.endsWith('.json'))
        out.push({ path: `${country}/${file}`, json: JSON.parse(readFileSync(join(DIR, country, file), 'utf8')) });
    }
  }
  return out;
}

describe('parameter registry contract (AGENTS.md §1)', () => {
  const files = allParamFiles();

  it('finds parameter files', () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
  });

  it.each(files.map((f) => [f.path, f.json] as const))('%s has value, dates, source, verified flag and notes', (path, json) => {
    expect(() => validateParamFile(json, path)).not.toThrow();
  });

  it('registers every mx JSON file in the typed registry', () => {
    const ids = new Set(Object.keys(MX_PARAM_FILES));
    for (const { path, json } of files.filter((f) => f.path.startsWith('mx/'))) {
      expect(ids.has((json as { id: string }).id), path).toBe(true);
    }
  });

  it('registers every id JSON file in the typed registry, and every cited reference exists', () => {
    const ids = new Set(Object.keys(ID_PARAM_FILES));
    for (const { path, json } of files.filter((f) => f.path.startsWith('id/'))) {
      expect(ids.has((json as { id: string }).id), path).toBe(true);
      const refs = (json as { references?: Record<string, { url: string; title: string }> }).references ?? {};
      for (const [key, ref] of Object.entries(refs)) {
        expect(ref.url, `${path} › ${key}`).toMatch(/^https:\/\//);
        expect(ref.title.length, `${path} › ${key}`).toBeGreaterThan(5);
      }
      // Every "refs": ["key"] anywhere in the file points to a declared reference.
      for (const m of JSON.stringify((json as { versions: unknown }).versions).matchAll(/"refs":\[([^\]]*)\]/g)) {
        for (const key of (m[1] ?? '').split(',').filter(Boolean))
          expect(Object.hasOwn(refs, JSON.parse(key)), `${path} › ${key}`).toBe(true);
      }
    }
  });

  it('registers every br JSON file in the typed registry', () => {
    const ids = new Set(Object.keys(BR_PARAM_FILES));
    const br = files.filter((f) => f.path.startsWith('br/'));
    expect(br.length).toBeGreaterThanOrEqual(1);
    for (const { path, json } of br) expect(ids.has((json as { id: string }).id), path).toBe(true);
  });

  it('rejects a version without a source', () => {
    const bad = {
      id: 'x',
      name: 'x',
      unit: 'x',
      description: 'x',
      versions: [{ value: 1, effective_from: '2026-01-01', retrieved_on: '2026-10-13', verified: false, notes: '' }],
    };
    expect(() => validateParamFile(bad)).toThrow(/source_url/);
  });

  it('rejects versions out of order', () => {
    const v = { value: 1, retrieved_on: '2026-10-13', source_url: 'https://a.mx', source_title: 'Fuente', verified: false, notes: '' };
    const bad = {
      id: 'x',
      name: 'x',
      unit: 'x',
      description: 'x',
      versions: [
        { ...v, effective_from: '2026-01-01' },
        { ...v, effective_from: '2025-01-01' },
      ],
    };
    expect(() => validateParamFile(bad)).toThrow(/ascending/);
  });
});

describe('loader picks the value in force on a date', () => {
  // UMA changes on 1 February (Ley para Determinar el Valor de la UMA, art. 5).
  it('uses UMA 2025 in January 2026 and UMA 2026 from 1 February', () => {
    expect(mxValue('mx.uma', '2026-01-31').daily).toBe(113.14);
    expect(mxValue('mx.uma', '2026-02-01').daily).toBe(117.31);
    expect(mxValue('mx.uma', '2025-01-15').daily).toBe(108.57);
  });

  it('uses the 2026 minimum wages from 1 January 2026', () => {
    expect(mxValue('mx.salario-minimo.general', '2025-12-31')).toBe(278.8);
    expect(mxValue('mx.salario-minimo.general', '2026-01-01')).toBe(315.04);
    expect(mxValue('mx.salario-minimo.zlfn', '2026-06-30')).toBe(440.87);
  });

  it('switches ISR tariff on 1 January 2026 (Anexo 8 RMF 2026)', () => {
    expect(mxValue('mx.isr.tarifa-mensual', '2025-12-31')[1]?.lower).toBe(746.05);
    expect(mxValue('mx.isr.tarifa-mensual', '2026-01-01')[1]?.lower).toBe(844.6);
  });

  it('switches vacation rule on 1 January 2023 (vacaciones dignas)', () => {
    expect(mxValue('mx.lft.vacaciones', '2022-12-31').first_year).toBe(6);
    expect(mxValue('mx.lft.vacaciones', '2023-01-01').first_year).toBe(12);
  });

  it('refuses to reuse 2026 minimum wages for 2027 (not yet published)', () => {
    expect(() => mxParam('mx.salario-minimo.general', '2027-01-01')).toThrow(ParamNotAvailableError);
    expect(() => mxParam('mx.uma', '2027-02-01')).toThrow(ParamNotAvailableError);
  });

  it('refuses dates before the first version', () => {
    expect(() => versionOn(MX_PARAM_FILES['mx.uma'], '2020-01-01')).toThrow(/before-first-version/);
  });

  it('reports coverage windows', () => {
    expect(coverage(MX_PARAM_FILES['mx.salario-minimo.general'])).toEqual({ from: '2025-01-01', to: '2026-12-31' });
    expect(coverage(MX_PARAM_FILES['mx.isr.tarifa-mensual']).to).toBeNull();
  });

  it('keeps UMA monthly and annual consistent with the legal formula (× 30.4, × 12)', () => {
    for (const v of MX_PARAM_FILES['mx.uma'].versions) {
      expect(Math.round(v.value.daily * 30.4 * 100) / 100).toBe(v.value.monthly);
      expect(Math.round(v.value.monthly * 12 * 100) / 100).toBe(v.value.annual);
    }
  });

  it('keeps ISR brackets contiguous (upper + 0.01 = next lower)', () => {
    for (const v of MX_PARAM_FILES['mx.isr.tarifa-mensual'].versions) {
      v.value.forEach((row, i) => {
        const next = v.value[i + 1];
        if (next) expect(Math.round(((row.upper ?? 0) + 0.01) * 100) / 100).toBe(next.lower);
        else expect(row.upper).toBeNull();
      });
    }
  });

  it('2026 tariff lower limits equal the 2023 limits × 1.1321 (art. 152 LISR update)', () => {
    const [old, current] = MX_PARAM_FILES['mx.isr.tarifa-mensual'].versions;
    old?.value.forEach((row, i) => {
      const expected = Math.round(row.lower * 1.1321 * 100) / 100;
      expect(Math.abs((current?.value[i]?.lower ?? 0) - expected)).toBeLessThanOrEqual(0.01);
    });
  });
});
