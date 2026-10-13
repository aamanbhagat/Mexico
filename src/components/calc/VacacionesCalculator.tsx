import { useMemo } from 'preact/hooks';
import { calculateVacaciones, type SalaryPeriod, type VacacionesInput } from '../../lib/engine/mx/lft';
import { formatDateLong, formatDays, formatMoney, formatPct } from '../../lib/ui/format';
import { buildSearch, isoDate, nullableNum, num, oneOf, type Codec } from '../../lib/ui/url-state';
import { DateField, MoneyField, Segmented } from '../ui/fields';
import { Breakdown, ResultActions, type BreakdownLine } from '../ui/result';
import { PERIOD_OPTIONS, periodLabel } from './options';
import {
  CalculatorShell,
  Disclosure,
  Notice,
  citationRows,
  downloadReport,
  errorMessage,
  makeReport,
  summaryText,
  useUrlState,
} from './shared';

interface State {
  salary: number | null;
  period: SalaryPeriod;
  start: string;
  ref: string;
  prima: number;
}

const codec: Codec<State> = {
  salary: { key: 's', ...nullableNum(0, 1e8) },
  period: { key: 'p', ...oneOf<SalaryPeriod>(['diario', 'semanal', 'quincenal', 'mensual']) },
  start: { key: 'i', ...isoDate },
  ref: { key: 'f', ...isoDate },
  prima: { key: 'pv', ...num(0, 1000) },
};

function makeDefaults(today: string): State {
  return { salary: null, period: 'mensual', start: `${Number(today.slice(0, 4)) - 3}${today.slice(4)}`, ref: today, prima: 25 };
}

/** Query string that opens the calculator with an engine input (used by worked examples). */
export function vacacionesSearch(input: VacacionesInput, today: string): string {
  const defaults = makeDefaults(today);
  const state: State = {
    salary: input.salary.amount,
    period: input.salary.period,
    start: input.startDate,
    ref: input.referenceDate,
    prima: input.primaPct,
  };
  return buildSearch(codec, state, { ...defaults, start: '', ref: '' });
}

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

