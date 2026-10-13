import { versionOn } from './loader';
import type { ParamFile, ParamVersion } from './types';

import uma from '../../data/parameters/mx/uma.json';
import smGeneral from '../../data/parameters/mx/salario-minimo-general.json';
import smZlfn from '../../data/parameters/mx/salario-minimo-zlfn.json';
import isrMensual from '../../data/parameters/mx/isr-tarifa-mensual.json';
import subsidio from '../../data/parameters/mx/subsidio-empleo.json';
import aguinaldo from '../../data/parameters/mx/lft-aguinaldo.json';
import vacaciones from '../../data/parameters/mx/lft-vacaciones.json';
import primaVacacional from '../../data/parameters/mx/lft-prima-vacacional.json';
import separacion from '../../data/parameters/mx/lft-separacion.json';
import topeBase from '../../data/parameters/mx/prima-antiguedad-tope.json';
import exenciones from '../../data/parameters/mx/lisr-exenciones.json';
import art174 from '../../data/parameters/mx/rlisr-art174.json';

export interface UmaValue {
  daily: number;
  monthly: number;
  annual: number;
}

export interface IsrBracket {
  lower: number;
  /** null = "en adelante". */
  upper: number | null;
  fixed: number;
  rate_pct: number;
}

export interface VacationRule {
  first_year: number;
  step: number;
  ramp_years: number;
  band_years: number;
  band_step: number;
}

export interface SeparationConstants {
  constitutional_days: number;
  days_per_year_art50: number;
  seniority_days_per_year: number;
  seniority_min_years_voluntary: number;
  seniority_cap_multiple: number;
  daily_divisor_monthly: number;
  daily_divisor_biweekly: number;
  daily_divisor_weekly: number;
}

export interface ExemptionConstants {
  aguinaldo_uma: number;
  prima_vacacional_uma: number;
  ptu_uma: number;
  separation_uma_per_year: number;
  separation_round_up_after_months: number;
}

export interface MxParams {
  'mx.uma': UmaValue;
  'mx.salario-minimo.general': number;
  'mx.salario-minimo.zlfn': number;
  'mx.isr.tarifa-mensual': IsrBracket[];
  'mx.subsidio-empleo': {
    uma_monthly_pct: number;
    uma_reference: string;
    monthly_amount: number;
    income_limit_monthly: number;
  };
  'mx.lft.aguinaldo': { min_days: number; deadline_month: number; deadline_day: number; days_in_year: number };
  'mx.lft.vacaciones': VacationRule;
  'mx.lft.prima-vacacional': { min_pct: number };
  'mx.lft.separacion': SeparationConstants;
  'mx.lft.prima-antiguedad-tope-base': 'salario_minimo' | 'uma';
  'mx.lisr.exenciones': ExemptionConstants;
  'mx.rlisr.art174': { days_in_year: number; days_in_month: number };
}

export type MxParamId = keyof MxParams;

/** All Mexico parameter files, keyed by id. JSON is typed through MxParams. */
export const MX_PARAM_FILES = {
  'mx.uma': uma,
  'mx.salario-minimo.general': smGeneral,
  'mx.salario-minimo.zlfn': smZlfn,
  'mx.isr.tarifa-mensual': isrMensual,
  'mx.subsidio-empleo': subsidio,
  'mx.lft.aguinaldo': aguinaldo,
  'mx.lft.vacaciones': vacaciones,
  'mx.lft.prima-vacacional': primaVacacional,
  'mx.lft.separacion': separacion,
  'mx.lft.prima-antiguedad-tope-base': topeBase,
  'mx.lisr.exenciones': exenciones,
  'mx.rlisr.art174': art174,
} as unknown as { [K in MxParamId]: ParamFile<MxParams[K]> };

/** Typed lookup: the version of `id` in force on `date` (YYYY-MM-DD). */
export function mxParam<K extends MxParamId>(id: K, date: string): ParamVersion<MxParams[K]> {
  return versionOn(MX_PARAM_FILES[id], date);
}

export function mxValue<K extends MxParamId>(id: K, date: string): MxParams[K] {
  return mxParam(id, date).value;
}
