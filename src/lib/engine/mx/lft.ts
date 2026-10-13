/**
 * Mexico payroll-payout engine: aguinaldo, vacaciones, prima vacacional, finiquito y
 * liquidación under the Ley Federal del Trabajo (LFT) and the ISR rules of the LISR.
 *
 * Pure functions. Every legal value comes from the parameter registry for the date
 * that applies (payment or separation date). Amounts are rounded to cents per concept,
 * and totals are sums of rounded concepts so the breakdown always adds up.
 */
import { MX_PARAM_FILES, mxParam, type IsrBracket, type MxParamId, type MxParams, type VacationRule } from '../../params/mx';
import { ParamNotAvailableError, type ParamVersion } from '../../params/types';
import { addDays, addMonths, inclusiveDays, isIsoDate, maxDate, minDate, seniority, type Seniority } from '../dates';
import { clamp, round2, sum } from '../money';
import { isrArt174, isrMarginal, isrMonthly, isrSeparation } from './isr';

/* ------------------------------------------------------------------------------------------------
 * Shared types
 * ---------------------------------------------------------------------------------------------- */

export type SalaryPeriod = 'diario' | 'semanal' | 'quincenal' | 'mensual';
export interface SalaryInput {
  amount: number;
  period: SalaryPeriod;
}
export type Zone = 'general' | 'zlfn';
export type WithholdingMethod = 'art96' | 'art174';
export type SeparationCause = 'renuncia' | 'mutuo_acuerdo' | 'despido_injustificado' | 'despido_justificado' | 'rescision_trabajador';

export type EngineErrorCode =
  | 'salary-required'
  | 'invalid-date'
  | 'end-before-start'
  | 'no-days-in-year'
  | 'aguinaldo-days-below-minimum'
  | 'prima-below-minimum'
  | 'vacation-days-invalid'
  | 'params-unavailable';

export interface EngineError {
  code: EngineErrorCode;
  /** Present for params-unavailable. */
  paramId?: string;
  date?: string;
  /** Minimum allowed value, for *-below-minimum. */
  min?: number;
}

export type Outcome<T> = { ok: true; value: T } | { ok: false; error: EngineError };

export type WarningCode = 'below-minimum-wage' | 'aguinaldo-already-paid-excluded' | 'cap-applied' | 'floor-applied';

export interface Citation {
  id: string;
  name: string;
  value: unknown;
  effective_from: string;
  source_url: string;
  source_title: string;
  verified: boolean;
}

export type ConceptId =
  | 'salario_pendiente'
  | 'aguinaldo'
  | 'vacaciones'
  | 'prima_vacacional'
  | 'indemnizacion_constitucional'
  | 'indemnizacion_20_dias'
  | 'prima_antiguedad';

export interface Concept {
  id: ConceptId;
  /** Days of salary paid (may be fractional). */
  days: number;
  /** Daily salary the days are multiplied by. */
  dailyBase: number;
  gross: number;
  exempt: number;
  taxable: number;
  /** Legal references, e.g. "LFT art. 87". */
  articles: string[];
  /** ordinary = taxed like salary; separation = art. 96 penúltimo párrafo LISR. */
  bucket: 'ordinary' | 'separation';
}

/* ------------------------------------------------------------------------------------------------
 * Parameter access with citation tracking
 * ---------------------------------------------------------------------------------------------- */

class ParamScope {
  readonly used = new Map<string, Citation>();
  constructor(readonly date: string) {}

  get<K extends MxParamId>(id: K, date = this.date): MxParams[K] {
    const version: ParamVersion<MxParams[K]> = mxParam(id, date);
    const key = `${id}@${version.effective_from}`;
    if (!this.used.has(key)) {
      this.used.set(key, {
        id,
        name: MX_PARAM_FILES[id].name,
        value: version.value,
        effective_from: version.effective_from,
        source_url: version.source_url,
        source_title: version.source_title,
        verified: version.verified,
      });
    }
    return version.value;
  }

  citations(): Citation[] {
    return [...this.used.values()];
  }
}

function guard<T>(fn: () => Outcome<T>): Outcome<T> {
  try {
    return fn();
  } catch (err) {
    if (err instanceof ParamNotAvailableError) {
      return { ok: false, error: { code: 'params-unavailable', paramId: err.paramId, date: err.date } };
    }
    if (err instanceof RangeError) return { ok: false, error: { code: 'invalid-date' } };
    throw err;
  }
}

