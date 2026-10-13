import { useMemo } from 'preact/hooks';
import {
  calculatePrimaVacacional,
  calculateVacaciones,
  type PrimaVacacionalInput,
  type SalaryPeriod,
  type WithholdingMethod,
  type Zone,
} from '../../lib/engine/mx/lft';
import { formatDays, formatMoney, formatPct } from '../../lib/ui/format';
import { buildSearch, isoDate, nullableNum, num, oneOf, type Codec } from '../../lib/ui/url-state';
import { DateField, MoneyField, Segmented } from '../ui/fields';
import { Breakdown, ResultActions, type BreakdownLine } from '../ui/result';
import { METHOD_OPTIONS, PERIOD_OPTIONS, ZONE_OPTIONS, periodLabel } from './options';
import {
  CalculatorShell,
  Disclosure,
  Notice,
  SUPPORTED,
  WARNING_COPY,
  citationRows,
  downloadReport,
  errorMessage,
  makeReport,
  summaryText,
  useUrlState,
} from './shared';

type DaysMode = 'antiguedad' | 'manual';

interface State {
  salary: number | null;
  period: SalaryPeriod;
  daysMode: DaysMode;
  start: string;
  days: number;
  prima: number;
  pay: string;
  method: WithholdingMethod;
  zone: Zone;
}

const codec: Codec<State> = {
  salary: { key: 's', ...nullableNum(0, 1e8) },
  period: { key: 'p', ...oneOf<SalaryPeriod>(['diario', 'semanal', 'quincenal', 'mensual']) },
  daysMode: { key: 'dm', ...oneOf<DaysMode>(['antiguedad', 'manual']) },
  start: { key: 'i', ...isoDate },
  days: { key: 'dv', ...num(1, 366) },
  prima: { key: 'pv', ...num(0, 1000) },
  pay: { key: 'fp', ...isoDate },
  method: { key: 'm', ...oneOf<WithholdingMethod>(['art96', 'art174']) },
  zone: { key: 'z', ...oneOf<Zone>(['general', 'zlfn']) },
};

function makeDefaults(today: string): State {
  const pay = today > SUPPORTED.to ? SUPPORTED.to : today;
  return {
    salary: null,
    period: 'mensual',
    daysMode: 'antiguedad',
    start: `${Number(pay.slice(0, 4)) - 2}${pay.slice(4)}`,
    days: 12,
    prima: 25,
    pay,
    method: 'art96',
    zone: 'general',
  };
}

/** Query string that opens the calculator with an engine input (used by worked examples). */
export function primaSearch(input: PrimaVacacionalInput, today: string): string {
  const defaults = makeDefaults(today);
  const state: State = {
    ...defaults,
    salary: input.salary.amount,
    period: input.salary.period,
    daysMode: 'manual',
    days: input.vacationDays,
    prima: input.primaPct,
    pay: input.paymentDate,
    method: input.withholding,
    zone: input.zone ?? 'general',
  };
  return buildSearch(codec, state, { ...defaults, pay: '' });
}

