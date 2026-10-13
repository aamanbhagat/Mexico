/**
 * Land-unit catalogs: one JSON per country (src/data/parameters/<cc>/land-units.json) listing
 * every regional variant of the traditional area units with its exact size, where it is
 * recorded and the source. The engine is country-agnostic: Brazil's alqueires are defined in
 * braças (2.2 m), Japan's tsubo in ken (20/11 m), Spain's fanega in varas — same shape.
 */
import { cmp, div, equals, mul, parseRational, rat, type Rational } from './rational';

export type SourceKind = 'oficial' | 'oficial-historica' | 'academica' | 'imprensa' | 'comercial';

export interface CatalogSource {
  /** Few-word name for dense tables ("IEA-SP"). */
  short: string;
  title: string;
  url: string;
  kind: SourceKind;
  retrieved_on: string;
  /** Whether the document itself could be opened when the value was recorded. */
  opened: boolean;
  notes?: string;
}

export interface AlsoReported {
  /** Exact area in m² as a canonical number string. */
  m2: string;
  where: string;
  /** Source id, or "" when the claim only appears on unsourced pages. */
  source: string;
}

export interface LandUnit {
  id: string;
  /** "base" for SI/legal units (ha, m², acre); otherwise the traditional family ("alqueire"). */
  family: string;
  name: string;
  plural: string;
  symbol: string;
  /** Exact area in m²: "24200", "4046.8564224" or a fraction such as "400/121". */
  m2: string;
  /** Sides in the catalog's linear unit, when the variant is defined that way. */
  dims?: [number, number];
  /** Region codes (Brazilian UFs, Japanese prefectures…) where the variant is recorded. */
  regions: string[];
  region_label: string;
  source_url: string;
  source_title: string;
  retrieved_on: string;
  verified: boolean;
  /** Source ids that corroborate the value (first = primary). */
  sources: string[];
  also_reported: AlsoReported[];
  notes?: string;
}

/**
 * How a variant is used in a region:
 *  - usual: what people there mean by the family name ("o alqueire daqui"). Two different
 *    usual values in one region = the sources disagree, and the converter must say so;
 *  - named: a distinct variant with its own name (alqueirão, quadra de sesmaria), no confusion;
 *  - historical: only recorded in historical tables.
 */
export type RegionStatus = 'usual' | 'named' | 'historical';

export interface RegionUnit {
  id: string;
  status: RegionStatus;
  sources: string[];
}

export interface RegionEntry {
  name: string;
  units: RegionUnit[];
  /** Variant used for each family when this region is chosen. A missing family = sources disagree or nothing recorded. */
  defaults: Record<string, string>;
}

export interface LandUnitCatalog {
  linear: { id: string; name: string; plural: string; meters: string; source: string; notes?: string };
  rounding: { mode: 'half-even' | 'half-up'; standard: string; url: string; notes?: string };
  sources: Record<string, CatalogSource>;
  units: LandUnit[];
  states: Record<string, RegionEntry>;
}

export interface CompiledUnit extends LandUnit {
  area: Rational;
}

export interface CompiledCatalog {
  raw: LandUnitCatalog;
  linearMeters: Rational;
  byId: ReadonlyMap<string, CompiledUnit>;
  units: readonly CompiledUnit[];
}