/* ------------------------------------------------------------------------------------------------
 * Building blocks
 * ---------------------------------------------------------------------------------------------- */

/** Daily salary per art. 89 LFT: week ÷ 7, month ÷ 30 (fortnight ÷ 15). */
export function dailySalary(salary: SalaryInput, scope: ParamScope): number {
  const c = scope.get('mx.lft.separacion');
  switch (salary.period) {
    case 'diario':
      return salary.amount;
    case 'semanal':
      return salary.amount / c.daily_divisor_weekly;
    case 'quincenal':
      return salary.amount / c.daily_divisor_biweekly;
    case 'mensual':
      return salary.amount / c.daily_divisor_monthly;
  }
}

/** Ordinary monthly salary for ISR: as entered when monthly, two fortnights, otherwise daily × 30.4. */
export function monthlyOrdinarySalary(salary: SalaryInput, scope: ParamScope): number {
  if (salary.period === 'mensual') return salary.amount;
  if (salary.period === 'quincenal') return salary.amount * 2;
  return dailySalary(salary, scope) * scope.get('mx.rlisr.art174').days_in_month;
}

/** Vacation days for the n-th year of service (n ≥ 1) under an art. 76 rule. */
export function vacationDaysForYear(n: number, rule: VacationRule): number {
  if (n < 1) return 0;
  if (n <= rule.ramp_years) return rule.first_year + rule.step * (n - 1);
  const top = rule.first_year + rule.step * (rule.ramp_years - 1);
  return top + rule.band_step * Math.ceil((n - rule.ramp_years) / rule.band_years);
}

/** The art. 76 schedule in bands, for display ("6 a 10 años: 22 días"). */
export function vacationSchedule(rule: VacationRule, upToYear = 35): { from: number; to: number; days: number }[] {
  const out: { from: number; to: number; days: number }[] = [];
  for (let n = 1; n <= upToYear; n += 1) {
    const days = vacationDaysForYear(n, rule);
    const last = out[out.length - 1];
    if (last && last.days === days) last.to = n;
    else out.push({ from: n, to: n, days });
  }
  return out;
}

function minimumWage(zone: Zone, scope: ParamScope, date?: string): number {
  return zone === 'zlfn' ? scope.get('mx.salario-minimo.zlfn', date) : scope.get('mx.salario-minimo.general', date);
}

function validSalary(salary: SalaryInput): boolean {
  return Number.isFinite(salary.amount) && salary.amount > 0;
}

/* ------------------------------------------------------------------------------------------------
 * Aguinaldo (art. 87 LFT; exención art. 93 fr. XIV LISR)
 * ---------------------------------------------------------------------------------------------- */

export interface AguinaldoInput {
  salary: SalaryInput;
  /** Days of aguinaldo granted (law minimum 15). */
  aguinaldoDays: number;
  /** Calendar year the aguinaldo belongs to. */
  year: number;
  /** First day worked; omit or put a date before 1 Jan to mean the whole year. */
  startDate?: string | undefined;
  /** Last day counted; omit for 31 Dec (still employed). */
  endDate?: string | undefined;
  withholding: WithholdingMethod;
  zone?: Zone | undefined;
}

export interface AguinaldoResult {
  dailySalary: number;
  monthlyOrdinary: number;
  periodFrom: string;
  periodTo: string;
  paymentDate: string;
  daysWorked: number;
  daysInYear: number;
  proportionalDays: number;
  gross: number;
  exemptCap: number;
  exempt: number;
  taxable: number;
  isr: number;
  isrArt96: number;
  isrArt174: number;
  art174Rate: number;
  method: WithholdingMethod;
  net: number;
  umaDaily: number;
  citations: Citation[];
  warnings: WarningCode[];
}

