/**
 * Finiquito y liquidación: one island, two presets. The finiquito page starts with "renuncia",
 * the liquidación page with "despido injustificado"; both run the same engine.
 */
import { useMemo } from 'preact/hooks';
import {
  calculateSeparation,
  type Concept,
  type SalaryPeriod,
  type SeparationCause,
  type SeparationInput,
  type Zone,
} from '../../lib/engine/mx/lft';
import { formatDateLong, formatDays, formatMoney, formatPct } from '../../lib/ui/format';
import { bool, buildSearch, isoDate, nullableNum, num, oneOf, type Codec } from '../../lib/ui/url-state';
import { DateField, MoneyField, RadioCards, Segmented, Switch } from '../ui/fields';
import { Breakdown, ResultActions, type BreakdownLine } from '../ui/result';
import { CAUSE_OPTIONS, PERIOD_OPTIONS, ZONE_OPTIONS, periodLabel } from './options';
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

type Mode = 'finiquito' | 'liquidacion';

interface State {
  salary: number | null;
  period: SalaryPeriod;
  start: string;
  end: string;
  cause: SeparationCause;
  include20: boolean;
  days: number;
  prima: number;
  pendingVac: number;
  unpaid: number;
  aguinaldoPaid: boolean;
  zone: Zone;
  sdi: number | null;
  capUma: boolean;
}

const codec: Codec<State> = {
  salary: { key: 's', ...nullableNum(0, 1e8) },
  period: { key: 'p', ...oneOf<SalaryPeriod>(['diario', 'semanal', 'quincenal', 'mensual']) },
  start: { key: 'i', ...isoDate },
  end: { key: 'f', ...isoDate },
  cause: {
    key: 'c',
    ...oneOf<SeparationCause>(['renuncia', 'mutuo_acuerdo', 'despido_injustificado', 'despido_justificado', 'rescision_trabajador']),
  },
  include20: { key: 'v', ...bool },
  days: { key: 'd', ...num(1, 365) },
  prima: { key: 'pv', ...num(0, 1000) },
  pendingVac: { key: 'vp', ...num(0, 365) },
  unpaid: { key: 'dp', ...num(0, 366) },
  aguinaldoPaid: { key: 'ap', ...bool },
  zone: { key: 'z', ...oneOf<Zone>(['general', 'zlfn']) },
  sdi: { key: 'sdi', ...nullableNum(0, 1e7) },
  capUma: { key: 'tu', ...bool },
};

function defaultsFor(mode: Mode) {
  return (today: string): State => {
    const end = today > SUPPORTED.to ? SUPPORTED.to : today;
    const y = Number(end.slice(0, 4)) - 3;
    return {
      salary: null,
      period: 'mensual',
      start: `${y}${end.slice(4)}`,
      end,
      cause: mode === 'finiquito' ? 'renuncia' : 'despido_injustificado',
      include20: false,
      days: 15,
      prima: 25,
      pendingVac: 0,
      unpaid: 0,
      aguinaldoPaid: false,
      zone: 'general',
      sdi: null,
      capUma: false,
    };
  };
}

const MAKE = { finiquito: defaultsFor('finiquito'), liquidacion: defaultsFor('liquidacion') };

/** Query string that opens the calculator with an engine input (used by worked examples). */
export function separationSearch(mode: Mode, input: SeparationInput, today: string): string {
  const defaults = MAKE[mode](today);
  const state: State = {
    salary: input.salary.amount,
    period: input.salary.period,
    start: input.startDate,
    end: input.endDate,
    cause: input.cause,
    include20: input.include20DaysPerYear,
    days: input.aguinaldoDays,
    prima: input.primaPct,
    pendingVac: input.pendingVacationDays,
    unpaid: input.unpaidDays,
    aguinaldoPaid: input.aguinaldoAlreadyPaid,
    zone: input.zone,
    sdi: input.integratedDaily ?? null,
    capUma: input.seniorityCapBase === 'uma',
  };
  return buildSearch(codec, state, { ...defaults, start: '', end: '' });
}

const CONCEPT_LABEL: Record<Concept['id'], string> = {
  salario_pendiente: 'Salario pendiente',
  aguinaldo: 'Aguinaldo proporcional',
  vacaciones: 'Vacaciones no disfrutadas',
  prima_vacacional: 'Prima vacacional',
  indemnizacion_constitucional: 'Indemnización de 3 meses',
  indemnizacion_20_dias: '20 días por año',
  prima_antiguedad: 'Prima de antigüedad',
};

function yearsText(years: number, days: number, total: number): string {
  const y = years === 1 ? '1 año' : `${years} años`;
  return days > 0 ? `${y} y ${days} días (${total} días en total)` : `${y} exactos`;
}

