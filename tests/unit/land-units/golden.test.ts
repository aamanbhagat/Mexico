/**
 * Golden tests for every Brazilian land-unit variant. Each assertion reproduces a figure
 * published by the source cited next to it, or an independent Python Fraction derivation
 * (tests/golden/land_units.py) for the worked examples shown on the pages.
 */
import { describe, expect, it } from 'vitest';
import { BR_LAND, BR_PARAM_FILES } from '../../../src/lib/params/br';
import { validateParamFile } from '../../../src/lib/params/loader';
import {
  catalogProblems,
  convertArea,
  convertPrice,
  dimsInMeters,
  parseRational,
  ratio,
  regionDiverges,
  regionUnits,
  toCanonical,
  toDecimal,
  type CompiledUnit,
} from '../../../src/lib/land-units';
import { EXAMPLES } from '../../../src/content/pt-br/examples';

const u = (id: string): CompiledUnit => {
  const unit = BR_LAND.byId.get(id);
  if (!unit) throw new Error(`unknown unit ${id}`);
  return unit;
};
const inHa = (id: string, places: number) => toDecimal(convertArea(parseRational('1')!, u(id), u('ha')), places);
const meters = (id: string) => dimsInMeters(BR_LAND, u(id))?.map((m) => toCanonical(m));