export function calculateAguinaldo(input: AguinaldoInput): Outcome<AguinaldoResult> {
  return guard(() => {
    if (!validSalary(input.salary)) return { ok: false, error: { code: 'salary-required' } };
    const jan1 = `${input.year}-01-01`;
    const dec31 = `${input.year}-12-31`;
    for (const d of [input.startDate, input.endDate]) {
      if (d !== undefined && !isIsoDate(d)) return { ok: false, error: { code: 'invalid-date' } };
    }
    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      return { ok: false, error: { code: 'end-before-start' } };
    }
    const periodFrom = maxDate(input.startDate ?? jan1, jan1);
    const periodTo = minDate(input.endDate ?? dec31, dec31);
    if (periodTo < periodFrom) return { ok: false, error: { code: 'no-days-in-year' } };

    const deadline = `${input.year}-12-20`;
    const paymentDate = input.endDate && input.endDate < deadline ? input.endDate : deadline;
    const scope = new ParamScope(paymentDate);
    const lawAguinaldo = scope.get('mx.lft.aguinaldo');
    if (!(input.aguinaldoDays >= lawAguinaldo.min_days)) {
      return { ok: false, error: { code: 'aguinaldo-days-below-minimum', min: lawAguinaldo.min_days } };
    }

    const daily = dailySalary(input.salary, scope);
    const monthly = monthlyOrdinarySalary(input.salary, scope);
    const daysWorked = inclusiveDays(periodFrom, periodTo);
    const fraction = Math.min(daysWorked, lawAguinaldo.days_in_year) / lawAguinaldo.days_in_year;
    const proportionalDays = input.aguinaldoDays * fraction;
    const gross = round2(daily * proportionalDays);

    const uma = scope.get('mx.uma');
    const exemptions = scope.get('mx.lisr.exenciones');
    const exemptCap = round2(exemptions.aguinaldo_uma * uma.daily);
    const exempt = Math.min(gross, exemptCap);
    const taxable = round2(gross - exempt);

    const tariff = scope.get('mx.isr.tarifa-mensual');
    const art174Params = scope.get('mx.rlisr.art174');
    const isr96 = round2(isrMarginal(monthly, taxable, tariff));
    const art174 = isrArt174(monthly, taxable, tariff, art174Params.days_in_year, art174Params.days_in_month);
    const isr174 = round2(art174.withholding);
    const isr = input.withholding === 'art174' ? isr174 : isr96;

    const warnings: WarningCode[] = [];
    if (daily < minimumWage(input.zone ?? 'general', scope)) warnings.push('below-minimum-wage');

    return {
      ok: true,
      value: {
        dailySalary: daily,
        monthlyOrdinary: monthly,
        periodFrom,
        periodTo,
        paymentDate,
        daysWorked,
        daysInYear: lawAguinaldo.days_in_year,
        proportionalDays,
        gross,
        exemptCap,
        exempt,
        taxable,
        isr,
        isrArt96: isr96,
        isrArt174: isr174,
        art174Rate: art174.rate,
        method: input.withholding,
        net: round2(gross - isr),
        umaDaily: uma.daily,
        citations: scope.citations(),
        warnings,
      },
    };
  });
}

/* ------------------------------------------------------------------------------------------------
 * Prima vacacional (art. 80 LFT; exención art. 93 fr. XIV LISR)
 * ---------------------------------------------------------------------------------------------- */

export interface PrimaVacacionalInput {
  salary: SalaryInput;
  vacationDays: number;
  /** Percentage, e.g. 25 for 25 %. Law minimum 25. */
  primaPct: number;
  paymentDate: string;
  withholding: WithholdingMethod;
  zone?: Zone | undefined;
}

export interface PrimaVacacionalResult {
  dailySalary: number;
  monthlyOrdinary: number;
  vacationPay: number;
  gross: number;
  exemptCap: number;
  exempt: number;
  taxable: number;
  isr: number;
  isrArt96: number;
  isrArt174: number;
  method: WithholdingMethod;
  net: number;
  umaDaily: number;
  citations: Citation[];
  warnings: WarningCode[];
}

