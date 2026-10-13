/**
 * Shared pieces for the Mexico payout calculators: URL-state hook, error copy, layout shell
 * (form + result panel + sticky mobile result bar) and report helpers.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { EngineError, Citation, WarningCode } from '../../lib/engine/mx/lft';
import { formatDateLong, formatMoney, todayInMexico } from '../../lib/ui/format';
import { buildSearch, readState, writeState, type Codec } from '../../lib/ui/url-state';
import type { Report, ReportRow, ReportSection } from '../../lib/ui/pdf';
import { AnimatedNumber, Icon, useAnnouncement } from '../ui/result';
import { track } from '../../lib/ui/analytics';

/** Range of dates for which every Mexico parameter has an official value. */
export const SUPPORTED = { from: '2025-01-01', to: '2026-12-31' } as const;

/* URL state ----------------------------------------------------------------------------------- */

/**
 * Calculator state mirrored in the query string. Defaults depend on "today", which is only
 * known on the client (the HTML is built ahead of time), so they are rebuilt on mount.
 * Returns [state, patch, today].
 */
export function useUrlState<T extends object>(
  codec: Codec<T>,
  makeDefaults: (today: string) => T,
  buildDay: string,
): [T, (patch: Partial<T>) => void, string] {
  const [today, setToday] = useState(buildDay);
  const defaults = useRef<T>(makeDefaults(buildDay));
  const [state, setState] = useState<T>(defaults.current);
  const ready = useRef(false);

  useEffect(() => {
    const now = todayInMexico();
    defaults.current = makeDefaults(now);
    setToday(now);
    const initial = makeDefaults(buildDay);
    setState((prev) => {
      const next = readState(codec, defaults.current, window.location.search);
      // Keep anything the person changed before hydration (fields report it on mount).
      for (const key of Object.keys(prev) as (keyof T)[]) {
        if (!Object.is(prev[key], initial[key])) next[key] = prev[key];
      }
      return next;
    });
    ready.current = true;
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready.current) writeState(buildSearch(codec, state, defaults.current));
  }, [state, codec]);

  return [state, (patch) => setState((prev) => ({ ...prev, ...patch })), today];
}

/* Copy ------------------------------------------------------------------------------------------ */

export function errorMessage(error: EngineError, context: { year?: number } = {}): string {
  switch (error.code) {
    case 'salary-required':
      return 'Escribe tu salario para ver el resultado.';
    case 'invalid-date':
      return 'Revisa las fechas: alguna no es válida.';
    case 'end-before-start':
      return 'La fecha final no puede ser anterior a la fecha de ingreso.';
    case 'no-days-in-year':
      return `Con esas fechas no trabajaste ningún día de ${context.year ?? 'ese año'}.`;
    case 'aguinaldo-days-below-minimum':
      return `La ley marca al menos ${error.min ?? 15} días de aguinaldo (art. 87 LFT).`;
    case 'prima-below-minimum':
      return `La prima vacacional mínima es de ${error.min ?? 25} % (art. 80 LFT).`;
    case 'vacation-days-invalid':
      return 'Escribe un número de días válido.';
    case 'params-unavailable':
      return `Todavía no hay valores oficiales publicados para esa fecha. Por ahora calculamos del ${formatDateLong(SUPPORTED.from)} al ${formatDateLong(SUPPORTED.to)}.`;
  }
}

export const WARNING_COPY: Record<WarningCode, string> = {
  'below-minimum-wage':
    'Tu salario diario es menor al salario mínimo de tu zona. Si trabajas la jornada completa, revisa tu caso con PROFEDET.',
  'aguinaldo-already-paid-excluded': 'No incluimos el aguinaldo porque indicaste que ya te lo pagaron este año.',
  'cap-applied': 'Tu salario pasa del tope del art. 486 LFT: la prima de antigüedad se calcula con el doble del salario mínimo de tu zona.',
  'floor-applied': 'Tu salario integrado es menor al salario mínimo: la prima de antigüedad se calcula con el mínimo (art. 485 LFT).',
};

/* Layout shell ---------------------------------------------------------------------------------- */

interface ShellProps {
  /** Short name for headings: "Tu aguinaldo". */
  resultLabel: string;
  headline: number | null;
  /** Shown under the headline: "Bruto $7,500.00 · ISR −$769.99". */
  headlineNote?: ComponentChildren;
  empty: string | null;
  form: ComponentChildren;
  result: ComponentChildren;
  tool: string;
  /** How the headline figure is written (money by default). */
  format?: (n: number) => string;
}