export default function PrimaVacacionalCalculator({ buildDay }: { buildDay: string }) {
  const [st, set] = useUrlState(codec, makeDefaults, buildDay);

  // Days from seniority use the same engine as the vacation calculator.
  const seniority = useMemo(
    () =>
      st.daysMode === 'antiguedad'
        ? calculateVacaciones({
            salary: { amount: st.salary ?? 1, period: st.period },
            startDate: st.start,
            referenceDate: st.pay,
            primaPct: 25,
          })
        : null,
    [st.daysMode, st.salary, st.period, st.start, st.pay],
  );
  const autoDays = seniority?.ok ? seniority.value.daysEarned || seniority.value.daysNextYear : null;
  const days = st.daysMode === 'antiguedad' ? (autoDays ?? 0) : st.days;

  const outcome = useMemo(
    () =>
      calculatePrimaVacacional({
        salary: { amount: st.salary ?? 0, period: st.period },
        vacationDays: days,
        primaPct: st.prima,
        paymentDate: st.pay,
        withholding: st.method,
        zone: st.zone,
      }),
    [st, days],
  );

  const r = outcome.ok ? outcome.value : null;
  const err = outcome.ok ? null : outcome.error;
  const errFor = (...codes: string[]) => (err && codes.includes(err.code) ? errorMessage(err) : undefined);
  const firstYear = seniority?.ok && seniority.value.daysEarned === 0;

  const lines: BreakdownLine[] = r
    ? [
        {
          key: 'base',
          label: 'Salario de tus vacaciones',
          detail: `${formatDays(days)} días × ${formatMoney(r.dailySalary)}`,
          refs: ['LFT art. 76'],
          amount: r.vacationPay,
          tone: 'subtotal',
        },
        {
          key: 'gross',
          label: 'Prima vacacional',
          detail: `${formatPct(st.prima)} del salario de vacaciones`,
          refs: ['LFT art. 80'],
          amount: r.gross,
        },
        {
          key: 'exempt',
          label: 'Parte exenta',
          detail: `Hasta 15 UMA: 15 × ${formatMoney(r.umaDaily)} = ${formatMoney(r.exemptCap)}`,
          refs: ['LISR art. 93 fr. XIV'],
          amount: r.exempt,
          tone: 'exempt',
        },
        {
          key: 'isr',
          label: 'ISR estimado',
          detail: r.method === 'art174' ? 'Procedimiento opcional del art. 174 RLISR' : 'Se suma a tu sueldo del mes',
          refs: [r.method === 'art174' ? 'RLISR art. 174' : 'LISR art. 96'],
          amount: r.isr,
          tone: 'deduction',
        },
        { key: 'net', label: 'Prima vacacional neta', amount: r.net, tone: 'total' },
      ]
    : [];

  const reportRows = () =>
    r
      ? [
          { label: 'Salario', value: `${formatMoney(st.salary ?? 0)} ${periodLabel(st.period)}` },
          { label: 'Días de vacaciones', value: formatDays(days) },
          { label: 'Prima', value: formatPct(st.prima) },
          ...lines.map((l) => ({ label: l.label, value: `${l.tone === 'deduction' ? '−' : ''}${formatMoney(l.amount)}` })),
        ]
      : [];

  const form = (
    <>
      <MoneyField
        name="salario"
        label="Tu salario"
        value={st.salary}
        onChange={(salary) => set({ salary })}
        hint="El salario base, sin bonos."
        placeholder="0.00"
      />
      <Segmented
        legend="Periodo del salario"
        name="periodo"
        value={st.period}
        options={PERIOD_OPTIONS}
        onChange={(period) => set({ period })}
      />
      <Segmented
        legend="Días de vacaciones"
        name="modo-dias"
        value={st.daysMode}
        options={[
          { value: 'antiguedad', label: 'Según mi antigüedad' },
          { value: 'manual', label: 'Escribir los días' },
        ]}
        onChange={(daysMode) => set({ daysMode })}
      />
      {st.daysMode === 'antiguedad' ? (
        <DateField
          name="ingreso"
          label="Fecha de ingreso"
          value={st.start}
          onChange={(start) => set({ start })}
          max={st.pay}
          hint={autoDays !== null ? `Te tocan ${autoDays} días${firstYear ? ' al cumplir tu primer año' : ''} (art. 76 LFT).` : undefined}
          error={seniority && !seniority.ok ? errorMessage(seniority.error) : undefined}
        />
      ) : (
        <MoneyField
          name="dias"
          label="Días de vacaciones"
          value={st.days}
          onChange={(d) => set({ days: d ?? 0 })}
          prefix=""
          suffix="días"
          decimals={0}
          error={errFor('vacation-days-invalid')}
        />
      )}
      <MoneyField
        name="prima"
        label="Porcentaje de prima vacacional"
        value={st.prima}
        onChange={(prima) => set({ prima: prima ?? 0 })}
        prefix=""
        suffix="%"
        decimals={0}
        hint="La ley da mínimo 25 %. Revisa tu contrato."
        error={errFor('prima-below-minimum')}
      />
      <Disclosure summary="Más opciones">
        <DateField
          name="pago"
          label="Fecha de pago"
          value={st.pay}
          onChange={(pay) => set({ pay })}
          min={SUPPORTED.from}
          max={SUPPORTED.to}
          hint="Define qué UMA y qué tarifa de ISR se usan."
          error={errFor('params-unavailable')}
        />
        <Segmented legend="Zona del salario mínimo" name="zona" value={st.zone} options={ZONE_OPTIONS} onChange={(zone) => set({ zone })} />
        <Segmented
          legend="Cómo calcular la retención de ISR"
          name="metodo"
          value={st.method}
          options={METHOD_OPTIONS}
          onChange={(method) => set({ method })}
        />
      </Disclosure>
    </>
  );

  const result = r ? (
    <>
      {r.warnings.map((w) => (
        <Notice tone="warning" key={w}>
          {WARNING_COPY[w]}
        </Notice>
      ))}
      {firstYear ? (
        <Notice>Aún no cumples tu primer año: la prima se paga cuando tomas tus vacaciones o, si te vas antes, en tu finiquito.</Notice>
      ) : null}
      <Breakdown id="prima-vacacional-desglose" caption="Desglose de tu prima vacacional" lines={lines} />
      <ResultActions
        shareTitle="Mi cálculo de prima vacacional"
        summary={() => summaryText('Prima vacacional', reportRows(), window.location.href)}
        onPdf={() =>
          downloadReport(
            makeReport({
              title: 'Cálculo de prima vacacional',
              subtitle: 'Artículos 76 y 80 de la Ley Federal del Trabajo; exención del art. 93 fr. XIV LISR.',
              headline: { label: 'Prima vacacional neta estimada', value: r.net },
              sections: [
                { title: 'Datos', rows: reportRows().slice(0, 3) },
                {
                  title: 'Desglose',
                  rows: lines.map((l) => ({
                    label: l.label,
                    detail: [l.detail, l.refs?.join(', ')].filter(Boolean).join(' — '),
                    value: `${l.tone === 'deduction' ? '−' : ''}${formatMoney(l.amount)}`,
                    tone: l.tone === 'deduction' ? 'negative' : l.tone === 'total' ? 'total' : 'normal',
                  })),
                },
                { title: 'Valores oficiales usados', rows: citationRows(r.citations) },
              ],
            }),
            `prima-vacacional-${st.pay}.pdf`,
          )
        }
      />
    </>
  ) : null;

  return (
    <CalculatorShell
      tool="prima-vacacional"
      resultLabel="Tu prima vacacional neta"
      headline={r ? r.net : null}
      headlineNote={r ? `Bruta ${formatMoney(r.gross)} · ISR −${formatMoney(r.isr)}` : undefined}
      empty={err?.code === 'salary-required' ? 'Escribe tu salario para ver tu prima vacacional.' : err ? errorMessage(err) : null}
      form={form}
      result={result}
    />
  );
}