export function calculatePrimaVacacional(input: PrimaVacacionalInput): Outcome<PrimaVacacionalResult> {
  return guard(() => {
    if (!validSalary(input.salary)) return { ok: false, error: { code: 'salary-required' } };
    if (!isIsoDate(input.paymentDate)) return { ok: false, error: { code: 'invalid-date' } };
    if (!(input.vacationDays > 0) || input.vacationDays > 366) return { ok: false, error: { code: 'vacation-days-invalid' } };
    const scope = new ParamScope(input.paymentDate);
    const minPct = scope.get('mx.lft.prima-vacacional').min_pct;
    if (!(input.primaPct >= minPct)) return { ok: false, error: { code: 'prima-below-minimum', min: minPct } };

    const daily = dailySalary(input.salary, scope);
    const monthly = monthlyOrdinarySalary(input.salary, scope);
    const vacationPay = round2(daily * input.vacationDays);
    const gross = round2(daily * input.vacationDays * (input.primaPct / 100));

    const uma = scope.get('mx.uma');
    const exemptCap = round2(scope.get('mx.lisr.exenciones').prima_vacacional_uma * uma.daily);
    const exempt = Math.min(gross, exemptCap);
    const taxable = round2(gross - exempt);

    const tariff = scope.get('mx.isr.tarifa-mensual');
    const art174Params = scope.get('mx.rlisr.art174');
    const isr96 = round2(isrMarginal(monthly, taxable, tariff));
    const isr174 = round2(isrArt174(monthly, taxable, tariff, art174Params.days_in_year, art174Params.days_in_month).withholding);
    const isr = input.withholding === 'art174' ? isr174 : isr96;

    const warnings: WarningCode[] = [];
    if (daily < minimumWage(input.zone ?? 'general', scope)) warnings.push('below-minimum-wage');

    return {
      ok: true,
      value: {
        dailySalary: daily,
        monthlyOrdinary: monthly,
        vacationPay,
        gross,
        exemptCap,
        exempt,
        taxable,
        isr,
        isrArt96: isr96,
        isrArt174: isr174,
        method: input.withholding,
        net: round2(gross - isr),
        umaDaily: uma.daily,
        citations: scope.citations(),
        warnings,
      },
    };
  });
}

/* ------------------------------------------------------------------------------------------------
 * Vacaciones (arts. 76, 79 y 80 LFT)
 * ---------------------------------------------------------------------------------------------- */

export interface VacacionesInput {
  salary: SalaryInput;
  startDate: string;
  /** Date to evaluate (today, or the last day worked). */
  referenceDate: string;
  primaPct: number;
}

export interface VacacionesResult {
  seniority: Seniority;
  dailySalary: number;
  /** Days earned by the last completed year (0 before the first anniversary). */
  daysEarned: number;
  /** Days that the next anniversary will grant. */
  daysNextYear: number;
  /** Proportional days accrued in the current service year (what a finiquito would pay). */
  daysAccrued: number;
  vacationPay: number;
  primaVacacional: number;
  accruedPay: number;
  accruedPrima: number;
  schedule: { from: number; to: number; days: number }[];
  ruleEffectiveFrom: string;
  citations: Citation[];
}

export function calculateVacaciones(input: VacacionesInput): Outcome<VacacionesResult> {
  return guard(() => {
    if (!validSalary(input.salary)) return { ok: false, error: { code: 'salary-required' } };
    if (!isIsoDate(input.startDate) || !isIsoDate(input.referenceDate)) return { ok: false, error: { code: 'invalid-date' } };
    if (input.referenceDate < input.startDate) return { ok: false, error: { code: 'end-before-start' } };
    const scope = new ParamScope(input.referenceDate);
    const minPct = scope.get('mx.lft.prima-vacacional').min_pct;
    if (!(input.primaPct >= minPct)) return { ok: false, error: { code: 'prima-below-minimum', min: minPct } };

    const s = seniority(input.startDate, input.referenceDate);
    const ruleVersion = mxParam('mx.lft.vacaciones', input.referenceDate);
    const rule = scope.get('mx.lft.vacaciones');
    const daily = dailySalary(input.salary, scope);
    const daysEarned = vacationDaysForYear(s.completedYears, rule);
    const daysNextYear = vacationDaysForYear(s.completedYears + 1, rule);
    const daysAccrued = daysNextYear * (s.daysIntoYear / s.daysInServiceYear);
    const pct = input.primaPct / 100;
    const vacationPay = round2(daily * daysEarned);
    const accruedPay = round2(daily * daysAccrued);

    return {
      ok: true,
      value: {
        seniority: s,
        dailySalary: daily,
        daysEarned,
        daysNextYear,
        daysAccrued,
        vacationPay,
        primaVacacional: round2(daily * daysEarned * pct),
        accruedPay,
        accruedPrima: round2(daily * daysAccrued * pct),
        schedule: vacationSchedule(rule),
        ruleEffectiveFrom: ruleVersion.effective_from,
        citations: scope.citations(),
      },
    };
  });
}