describe('catalog contract', () => {
  it('passes the parameter-registry contract and its own consistency checks', () => {
    expect(() => validateParamFile(BR_PARAM_FILES['br.land-units'], 'br/land-units.json')).not.toThrow();
    expect(catalogProblems(BR_LAND.raw)).toEqual([]);
  });

  it('has a source, date and verification flag on every variant', () => {
    for (const unit of BR_LAND.units) {
      expect(unit.source_url, unit.id).toMatch(/^https:\/\//);
      expect(unit.retrieved_on, unit.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof unit.verified, unit.id).toBe('boolean');
    }
  });

  it('covers every requested family and all 27 federative units', () => {
    const families = new Set(BR_LAND.units.map((x) => x.family));
    for (const f of ['base', 'alqueire', 'tarefa', 'litro', 'quadra', 'braca']) expect(families.has(f), f).toBe(true);
    expect(Object.keys(BR_LAND.raw.states)).toHaveLength(27);
  });

  it('never marks a value verified while its primary document was not opened', () => {
    // AGENTS.md §1: verified=true only after a person checks the primary source.
    for (const unit of BR_LAND.units) {
      const primary = BR_LAND.raw.sources[unit.sources[0]!]!;
      if (!primary.opened) expect(unit.verified, unit.id).toBe(false);
    }
  });
});

describe('alqueires (tabela de medidas agrárias não decimais, Ministério da Agricultura 1946 / INDA 1966)', () => {
  // 1 braça = 2,20 m (same table; Bolema/SciELO records the same braça in Arraias-TO).
  it('alqueire paulista: 50 × 100 braças = 110 × 220 m = 2,42 ha (IEA-SP; IBGE RBG 1950; INDA linha 11)', () => {
    expect(meters('alqueire-paulista')).toEqual(['110', '220']);
    expect(u('alqueire-paulista').m2).toBe('24200');
    expect(inHa('alqueire-paulista', 2)).toBe('2.42');
  });

  it('alqueire paulista = 5,98 acres (IBGE, Revista Brasileira de Geografia, 1950)', () => {
    expect(toDecimal(convertArea(parseRational('1')!, u('alqueire-paulista'), u('acre')), 2)).toBe('5.98');
  });

  it('alqueire mineiro/goiano: 100 × 100 braças = 220 × 220 m = 4,84 ha (INDA linha 12)', () => {
    expect(meters('alqueire-mineiro')).toEqual(['220', '220']);
    expect(inHa('alqueire-mineiro', 2)).toBe('4.84');
  });

  it('alqueire baiano: 100 × 200 braças = 220 × 440 m = 9,68 ha (INDA)', () => {
    expect(meters('alqueire-baiano')).toEqual(['220', '440']);
    expect(inHa('alqueire-baiano', 2)).toBe('9.68');
  });

  it('alqueire do Norte: 75 × 75 braças = 165 × 165 m = 27.225 m² ≈ 2,72 ha (INDA, "todos")', () => {
    expect(meters('alqueire-norte')).toEqual(['165', '165']);
    expect(u('alqueire-norte').m2).toBe('27225');
    expect(inHa('alqueire-norte', 2)).toBe('2.72');
    // 27.200 m² is only the rounded 2,72 ha some sites print.
    expect(u('alqueire-norte').also_reported.map((a) => a.m2)).toContain('27200');
  });

  it('alqueirão: 440 × 440 m = 19,36 ha (INDA; MG, BA, GO), four alqueires mineiros', () => {
    expect(meters('alqueirao')).toEqual(['440', '440']);
    expect(inHa('alqueirao', 2)).toBe('19.36');
    expect(toCanonical(ratio(u('alqueirao'), u('alqueire-mineiro')))).toBe('4');
  });

  it('alqueires of 50 × 75 (1,82 ha) and 50 × 50 braças (1,21 ha) (INDA)', () => {
    expect(meters('alqueire-50x75')).toEqual(['110', '165']);
    expect(inHa('alqueire-50x75', 2)).toBe('1.82');
    expect(meters('alqueire-50x50')).toEqual(['110', '110']);
    expect(inHa('alqueire-50x50', 2)).toBe('1.21');
  });
});

describe('tarefas', () => {
  it('tarefa baiana: 4 quadras de 15 braças = 4.356 m² (Bolema/SciELO, Arraias-TO) = 30 × 30 braças', () => {
    expect(meters('quadra-15')).toEqual(['33', '33']);
    expect(toCanonical(ratio(u('tarefa-baiana'), u('quadra-15')))).toBe('4');
    expect(meters('tarefa-baiana')).toEqual(['66', '66']);
    expect(inHa('tarefa-baiana', 2)).toBe('0.44');
  });

  it('tarefa cearense: 3.630 m², 0,36 ha (INDA linha 67)', () => {
    expect(inHa('tarefa-cearense', 2)).toBe('0.36');
  });

  it('tarefa AL/SE: 3.053 m² (INDA linha 66) is 0,31 ha — the table’s "0,03" is a misprint', () => {
    expect(inHa('tarefa-al-se', 2)).toBe('0.31');
    expect(u('tarefa-al-se').also_reported.map((a) => a.m2)).toEqual(['3052', '3025']);
  });

  it('tarefa de 25 × 25 braças de 2,20 m = 3.025 m² (UFAL, zona canavieira de Alagoas)', () => {
    expect(meters('tarefa-25x25')).toEqual(['55', '55']);
    expect(u('tarefa-25x25').m2).toBe('3025');
  });
});

describe('litro, quadras and braça', () => {
  it('litro de terra = 605 m²; 80 litros = alqueire mineiro, 40 = paulista (Canal Rural)', () => {
    expect(u('litro').m2).toBe('605');
    expect(toCanonical(ratio(u('alqueire-mineiro'), u('litro')))).toBe('80');
    expect(toCanonical(ratio(u('alqueire-paulista'), u('litro')))).toBe('40');
  });

  it('quadra gaúcha: 132 × 132 m = 17.424 m² ≈ 1,74 ha (INDA, RS)', () => {
    expect(meters('quadra-gaucha')).toEqual(['132', '132']);
    expect(inHa('quadra-gaucha', 2)).toBe('1.74');
  });

  it('quadra de sesmaria: 132 m × 6.600 m = 87,12 ha (RS)', () => {
    expect(meters('quadra-sesmaria')).toEqual(['132', '6600']);
    expect(inHa('quadra-sesmaria', 2)).toBe('87.12');
  });

  it('braça quadrada = 2,2 m × 2,2 m = 4,84 m²; an alqueire mineiro is 10.000 braças²', () => {
    expect(toCanonical(u('braca2').area)).toBe('4.84');
    expect(toCanonical(ratio(u('alqueire-mineiro'), u('braca2')))).toBe('10000');
  });

  it('acre internacional = 43.560 × 0,3048² m² exactly (NIST SP 811)', () => {
    expect(toCanonical(u('acre').area)).toBe('4046.8564224');
  });
});

describe('regions: the converter must not pick silently where sources disagree', () => {
  it('flags divergence in BA, MT, MA and PI and none in SP, MG or GO', () => {
    for (const uf of ['BA', 'MT', 'MA', 'PI']) expect(regionDiverges(BR_LAND, uf, 'alqueire'), uf).toBe(true);
    for (const uf of ['SP', 'MG', 'GO', 'PR', 'MS']) expect(regionDiverges(BR_LAND, uf, 'alqueire'), uf).toBe(false);
    // MG also records the alqueirão (its own name) and three historical alqueires of the INDA table.
    expect(regionUnits(BR_LAND, 'MG', 'alqueire').map((x) => x.id)).toEqual([
      'alqueire-mineiro',
      'alqueirao',
      'alqueire-baiano',
      'alqueire-50x75',
      'alqueire-50x50',
    ]);
    expect(regionUnits(BR_LAND, 'MG', 'alqueire', ['usual']).map((x) => x.id)).toEqual(['alqueire-mineiro']);
  });

  it('has no default alqueire where the most-cited value is a tie', () => {
    for (const uf of ['MT', 'MA', 'PI']) expect(BR_LAND.raw.states[uf]?.defaults['alqueire'], uf).toBeUndefined();
    expect(BR_LAND.raw.states['BA']?.defaults['alqueire']).toBe('alqueire-baiano');
  });

  it('lists the two tarefas recorded in Alagoas and Sergipe', () => {
    for (const uf of ['AL', 'SE']) {
      expect(regionUnits(BR_LAND, uf, 'tarefa').map((x) => x.id)).toEqual(['tarefa-al-se', 'tarefa-25x25']);
      expect(regionDiverges(BR_LAND, uf, 'tarefa')).toBe(true);
    }
  });
});

describe('worked examples shown on the pages (independent Fraction derivation)', () => {
  for (const ex of Object.values(EXAMPLES)) {
    it(`${ex.id}: ${ex.title}`, () => {
      if (ex.kind === 'area') {
        const r = convertArea(parseRational(ex.amount)!, u(ex.from), u(ex.to));
        expect(toDecimal(r, 4)).toBe(ex.rounded4);
        if (ex.exact !== null) expect(toCanonical(r)).toBe(ex.exact);
      } else {
        const r = convertPrice(parseRational(ex.price)!, u(ex.per), u(ex.to));
        expect(toDecimal(r, 2)).toBe(ex.rounded2);
        if (ex.exact !== null) expect(toCanonical(r)).toBe(ex.exact);
      }
    });
  }
});
