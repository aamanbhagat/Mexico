/**
 * Every parameter file of every country, keyed by id. Used by shared components (the sources
 * list on each page) that cite parameters without knowing which country they belong to.
 */
import { MX_PARAM_FILES, type MxParamId } from './mx';
import { ID_PARAM_FILES, type IdParamId } from './id';
import { BR_PARAM_FILES, type BrParamId } from './br';
import type { ParamFile } from './types';

export type ParamId = MxParamId | IdParamId | BrParamId;

export const PARAM_FILES: Record<ParamId, ParamFile> = { ...MX_PARAM_FILES, ...ID_PARAM_FILES, ...BR_PARAM_FILES };