/* ------------------------------------------------------------------------------------------------
 * Finiquito y liquidación (arts. 48, 50, 76, 79, 80, 84, 87, 89, 162, 485, 486 LFT;
 * arts. 93 fr. XIII–XIV y 96 LISR)
 * ---------------------------------------------------------------------------------------------- */

export interface SeparationInput {
  salary: SalaryInput;
  /** Salario diario integrado (art. 84). Omit to estimate it with the legal-minimum integration factor. */
  integratedDaily?: number | undefined;
  startDate: string;
  /** Last day worked (separation date). */
  endDate: string;
  cause: SeparationCause;
  /**
   * Art. 50 fr. II (20 días por año). Always paid for rescisión imputable al patrón (art. 52);
   * for despido injustificado only when the employer refuses reinstatement (art. 49).
   */
  include20DaysPerYear: boolean;
  aguinaldoDays: number;
  primaPct: number;
  /** Vacation days earned in previous years and not taken. */
  pendingVacationDays: number;
  /** Days worked and not yet paid. */
  unpaidDays: number;
  /** True when this year's aguinaldo was already paid (excludes it from the finiquito). */
  aguinaldoAlreadyPaid: boolean;
  zone: Zone;
  /** Override of the registry's cap base for the prima de antigüedad (comparison only). */
  seniorityCapBase?: 'salario_minimo' | 'uma' | undefined;
}

export interface SeparationResult {
  seniority: Seniority;
  dailySalary: number;
  integratedDaily: number;
  integratedDailyEstimated: boolean;
  integrationFactor: number;
  monthlyOrdinary: number;
  concepts: Concept[];
  /** Finiquito = ordinary concepts; liquidación adds separation concepts. */
  finiquitoGross: number;
  separationGross: number;
  gross: number;
  exempt: number;
  taxable: number;
  isrOrdinary: number;
  isrSeparation: number;
  isrSeparationMethod: 'effective-rate' | 'added-to-income';
  isr: number;
  net: number;
  seniorityBase: number;
  seniorityCap: number;
  seniorityCapBase: 'salario_minimo' | 'uma';
  separationExemptCap: number;
  yearsForExemption: number;
  umaDaily: number;
  minimumWage: number;
  citations: Citation[];
  warnings: WarningCode[];
}

/** Which separation concepts a cause triggers. */
export function separationRights(cause: SeparationCause, completedYears: number, include20: boolean, minYearsVoluntary: number) {
  const voluntary = cause === 'renuncia' || cause === 'mutuo_acuerdo';
  return {
    constitutional: cause === 'despido_injustificado' || cause === 'rescision_trabajador',
    twentyDays: cause === 'rescision_trabajador' || (cause === 'despido_injustificado' && include20),
    seniorityPremium: voluntary ? completedYears >= minYearsVoluntary : true,
  };
}