export function CalculatorShell({ resultLabel, headline, headlineNote, empty, form, result, tool, format = formatMoney }: ShellProps) {
  const announcement = useAnnouncement(headline === null ? '' : `${resultLabel}: ${format(headline)}`);
  // One "calculo" event per page view, the first time a result appears (completion-rate KPI).
  const counted = useRef(false);
  useEffect(() => {
    if (headline !== null && !counted.current && announcement) {
      counted.current = true;
      track('calculo', tool);
    }
  }, [headline, announcement, tool]);
  return (
    <div class="calc" data-tool={tool}>
      <form class="calc__form" onSubmit={(e) => e.preventDefault()} aria-label="Datos para el cálculo" noValidate>
        {form}
      </form>
      <section class="calc__result" aria-labelledby={`${tool}-result-title`}>
        <div class="result-head">
          <h2 class="result-head__label" id={`${tool}-result-title`}>
            {resultLabel}
          </h2>
          {headline === null ? (
            <p class="result-head__empty">{empty}</p>
          ) : (
            <>
              <p class="result-head__amount">
                <AnimatedNumber value={headline} format={format} />
              </p>
              {headlineNote ? <p class="result-head__note">{headlineNote}</p> : null}
            </>
          )}
        </div>
        {headline === null ? null : result}
        <p class="sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>
      <div class="result-bar" aria-hidden={headline === null ? 'true' : undefined}>
        <span class="result-bar__label">{resultLabel}</span>
        <span class="result-bar__amount">{headline === null ? '—' : format(headline)}</span>
        <a class="result-bar__link" href={`#${tool}-desglose`} tabIndex={headline === null ? -1 : undefined}>
          Ver desglose
        </a>
      </div>
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: ComponentChildren }) {
  return (
    <p class={`notice notice--${tone}`}>
      <Icon name={tone === 'warning' ? 'alert' : 'info'} />
      <span>{children}</span>
    </p>
  );
}

export function Disclosure({ summary, children }: { summary: string; children: ComponentChildren }) {
  return (
    <details class="disclosure">
      <summary class="disclosure__summary">{summary}</summary>
      <div class="disclosure__body">{children}</div>
    </details>
  );
}

/* Report helpers -------------------------------------------------------------------------------- */

export function citationRows(citations: Citation[]): ReportRow[] {
  return citations
    .filter((c) => ['mx.uma', 'mx.salario-minimo.general', 'mx.salario-minimo.zlfn', 'mx.isr.tarifa-mensual'].includes(c.id))
    .map((c) => ({
      label: c.name,
      detail: `${c.source_title} — ${c.source_url}${c.verified ? '' : ' (verificación de la fuente pendiente)'}`,
      value:
        c.id === 'mx.uma'
          ? formatMoney((c.value as { daily: number }).daily)
          : typeof c.value === 'number'
            ? formatMoney(c.value)
            : `desde ${c.effective_from}`,
    }));
}

export function makeReport(args: {
  title: string;
  subtitle: string;
  headline: { label: string; value: number };
  sections: ReportSection[];
}): Report {
  return {
    siteName: 'Tabula · Calculadoras México',
    title: args.title,
    subtitle: args.subtitle,
    url: typeof window === 'undefined' ? '' : window.location.href,
    generatedOn: `Generado el ${formatDateLong(todayInMexico())}`,
    headline: { label: args.headline.label, value: formatMoney(args.headline.value) },
    sections: args.sections,
    notes: [
      'Estimación informativa basada en la Ley Federal del Trabajo y la Ley del ISR con los valores oficiales vigentes en la fecha indicada. No sustituye asesoría legal ni fiscal. La retención real depende de tu nómina y del cálculo anual del ISR.',
      'Revisión legal: pendiente.',
    ],
  };
}

export function summaryText(title: string, rows: { label: string; value: string }[], url: string): string {
  const lines = [
    title,
    ...rows.map((r) => `${r.label}: ${r.value}`),
    '',
    'Estimación informativa (LFT y LISR). Revisión legal pendiente.',
    url,
  ];
  return lines.join('\n');
}

export async function downloadReport(report: Report, filename: string): Promise<void> {
  const { downloadPdf } = await import('../../lib/ui/pdf');
  downloadPdf(report, filename);
}
