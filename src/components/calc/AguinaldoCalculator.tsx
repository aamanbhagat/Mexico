import { useMemo } from 'preact/hooks';
import { calculateAguinaldo, type AguinaldoInput, type SalaryPeriod, type WithholdingMethod, type Zone } from '../../lib/engine/mx/lft';
import { formatDateLong, formatDays, formatMoney } from '../../lib/ui/format';
import { bool, buildSearch, isoDate, nullableNum, num, oneOf, type Codec } from '../../lib/ui/url-state';
import { DateField, MoneyField, Segmented } from '../ui/fields';
import { Breakdown, ResultActions, type BreakdownLine } from '../ui/result';
import {
  CalculatorShell,
  Disclosure,
  Notice,
  WARNING_COPY,
  citationRows,
  downloadReport,
  errorMessage,
  makeReport,
  summaryText,
  useUrlState,
} from './shared';
import { PERIOD_OPTIONS, ZONE_OPTIONS, METHOD_OPTIONS, periodLabel } from './options';

interface State {
  salary: number | null;
  period: SalaryPeriod;
  days: number;
  fullYear: boolean;
  start: string;
  stillEmployed: boolean;
  end: string;
  zone: Zone;
  method: WithholdingMethod;
  year: number;
}

const codec: Codec<State> = {
  salary: { key: 's', ...nullableNum(0, 1e8) },
  period: { key: 'p', ...oneOf<SalaryPeriod>(['diario', 'semanal', 'quincenal', 'mensual']) },
  days: { key: 'd', ...num(1, 365) },
  fullYear: { key: 'ta', ...bool },
  start: { key: 'i', ...isoDate },
  stillEmployed: { key: 'e', ...bool },
  end: { key: 'f', ...isoDate },
  zone: { key: 'z', ...oneOf<Zone>(['general', 'zlfn']) },
  method: { key: 'm', ...oneOf<WithholdingMethod>(['art96', 'art174']) },
  year: { key: 'y', ...num(2025, 2026) },
};

function makeDefaults(today: string): State {
  const year = Math.min(Math.max(Number(today.slice(0, 4)), 2025), 2026);
  return {
    salary: null,
    period: 'mensual',
    days: 15,
    fullYear: true,
    start: `${year}-03-01`,
    stillEmployed: true,
    end: today < `${year}-12-31` ? today : `${year}-12-31`,
    zone: 'general',
    method: 'art96',
    year,
  };
}

/** Query string that opens the calculator with an engine input (used by worked examples). */
export function aguinaldoSearch(input: AguinaldoInput, today: string): string {
  const defaults = makeDefaults(today);
  const state: State = {
    ...defaults,
    salary: input.salary.amount,
    period: input.salary.period,
    days: input.aguinaldoDays,
    year: input.year,
    fullYear: !input.startDate,
    start: input.startDate ?? defaults.start,
    stillEmployed: !input.endDate,
    end: input.endDate ?? defaults.end,
    method: input.withholding,
    zone: input.zone ?? 'general',
  };
  return buildSearch(codec, state, defaults);
}