export function calculateSeparation(input: SeparationInput): Outcome<SeparationResult> {
  return guard(() => {
    if (!validSalary(input.salary)) return { ok: false, error: { code: 'salary-required' } };
    if (!isIsoDate(input.startDate) || !isIsoDate(input.endDate)) return { ok: false, error: { code: 'invalid-date' } };
    if (input.endDate < input.startDate) return { ok: false, error: { code: 'end-before-start' } };

    const end = input.endDate;
    const scope = new ParamScope(end);
    const minAguinaldo = scope.get('mx.lft.aguinaldo');
    if (!(input.aguinaldoDays >= minAguinaldo.min_days)) {
      return { ok: false, error: { code: 'aguinaldo-days-below-minimum', min: minAguinaldo.min_days } };
    }
    const minPct = scope.get('mx.lft.prima-vacacional').min_pct;
    if (!(input.primaPct >= minPct)) return { ok: false, error: { code: 'prima-below-minimum', min: minPct } };
    if (!(input.pendingVacationDays >= 0) || !(input.unpaidDays >= 0)) {
      return { ok: false, error: { code: 'vacation-days-invalid' } };
    }

    const s = seniority(input.startDate, end);
    const daily = dailySalary(input.salary, scope);
    const monthly = monthlyOrdinarySalary(input.salary, scope);
    const rule = scope.get('mx.lft.vacaciones');
    const c = scope.get('mx.lft.separacion');
    const pct = input.primaPct / 100;
    const warnings: WarningCode[] = [];

    // Salario diario integrado: cuota diaria + parte proporcional de aguinaldo y prima vacacional (art. 84).
    const currentYearVacation = vacationDaysForYear(s.completedYears + 1, rule);
    const integrationFactor = 1 + (input.aguinaldoDays + currentYearVacation * pct) / minAguinaldo.days_in_year;
    const integratedDailyEstimated = !(input.integratedDaily && input.integratedDaily > 0);
    const integratedDaily = integratedDailyEstimated ? round2(daily * integrationFactor) : (input.integratedDaily as number);

    const concepts: Concept[] = [];
    const uma = scope.get('mx.uma');
    const exemptions = scope.get('mx.lisr.exenciones');

    // 1. Salario devengado no pagado.
    if (input.unpaidDays > 0) {
      const gross = round2(daily * input.unpaidDays);
      concepts.push({
        id: 'salario_pendiente',
        days: input.unpaidDays,
        dailyBase: daily,
        gross,
        exempt: 0,
        taxable: gross,
        articles: ['LFT art. 82', 'LFT art. 88'],
        bucket: 'ordinary',
      });
    }

    // 2. Aguinaldo proporcional del año de la separación.
    if (input.aguinaldoAlreadyPaid) {
      warnings.push('aguinaldo-already-paid-excluded');
    } else {
      const jan1 = `${end.slice(0, 4)}-01-01`;
      const daysThisYear = inclusiveDays(maxDate(input.startDate, jan1), end);
      const days = input.aguinaldoDays * (Math.min(daysThisYear, minAguinaldo.days_in_year) / minAguinaldo.days_in_year);
      const gross = round2(daily * days);
      const exempt = Math.min(gross, round2(exemptions.aguinaldo_uma * uma.daily));
      concepts.push({
        id: 'aguinaldo',
        days,
        dailyBase: daily,
        gross,
        exempt,
        taxable: round2(gross - exempt),
        articles: ['LFT art. 87', 'LISR art. 93 fr. XIV'],
        bucket: 'ordinary',
      });
    }

    // 3. Vacaciones: proporcionales del año en curso (art. 79) + pendientes de años anteriores.
    const accrued = currentYearVacation * (s.daysIntoYear / s.daysInServiceYear);
    const vacationDays = accrued + input.pendingVacationDays;
    if (vacationDays > 0) {
      const gross = round2(daily * vacationDays);
      concepts.push({
        id: 'vacaciones',
        days: vacationDays,
        dailyBase: daily,
        gross,
        exempt: 0,
        taxable: gross,
        articles: ['LFT art. 76', 'LFT art. 79'],
        bucket: 'ordinary',
      });
      const pv = round2(daily * vacationDays * pct);
      const pvExempt = Math.min(pv, round2(exemptions.prima_vacacional_uma * uma.daily));
      concepts.push({
        id: 'prima_vacacional',
        days: vacationDays * pct,
        dailyBase: daily,
        gross: pv,
        exempt: pvExempt,
        taxable: round2(pv - pvExempt),
        articles: ['LFT art. 80', 'LISR art. 93 fr. XIV'],
        bucket: 'ordinary',
      });
    }

    // 4. Separation payments.
    const rights = separationRights(input.cause, s.completedYears, input.include20DaysPerYear, c.seniority_min_years_voluntary);
    const separation: Concept[] = [];
    if (rights.constitutional) {
      const gross = round2(integratedDaily * c.constitutional_days);
      separation.push({
        id: 'indemnizacion_constitucional',
        days: c.constitutional_days,
        dailyBase: integratedDaily,
        gross,
        exempt: 0,
        taxable: gross,
        articles: ['LFT art. 48', 'LFT art. 50 fr. III', 'LFT art. 89'],
        bucket: 'separation',
      });
    }
    if (rights.twentyDays) {
      const days = c.days_per_year_art50 * s.exactYears;
      const gross = round2(integratedDaily * days);
      separation.push({
        id: 'indemnizacion_20_dias',
        days,
        dailyBase: integratedDaily,
        gross,
        exempt: 0,
        taxable: gross,
        articles: ['LFT art. 50 fr. II', input.cause === 'rescision_trabajador' ? 'LFT art. 52' : 'LFT art. 49'],
        bucket: 'separation',
      });
    }

    const capBase = input.seniorityCapBase ?? scope.get('mx.lft.prima-antiguedad-tope-base');
    const mw = minimumWage(input.zone, scope);
    const capUnit = capBase === 'uma' ? uma.daily : mw;
    const seniorityCap = round2(capUnit * c.seniority_cap_multiple);
    const seniorityBase = round2(clamp(integratedDaily, mw, seniorityCap));
    if (rights.seniorityPremium) {
      if (integratedDaily > seniorityCap) warnings.push('cap-applied');
      if (integratedDaily < mw) warnings.push('floor-applied');
      const days = c.seniority_days_per_year * s.exactYears;
      const gross = round2(seniorityBase * days);
      separation.push({
        id: 'prima_antiguedad',
        days,
        dailyBase: seniorityBase,
        gross,
        exempt: 0,
        taxable: gross,
        articles: ['LFT art. 162', 'LFT art. 485', 'LFT art. 486'],
        bucket: 'separation',
      });
    }

    // Exención por separación: 90 UMA por año de servicio; fracción de más de seis meses = año completo.
    const roundUp = addMonths(s.lastAnniversary, exemptions.separation_round_up_after_months) < addDays(end, 1);
    const yearsForExemption = s.completedYears + (s.daysIntoYear > 0 && roundUp ? 1 : 0);
    const separationExemptCap = round2(exemptions.separation_uma_per_year * uma.daily * yearsForExemption);
    const separationGross = sum(separation.map((x) => x.gross));
    const separationExempt = Math.min(separationGross, separationExemptCap);
    // Allocate the shared exemption pro rata so each line shows its exempt part; last line absorbs rounding.
    let allocated = 0;
    separation.forEach((item, i) => {
      const share =
        i === separation.length - 1
          ? round2(separationExempt - allocated)
          : round2(separationGross > 0 ? (separationExempt * item.gross) / separationGross : 0);
      allocated = round2(allocated + share);
      item.exempt = share;
      item.taxable = round2(item.gross - share);
    });
    concepts.push(...separation);

    // ISR.
    const tariff: IsrBracket[] = scope.get('mx.isr.tarifa-mensual');
    const ordinary = concepts.filter((x) => x.bucket === 'ordinary');
    const pendingSalary = ordinary.find((x) => x.id === 'salario_pendiente');
    const extrasTaxable = sum(ordinary.filter((x) => x.id !== 'salario_pendiente').map((x) => x.taxable));
    const ordinaryRate = monthly > 0 ? isrMonthly(monthly, tariff) / monthly : 0;
    const isrPending = pendingSalary ? pendingSalary.taxable * ordinaryRate : 0;
    const isrOrdinary = round2(isrPending + isrMarginal(monthly, extrasTaxable, tariff));
    const separationTaxable = round2(separationGross - separationExempt);
    const sepIsr = isrSeparation(monthly, extrasTaxable, separationTaxable, tariff);
    const isrSep = round2(sepIsr.withholding);

    const finiquitoGross = sum(ordinary.map((x) => x.gross));
    const gross = sum(concepts.map((x) => x.gross));
    const exempt = sum(concepts.map((x) => x.exempt));
    const isr = round2(isrOrdinary + isrSep);

    if (daily < mw) warnings.push('below-minimum-wage');

    return {
      ok: true,
      value: {
        seniority: s,
        dailySalary: daily,
        integratedDaily,
        integratedDailyEstimated,
        integrationFactor,
        monthlyOrdinary: monthly,
        concepts,
        finiquitoGross,
        separationGross,
        gross,
        exempt,
        taxable: round2(gross - exempt),
        isrOrdinary,
        isrSeparation: isrSep,
        isrSeparationMethod: sepIsr.method,
        isr,
        net: round2(gross - isr),
        seniorityBase,
        seniorityCap,
        seniorityCapBase: capBase,
        separationExemptCap,
        yearsForExemption,
        umaDaily: uma.daily,
        minimumWage: mw,
        citations: scope.citations(),
        warnings,
      },
    };
  });
}