export default function VacacionesCalculator({ buildDay }: { buildDay: string }) {
  const [st, set] = useUrlState(codec, makeDefaults, buildDay);

  // Days do not depend on the salary: show them even before a salary is typed.
  const outcome = useMemo(
    () =>
      calculateVacaciones({
        salary: { amount: st.salary ?? 1, period: st.period },
        startDate: st.start,
        referenceDate: st.ref,
        primaPct: st.prima,
      }),
    [st],
  );
  const r = outcome.ok ? outcome.value : null;
  const err = outcome.ok ? null : outcome.error;
  const hasSalary = st.salary !== null && st.salary > 0;
  const headlineDays = r ? r.daysEarned || r.daysNextYear : null;

  const lines: BreakdownLine[] =
    r && hasSalary
      ? [
          {
            key: 'days',
            label: r.daysEarned ? `Vacaciones de tu año ${r.seniority.completedYears + 1}` : 'Vacaciones al cumplir tu primer año',
            detail: `${formatDays(headlineDays ?? 0)} días × ${formatMoney(r.dailySalary)}`,
            refs: ['LFT art. 76'],
            amount: r.daysEarned ? r.vacationPay : r.upcomingPay,
          },
          {
            key: 'prima',
            label: 'Prima vacacional',
            detail: `${formatPct(st.prima)} del salario de vacaciones`,
            refs: ['LFT art. 80'],
            amount: r.daysEarned ? r.primaVacacional : r.upcomingPrima,
          },
          {
            key: 'total',
            label: 'Total bruto',
            amount: r.daysEarned
              ? Math.round((r.vacationPay + r.primaVacacional) * 100) / 100
              : Math.round((r.upcomingPay + r.upcomingPrima) * 100) / 100,
            tone: 'total',
          },
        ]
      : [];

  const reportRows = () =>
    r
      ? [
          { label: 'Fecha de ingreso', value: formatDateLong(st.start) },
          { label: 'Años cumplidos', value: String(r.seniority.completedYears) },
          { label: 'Días de vacaciones', value: formatDays(headlineDays ?? 0) },
          ...(hasSalary ? [{ label: 'Salario', value: `${formatMoney(st.salary ?? 0)} ${periodLabel(st.period)}` }] : []),
          ...lines.map((l) => ({ label: l.label, value: formatMoney(l.amount) })),
        ]
      : [];

  const form = (
    <>
      <DateField
        name="ingreso"
        label="Fecha de ingreso"
        value={st.start}
        onChange={(start) => set({ start })}
        max={st.ref}
        error={err?.code === 'end-before-start' ? errorMessage(err) : undefined}
      />
      <MoneyField
        name="salario"
        label="Tu salario (opcional)"
        value={st.salary}
        onChange={(salary) => set({ salary })}
        hint="Para calcular cuánto te pagan por tus vacaciones y la prima."
        placeholder="0.00"
      />
      <Segmented
        legend="Periodo del salario"
        name="periodo"
        value={st.period}
        options={PERIOD_OPTIONS}
        onChange={(period) => set({ period })}
      />
      <Disclosure summary="Más opciones">
        <DateField
          name="referencia"
          label="Calcular a la fecha"
          value={st.ref}
          onChange={(ref) => set({ ref })}
          min={st.start}
          hint="Hoy, o tu último día si dejaste el trabajo."
          error={err?.code === 'params-unavailable' || err?.code === 'invalid-date' ? errorMessage(err) : undefined}
        />
        <MoneyField
          name="prima"
          label="Prima vacacional"
          value={st.prima}
          onChange={(prima) => set({ prima: prima ?? 0 })}
          prefix=""
          suffix="%"
          decimals={0}
          error={err?.code === 'prima-below-minimum' ? errorMessage(err) : undefined}
        />
      </Disclosure>
    </>
  );

  const result = r ? (
    <>
      <dl class="facts">
        <div>
          <dt>Antigüedad</dt>
          <dd>
            {plural(r.seniority.completedYears, 'año cumplido', 'años cumplidos')}
            {r.seniority.daysIntoYear > 0 ? ` y ${plural(r.seniority.daysIntoYear, 'día', 'días')}` : ''}
          </dd>
        </div>
        <div>
          <dt>Próximo aniversario</dt>
          <dd>
            {formatDateLong(r.seniority.nextAnniversary)}: {plural(r.daysNextYear, 'día', 'días')}
          </dd>
        </div>
        <div>
          <dt>Proporcionales si te vas hoy</dt>
          <dd>{formatDays(r.daysAccrued)} días</dd>
        </div>
      </dl>
      {r.daysEarned === 0 ? (
        <Notice>
          Las vacaciones se ganan al cumplir cada año. Si dejas el trabajo antes, te pagan la parte proporcional (art. 79 LFT).
        </Notice>
      ) : null}
      {lines.length ? (
        <Breakdown id="vacaciones-desglose" caption="Lo que te pagan por tus vacaciones" lines={lines} />
      ) : (
        <p class="calc__fine">Escribe tu salario para ver cuánto te pagan por esos días.</p>
      )}
      <div class="table-scroll" tabIndex={0} role="region" aria-label="Tabla de días de vacaciones por antigüedad">
        <table class="data-table schedule">
          <caption>Días de vacaciones por antigüedad (desde {r.ruleEffectiveFrom.slice(0, 4)})</caption>
          <thead>
            <tr>
              <th scope="col">Años de servicio</th>
              <th scope="col" class="num">
                Días
              </th>
            </tr>
          </thead>
          <tbody>
            {r.schedule.slice(0, 10).map((row) => {
              const year = Math.max(1, r.seniority.completedYears);
              const mine = year >= row.from && year <= row.to;
              return (
                <tr key={row.from} class={mine ? 'highlight-row' : undefined} aria-current={mine ? 'true' : undefined}>
                  <th scope="row">{row.from === row.to ? row.from : `${row.from} a ${row.to}`}</th>
                  <td class="num">{row.days}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ResultActions
        tool="vacaciones"
        shareTitle="Mis días de vacaciones"
        summary={() => summaryText('Vacaciones', reportRows(), window.location.href)}
        onPdf={() =>
          downloadReport(
            makeReport({
              title: 'Cálculo de vacaciones',
              subtitle: 'Artículos 76, 79 y 80 de la Ley Federal del Trabajo (reforma publicada en el DOF el 27/12/2022).',
              headline: { label: 'Días de vacaciones', value: headlineDays ?? 0 },
              sections: [
                { title: 'Datos y resultado', rows: reportRows() },
                { title: 'Valores oficiales usados', rows: citationRows(r.citations) },
              ],
            }),
            `vacaciones-${st.ref}.pdf`,
          )
        }
      />
    </>
  ) : null;

  return (
    <CalculatorShell
      tool="vacaciones"
      resultLabel="Días de vacaciones que te tocan"
      headline={headlineDays}
      format={(n) => `${formatDays(n)} días`}
      headlineNote={
        r && hasSalary && lines[2]
          ? `Pago con prima: ${formatMoney(lines[2].amount)}`
          : r
            ? `Desde tu aniversario del ${formatDateLong(r.seniority.lastAnniversary)}`
            : undefined
      }
      empty={err ? errorMessage(err) : null}
      form={form}
      result={result}
    />
  );
}