export default function SeparationCalculator({ buildDay, mode }: { buildDay: string; mode: Mode }) {
  const [st, set] = useUrlState(codec, MAKE[mode], buildDay);

  const outcome = useMemo(
    () =>
      calculateSeparation({
        salary: { amount: st.salary ?? 0, period: st.period },
        integratedDaily: st.sdi ?? undefined,
        startDate: st.start,
        endDate: st.end,
        cause: st.cause,
        include20DaysPerYear: st.include20,
        aguinaldoDays: st.days,
        primaPct: st.prima,
        pendingVacationDays: st.pendingVac,
        unpaidDays: st.unpaid,
        aguinaldoAlreadyPaid: st.aguinaldoPaid,
        zone: st.zone,
        seniorityCapBase: st.capUma ? 'uma' : undefined,
      }),
    [st],
  );

  const r = outcome.ok ? outcome.value : null;
  const err = outcome.ok ? null : outcome.error;
  const errFor = (...codes: string[]) => (err && codes.includes(err.code) ? errorMessage(err) : undefined);
  const isLiquidation = r ? r.separationGross > 0 : false;
  const title = mode === 'finiquito' ? 'Finiquito' : 'Liquidación';
  const netWord = mode === 'finiquito' ? 'neto' : 'neta';

  const lines: BreakdownLine[] = r
    ? [
        ...r.concepts.map((c): BreakdownLine => ({
          key: c.id,
          label: CONCEPT_LABEL[c.id],
          detail:
            c.id === 'prima_vacacional'
              ? `${formatPct(st.prima)} de ${formatDays(c.days / (st.prima / 100))} días × ${formatMoney(c.dailyBase)}`
              : `${formatDays(c.days)} días × ${formatMoney(c.dailyBase)}${c.id === 'prima_antiguedad' && r.seniorityBase < r.integratedDaily ? ' (tope)' : ''}`,
          refs: c.articles,
          amount: c.gross,
        })),
        { key: 'gross', label: 'Total bruto', amount: r.gross, tone: 'subtotal' },
        {
          key: 'exempt',
          label: 'Exento de ISR',
          detail: isLiquidation
            ? `Indemnizaciones: hasta 90 UMA × ${r.yearsForExemption} ${r.yearsForExemption === 1 ? 'año' : 'años'} = ${formatMoney(r.separationExemptCap)}`
            : 'Aguinaldo hasta 30 UMA y prima vacacional hasta 15 UMA',
          refs: ['LISR art. 93 fr. XIII y XIV'],
          amount: r.exempt,
          tone: 'exempt',
        },
        {
          key: 'isr',
          label: 'ISR estimado',
          detail: isLiquidation
            ? `Finiquito ${formatMoney(r.isrOrdinary)} + indemnización ${formatMoney(r.isrSeparation)}${r.isrSeparationMethod === 'effective-rate' ? ' (tasa de tu último sueldo)' : ''}`
            : 'Se suma a tu sueldo del mes (art. 96 LISR)',
          refs: ['LISR art. 96'],
          amount: r.isr,
          tone: 'deduction',
        },
        { key: 'net', label: `${title} ${netWord}`, amount: r.net, tone: 'total' },
      ]
    : [];

  const reportRows = () =>
    r
      ? [
          { label: 'Salario', value: `${formatMoney(st.salary ?? 0)} ${periodLabel(st.period)}` },
          { label: 'Periodo', value: `${formatDateLong(st.start)} – ${formatDateLong(st.end)}` },
          { label: 'Antigüedad', value: yearsText(r.seniority.completedYears, r.seniority.daysIntoYear, r.seniority.totalDays) },
          { label: 'Motivo', value: CAUSE_OPTIONS.find((o) => o.value === st.cause)?.label ?? st.cause },
          {
            label: 'Salario diario integrado',
            value: `${formatMoney(r.integratedDaily)}${r.integratedDailyEstimated ? ' (estimado)' : ''}`,
          },
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
        hint="Tu sueldo base bruto, el de tu recibo."
        placeholder="0.00"
      />
      <Segmented
        legend="Periodo del salario"
        name="periodo"
        value={st.period}
        options={PERIOD_OPTIONS}
        onChange={(period) => set({ period })}
      />
      <div class="field-pair">
        <DateField
          name="ingreso"
          label="Fecha de ingreso"
          value={st.start}
          onChange={(start) => set({ start })}
          max={st.end}
          error={errFor('end-before-start')}
        />
        <DateField
          name="salida"
          label="Último día trabajado"
          value={st.end}
          onChange={(end) => set({ end })}
          min={SUPPORTED.from}
          max={SUPPORTED.to}
          error={errFor('params-unavailable', 'invalid-date')}
        />
      </div>
      <RadioCards
        legend="¿Por qué terminó tu trabajo?"
        name="motivo"
        value={st.cause}
        options={CAUSE_OPTIONS}
        onChange={(cause) => set({ cause })}
      />
      {st.cause === 'despido_injustificado' ? (
        <Switch
          name="veinte-dias"
          label="Incluir 20 días por año"
          checked={st.include20}
          onChange={(include20) => set({ include20 })}
          hint="Proceden si el patrón se niega a reinstalarte o si así lo acuerdan (arts. 49 y 50 LFT). Si solo pides la indemnización, la ley da 3 meses."
        />
      ) : null}
      <div class="field-pair">
        <MoneyField
          name="dias-aguinaldo"
          label="Días de aguinaldo al año"
          value={st.days}
          onChange={(days) => set({ days: days ?? 0 })}
          prefix=""
          suffix="días"
          decimals={0}
          error={errFor('aguinaldo-days-below-minimum')}
        />
        <MoneyField
          name="prima"
          label="Prima vacacional"
          value={st.prima}
          onChange={(prima) => set({ prima: prima ?? 0 })}
          prefix=""
          suffix="%"
          decimals={0}
          error={errFor('prima-below-minimum')}
        />
      </div>
      <Disclosure summary="Más opciones">
        <MoneyField
          name="vacaciones-pendientes"
          label="Vacaciones pendientes de años anteriores"
          value={st.pendingVac}
          onChange={(pendingVac) => set({ pendingVac: pendingVac ?? 0 })}
          prefix=""
          suffix="días"
          decimals={0}
          hint="Días que ya ganaste y no tomaste. Los del año en curso ya están incluidos."
          error={errFor('vacation-days-invalid')}
        />
        <MoneyField
          name="dias-pendientes"
          label="Días trabajados que no te han pagado"
          value={st.unpaid}
          onChange={(unpaid) => set({ unpaid: unpaid ?? 0 })}
          prefix=""
          suffix="días"
          decimals={0}
        />
        <Switch
          name="aguinaldo-pagado"
          label="Ya me pagaron el aguinaldo de este año"
          checked={st.aguinaldoPaid}
          onChange={(aguinaldoPaid) => set({ aguinaldoPaid })}
        />
        <Segmented
          legend="Zona del salario mínimo"
          name="zona"
          value={st.zone}
          options={ZONE_OPTIONS}
          onChange={(zone) => set({ zone })}
          hint="Cambia el tope de la prima de antigüedad."
        />
        <MoneyField
          name="sdi"
          label="Salario diario integrado (opcional)"
          value={st.sdi}
          onChange={(sdi) => set({ sdi })}
          hint="Si lo conoces (viene en tu alta del IMSS), escríbelo. Si no, lo estimamos con las prestaciones de ley."
          placeholder="Calcularlo por mí"
        />
        <Switch
          name="tope-uma"
          label="Comparar: topar la prima de antigüedad con 2 UMA"
          checked={st.capUma}
          onChange={(capUma) => set({ capUma })}
          hint="Criterio minoritario. La ley dice salario mínimo; úsalo solo para comparar con otros cálculos."
        />
      </Disclosure>
    </>
  );

  const result = r ? (
    <>
      <dl class="facts">
        <div>
          <dt>Antigüedad</dt>
          <dd>{yearsText(r.seniority.completedYears, r.seniority.daysIntoYear, r.seniority.totalDays)}</dd>
        </div>
        <div>
          <dt>Salario diario</dt>
          <dd>{formatMoney(r.dailySalary)}</dd>
        </div>
        <div>
          <dt>Salario diario integrado</dt>
          <dd>
            {formatMoney(r.integratedDaily)}
            {r.integratedDailyEstimated ? <span class="facts__note"> estimado (factor {r.integrationFactor.toFixed(4)})</span> : null}
          </dd>
        </div>
      </dl>
      {r.warnings.map((w) => (
        <Notice tone="warning" key={w}>
          {WARNING_COPY[w]}
        </Notice>
      ))}
      {st.cause === 'despido_injustificado' && !st.include20 ? (
        <Notice>
          No incluye los 20 días por año ni los salarios caídos de un juicio. Actívalos arriba si el patrón se negó a reinstalarte.
        </Notice>
      ) : null}
      <Breakdown id={`${mode}-desglose`} caption={`Desglose de tu ${title.toLowerCase()}`} lines={lines} />
      <ResultActions
        tool={mode}
        shareTitle={`Mi cálculo de ${title.toLowerCase()}`}
        summary={() => summaryText(`${title} — cálculo estimado`, reportRows(), window.location.href)}
        onPdf={() =>
          downloadReport(
            makeReport({
              title: `Cálculo de ${title.toLowerCase()}`,
              subtitle: 'Ley Federal del Trabajo (arts. 48, 50, 76, 79, 80, 84, 87, 89, 162, 485 y 486) y Ley del ISR (arts. 93 y 96).',
              headline: { label: `${title} ${netWord} estimad${mode === 'finiquito' ? 'o' : 'a'}`, value: r.net },
              sections: [
                { title: 'Datos', rows: reportRows().slice(0, 5) },
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
            `${mode}-${st.end}.pdf`,
          )
        }
      />
    </>
  ) : null;

  return (
    <CalculatorShell
      tool={mode}
      resultLabel={`Tu ${title.toLowerCase()} ${netWord}`}
      headline={r ? r.net : null}
      headlineNote={r ? `Bruto ${formatMoney(r.gross)} · ISR −${formatMoney(r.isr)}` : undefined}
      empty={
        err?.code === 'salary-required' ? 'Escribe tu salario y tus fechas para ver cuánto te corresponde.' : err ? errorMessage(err) : null
      }
      form={form}
      result={result}
    />
  );
}
