/**
 * Shared pieces for the Mexico payout calculators: error copy and report helpers. The generic
 * shell (URL state, layout, notices) lives in ./shell and is re-exported here.
 */
import type { EngineError, Citation, WarningCode } from '../../lib/engine/mx/lft';
import { formatDateLong, formatMoney, todayInMexico } from '../../lib/ui/format';
import type { Report, ReportRow, ReportSection } from '../../lib/ui/pdf';

export { CalculatorShell, Disclosure, Notice, useUrlState } from './shell';

/** Range of dates for which every Mexico parameter has an official value. */
export const SUPPORTED = { from: '2025-01-01', to: '2026-12-31' } as const;

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