/** Checks the catalog's internal consistency; returns human-readable problems (empty = valid). */
export function catalogProblems(c: LandUnitCatalog): string[] {
  const problems: string[] = [];
  const meters = parseRational(c.linear.meters);
  if (!meters || cmp(meters, rat(0n)) <= 0) problems.push(`linear.meters "${c.linear.meters}" is not a positive number`);
  if (!c.sources[c.linear.source]) problems.push(`linear.source "${c.linear.source}" is not a known source`);
  for (const [id, s] of Object.entries(c.sources)) {
    if (!/^https:\/\//.test(s.url)) problems.push(`source ${id}: url must be https`);
    if (!s.short) problems.push(`source ${id}: missing short name`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.retrieved_on)) problems.push(`source ${id}: retrieved_on must be an ISO date`);
  }
  const ids = new Set<string>();
  for (const u of c.units) {
    const at = `unit ${u.id}`;
    if (ids.has(u.id)) problems.push(`${at}: duplicate id`);
    ids.add(u.id);
    const area = parseRational(u.m2);
    if (!area || cmp(area, rat(0n)) <= 0) problems.push(`${at}: m2 "${u.m2}" is not a positive number`);
    if (u.dims && area && meters) {
      const fromDims = mul(mul(rat(BigInt(u.dims[0])), rat(BigInt(u.dims[1]))), mul(meters, meters));
      if (!equals(fromDims, area)) problems.push(`${at}: ${u.dims.join('×')} ${c.linear.plural} ≠ ${u.m2} m²`);
    }
    if (!/^https:\/\//.test(u.source_url)) problems.push(`${at}: source_url must be https`);
    if (u.source_title.length < 5) problems.push(`${at}: missing source_title`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(u.retrieved_on)) problems.push(`${at}: retrieved_on must be an ISO date`);
    if (typeof u.verified !== 'boolean') problems.push(`${at}: verified must be true/false`);
    if (u.sources.length === 0) problems.push(`${at}: needs at least one source id`);
    for (const s of u.sources) if (!c.sources[s]) problems.push(`${at}: unknown source "${s}"`);
    for (const a of u.also_reported) {
      if (!parseRational(a.m2)) problems.push(`${at}: also_reported m2 "${a.m2}" is not a number`);
      if (a.source && !c.sources[a.source]) problems.push(`${at}: also_reported source "${a.source}" unknown`);
    }
    for (const r of u.regions) {
      const entry = c.states[r];
      if (!entry) problems.push(`${at}: region "${r}" is not in states`);
      else if (!entry.units.some((x) => x.id === u.id)) problems.push(`${at}: lists ${r} but states.${r} does not list it`);
    }
  }
  for (const [code, entry] of Object.entries(c.states)) {
    for (const x of entry.units) {
      const unit = c.units.find((u) => u.id === x.id);
      if (!unit) problems.push(`states.${code}: unknown unit "${x.id}"`);
      else if (!unit.regions.includes(code)) problems.push(`states.${code}: lists ${x.id} but the unit's regions omit ${code}`);
      if (!['usual', 'named', 'historical'].includes(x.status)) problems.push(`states.${code}.${x.id}: bad status "${x.status}"`);
      if (x.sources.length === 0) problems.push(`states.${code}.${x.id}: needs a source`);
      for (const s of x.sources) if (!c.sources[s]) problems.push(`states.${code}.${x.id}: unknown source "${s}"`);
    }
    for (const [family, id] of Object.entries(entry.defaults)) {
      const unit = c.units.find((u) => u.id === id);
      if (!unit || unit.family !== family) problems.push(`states.${code}.defaults.${family}: "${id}" is not a ${family}`);
      const listed = entry.units.find((x) => x.id === id);
      if (!listed) problems.push(`states.${code}.defaults.${family}: "${id}" is not listed in the state`);
      else if (listed.status !== 'usual') problems.push(`states.${code}.defaults.${family}: "${id}" is not the usual variant`);
    }
  }
  return problems;
}

/**
 * Validates (unless told not to) and converts every area to an exact rational.
 * The browser skips validation: the build already ran it, and client bundles carry the catalog
 * without editorial fields (notes, retrieved_on).
 */
export function compileCatalog(c: LandUnitCatalog, validate = true): CompiledCatalog {
  const problems = validate ? catalogProblems(c) : [];
  if (problems.length) throw new Error(`Invalid land-unit catalog:\n - ${problems.join('\n - ')}`);
  const units = c.units.map((u) => ({ ...u, area: parseRational(u.m2) as Rational }));
  return {
    raw: c,
    linearMeters: parseRational(c.linear.meters) as Rational,
    byId: new Map(units.map((u) => [u.id, u])),
    units,
  };
}

export interface RegionVariant {
  unit: CompiledUnit;
  status: RegionStatus;
  sources: string[];
}

/** Variants recorded in a region, in the catalog's order (most cited first). */
export function regionVariants(c: CompiledCatalog, region: string, family?: string, statuses?: RegionStatus[]): RegionVariant[] {
  const entry = c.raw.states[region];
  if (!entry) return [];
  const out: RegionVariant[] = [];
  for (const x of entry.units) {
    const unit = c.byId.get(x.id);
    if (!unit || (family && unit.family !== family) || (statuses && !statuses.includes(x.status))) continue;
    out.push({ unit, status: x.status, sources: x.sources });
  }
  return out;
}

export function regionUnits(c: CompiledCatalog, region: string, family?: string, statuses?: RegionStatus[]): CompiledUnit[] {
  return regionVariants(c, region, family, statuses).map((v) => v.unit);
}

/** True when sources give a region two different usual values for a family: the converter must say so. */
export function regionDiverges(c: CompiledCatalog, region: string, family: string): boolean {
  const values = new Set(regionUnits(c, region, family, ['usual']).map((u) => `${u.area.n}/${u.area.d}`));
  return values.size > 1;
}

/** Area in m² of a unit's linear dimensions (e.g. 50 × 100 braças → 110 × 220 m). */
export function dimsInMeters(c: CompiledCatalog, unit: LandUnit): [Rational, Rational] | null {
  if (!unit.dims) return null;
  return [mul(rat(BigInt(unit.dims[0])), c.linearMeters), mul(rat(BigInt(unit.dims[1])), c.linearMeters)];
}

/** How many of `small` fit in `big` (e.g. litros per alqueire). */
export function ratio(big: CompiledUnit, small: CompiledUnit): Rational {
  return div(big.area, small.area);
}
