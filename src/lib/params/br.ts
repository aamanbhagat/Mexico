import { versionOn } from './loader';
import type { ParamFile, ParamVersion } from './types';
import { compileCatalog, type CompiledCatalog, type LandUnitCatalog } from '../land-units/catalog';

import landUnits from '../../data/parameters/br/land-units.json';

export interface BrParams {
  'br.land-units': LandUnitCatalog;
}

export type BrParamId = keyof BrParams;

/** All Brazil parameter files, keyed by id. JSON is typed through BrParams. */
export const BR_PARAM_FILES = {
  'br.land-units': landUnits,
} as unknown as { [K in BrParamId]: ParamFile<BrParams[K]> };

/** Customary units have no legal validity window; any date from the 1946 survey on is accepted. */
export const LAND_UNITS_AS_OF = '2026-10-13';

export function brParam<K extends BrParamId>(id: K, date: string): ParamVersion<BrParams[K]> {
  return versionOn(BR_PARAM_FILES[id], date);
}

/** The Brazilian land-unit catalog, validated and compiled to exact rationals. */
export const BR_LAND: CompiledCatalog = compileCatalog(brParam('br.land-units', LAND_UNITS_AS_OF).value, typeof window === 'undefined');
