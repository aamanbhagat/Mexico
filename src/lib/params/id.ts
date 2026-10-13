/**
 * Indonesia parameter registry: weton methods (neptu tables, jodoh methods), Kemenag Hijri month
 * starts and national holidays. Same contract as the Mexico registry (src/lib/params/mx.ts).
 */
import { versionOn } from './loader';
import type { ParamFile, ParamVersion } from './types';
import { jdnFromIso, type HijriMonthStart, type NeptuTable } from '../calendar/javanese';

import wetonMethods from '../../data/parameters/id/weton-methods.json';
import hijriKemenag from '../../data/parameters/id/hijri-kemenag.json';
import hariLibur from '../../data/parameters/id/hari-libur.json';

export interface Reference {
  title: string;
  url: string;
}

export type JodohTone = 'baik' | 'sedang' | 'waspada';

export interface JodohResult {
  remainder: number;
  label: string;
  tone: JodohTone;
  summary: string;
}

export interface JodohMethod {
  id: string;
  name: string;
  short: string;
  divisor: number;
  default: boolean;
  why_default?: string;
  refs: string[];
  results: JodohResult[];
  zero_note: string;
  conflicts: string;
}

export interface NeptuTableDef extends NeptuTable {
  id: string;
  name: string;
  default: boolean;
  refs: string[];
  note: string;
}

export interface PangarasanLabel {
  label: string;
  refs: string[];
  meaning?: string;
}

export interface WetonMethods {
  neptu_tables: NeptuTableDef[];
  jodoh_methods: JodohMethod[];
  not_implemented: { id: string; name: string; reason: string; refs: string[] }[];
  keblat: {
    refs: string[];
    note: string;
    pasaran: Record<string, { arah: string; warna: string }>;
  };
  pangarasan: { note: string; entries: { neptu: number; labels: PangarasanLabel[]; note?: string }[] };
}

export type HijriBasisData = HijriMonthStart['basis'];

export interface HijriYearData {
  hijri_year: number;
  months: { month: number; start: string; basis: HijriBasisData; refs: string[] }[];
}

export interface Holiday {
  date: string;
  name: string;
  kind: 'libur' | 'cuti';
}

export interface IdParams {
  'id.weton-methods': WetonMethods;
  'id.hijri-kemenag': HijriYearData;
  'id.hari-libur': Holiday[];
}

export type IdParamId = keyof IdParams;

type WithReferences<T> = ParamFile<T> & { references: Record<string, Reference> };

export const ID_PARAM_FILES = {
  'id.weton-methods': wetonMethods,
  'id.hijri-kemenag': hijriKemenag,
  'id.hari-libur': hariLibur,
} as unknown as { [K in IdParamId]: WithReferences<IdParams[K]> };

export function idParam<K extends IdParamId>(id: K, date: string): ParamVersion<IdParams[K]> {
  return versionOn(ID_PARAM_FILES[id], date);
}

/** The current weton method catalogue (tradition data has a single open-ended version). */
export function wetonMethodsVersion(): ParamVersion<WetonMethods> {
  const versions = ID_PARAM_FILES['id.weton-methods'].versions;
  return versions[versions.length - 1] as ParamVersion<WetonMethods>;
}

export function wetonMethodsData(): WetonMethods {
  return wetonMethodsVersion().value;
}

/** Default neptu table (the one flagged `default`). */
export function defaultNeptuTable(): NeptuTableDef {
  const tables = wetonMethodsData().neptu_tables;
  return (tables.find((t) => t.default) ?? tables[0]) as NeptuTableDef;
}

export function jodohMethods(): JodohMethod[] {
  return wetonMethodsData().jodoh_methods;
}

export function defaultJodohMethod(): JodohMethod {
  const methods = jodohMethods();
  return (methods.find((m) => m.default) ?? methods[0]) as JodohMethod;
}

/** Resolves a reference key of a parameter file to its title and URL. */
export function idReference(file: IdParamId, key: string): Reference {
  const ref = ID_PARAM_FILES[file].references[key];
  if (!ref) throw new Error(`Unknown reference "${key}" in ${file}`);
  return ref;
}

/** Kemenag month starts flattened to the engine's table, sorted. */
export function kemenagHijriTable(): HijriMonthStart[] {
  return ID_PARAM_FILES['id.hijri-kemenag'].versions.flatMap((v) =>
    v.value.months.map((m) => ({ year: v.value.hijri_year, month: m.month, startJdn: jdnFromIso(m.start), basis: m.basis })),
  );
}

/** Holidays and cuti bersama of a Gregorian year, or [] when the SKB is not in the registry yet. */
export function holidaysOf(year: number): Holiday[] {
  const v = ID_PARAM_FILES['id.hari-libur'].versions.find((x) => x.effective_from.startsWith(String(year)));
  return v ? v.value : [];
}

export function holidayVersionOf(year: number): ParamVersion<Holiday[]> | undefined {
  return ID_PARAM_FILES['id.hari-libur'].versions.find((x) => x.effective_from.startsWith(String(year)));
}