export default function AguinaldoCalculator({ buildDay }: { buildDay: string }) {
  const [st, set] = useUrlState(codec, makeDefaults, buildDay);

  const outcome = useMemo(
    () =>
      calculateAguinaldo({
        salary: { amount: st.salary ?? 0, period: st.period },
        aguinaldoDays: st.days,
        year: st.year,
        startDate: st.fullYear ? undefined : st.start,
        endDate: st.stillEmployed ? undefined : st.end,
        withholding: st.method,
        zone: st.zone,
      }),
    [st],
  );

  const r = outcome.ok ? outcome.value : null;
  const err = outcome.ok ? null : outcome.error;
  const salaryMissing = err?.code === 'salary-required';
  const fieldError = (code: string) => (err && err.code === code ? errorMessage(err, { year: st.year }) : undefined);

  const lines: BreakdownLine[] = r
    ? [
        {
          key: 'gross',
          label: 'Aguinaldo bruto',
          detail: `${formatDays(r.proportionalDays)} días × ${formatMoney(r.dailySalary)} diarios`,
          refs: ['LFT art. 87'],
          amount: r.gross,
        },
        {
          key: 'exempt',
          label: 'Parte exenta',
          detail: `Hasta 30 UMA: 30 × ${formatMoney(r.umaDaily)} = ${formatMoney(r.exemptCap)}`,
          refs: ['LISR art. 93 fr. XIV'],
          amount: r.exempt,
          tone: 'exempt',
        },
        { key: 'taxable', label: 'Parte gravada', amount: r.taxable, tone: 'subtotal' },
        {
          key: 'isr',
          label: 'ISR estimado',
          detail: r.method === 'art174' ? 'Procedimiento opcional del art. 174 RLISR' : 'Art. 96 LISR: se suma a tu sueldo del mes',
          refs: [r.method === 'art174' ? 'RLISR art. 174' : 'LISR art. 96'],
          amount: r.isr,
          tone: 'deduction',
        },
        { key: 'net', label: 'Aguinaldo neto', amount: r.net, tone: 'total' },
      ]
    : [];

  const reportRows = () =>
    r
      ? [
          { label: 'Salario', value: `${formatMoney(st.salary ?? 0)} ${periodLabel(st.period)}` },
          { label: 'Días de aguinaldo', value: String(st.days) },
          { label: 'Periodo', value: `${formatDateLong(r.periodFrom)} – ${formatDateLong(r.periodTo)} (${r.daysWorked} días)` },
          { label: 'Aguinaldo bruto', value: formatMoney(r.gross) },
          { label: 'Exento', value: formatMoney(r.exempt) },
          { label: 'ISR estimado', value: `−${formatMoney(r.isr)}` },
          { label: 'Aguinaldo neto', value: formatMoney(r.net) },
        ]
      : [];

  const form = (
    <>
      <MoneyField
        name="salario"
        label="Tu salario"
        value={st.salary}
        onChange={(salary) => set({ salary })}
        hint="El salario base, sin bonos ni horas extra."
        error={undefined}
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
        legend={`¿Trabajaste todo ${st.year}?`}
        name="ano-completo"
        value={st.fullYear ? 'si' : 'no'}
        options={[
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No, entré después' },
        ]}
        onChange={(v) => set({ fullYear: v === 'si' })}
      />
      {st.fullYear ? null : (
        <DateField
          name="ingreso"
          label="Fecha de ingreso"
          value={st.start}
          onChange={(start) => set({ start })}
          error={fieldError('no-days-in-year') ?? fieldError('end-before-start')}
          max={`${st.year}-12-31`}
        />
      )}
      <Segmented
        legend="¿Sigues en ese trabajo?"
        name="sigue"
        value={st.stillEmployed ? 'si' : 'no'}
        options={[
          { value: 'si', label: 'Sí' },
          { value: 'no', label: 'No, ya salí' },
        ]}
        onChange={(v) => set({ stillEmployed: v === 'si' })}
      />
      {st.stillEmployed ? null : (
        <DateField
          name="salida"
          label="Último día trabajado"
          value={st.end}
          onChange={(end) => set({ end })}
          min={`${st.year}-01-01`}
          max={`${st.year}-12-31`}
        />
      )}
      <MoneyField
        name="dias"
        label="Días de aguinaldo"
        value={st.days}
        onChange={(days) => set({ days: days ?? 0 })}
        prefix=""
        suffix="días"
        decimals={0}
        hint="La ley da mínimo 15. Revisa tu contrato: muchas empresas dan más."
        error={fieldError('aguinaldo-days-below-minimum')}
      />
      <Disclosure summary="Más opciones">
        <Segmented
          legend="Año del aguinaldo"
          name="ano"
          value={String(st.year) as '2025' | '2026'}
          options={[
            { value: '2025', label: '2025' },
            { value: '2026', label: '2026' },
          ]}
          onChange={(v) => set({ year: Number(v) })}
        />
        <Segmented legend="Zona del salario mínimo" name="zona" value={st.zone} options={ZONE_OPTIONS} onChange={(zone) => set({ zone })} />
        <Segmented
          legend="Cómo calcular la retención de ISR"
          name="metodo"
          value={st.method}
          options={METHOD_OPTIONS}
          onChange={(method) => set({ method })}
          hint="Tu empresa elige el método. El del art. 174 suele retener menos."
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
      <Breakdown id="aguinaldo-desglose" caption={`Desglose del aguinaldo ${st.year}`} lines={lines} />
      <p class="calc__fine">
        {r.method === 'art96'
          ? `Con el art. 174 del Reglamento la retención sería de ${formatMoney(r.isrArt174)}.`
          : `Con el art. 96 de la ley la retención sería de ${formatMoney(r.isrArt96)}.`}{' '}
        Se paga a más tardar el 20 de diciembre.
      </p>
      <ResultActions
        shareTitle="Mi cálculo de aguinaldo"
        summary={() => summaryText(`Aguinaldo ${st.year}`, reportRows(), window.location.href)}
        onPdf={() =>
          downloadReport(
            makeReport({
              title: `Cálculo de aguinaldo ${st.year}`,
              subtitle:
                'Artículo 87 de la Ley Federal del Trabajo; exención del art. 93 fr. XIV LISR; retención estimada con la tarifa del art. 96 LISR.',
              headline: { label: 'Aguinaldo neto estimado', value: r.net },
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
            `aguinaldo-${st.year}.pdf`,
          )
        }
      />
    </>
  ) : null;

  return (
    <CalculatorShell
      tool="aguinaldo"
      resultLabel="Tu aguinaldo neto"
      headline={r ? r.net : null}
      headlineNote={r ? `Bruto ${formatMoney(r.gross)} · ISR −${formatMoney(r.isr)}` : undefined}
      empty={salaryMissing ? 'Escribe tu salario para ver cuánto te toca.' : err ? errorMessage(err, { year: st.year }) : null}
      form={form}
      result={result}
    />
  );
}
