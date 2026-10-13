/** Summary rows for separation examples, computed with the engine at build time. */
import { calculateSeparation, type SeparationInput } from '../../lib/engine/mx/lft';
import { formatMoney } from '../../lib/ui/format';

const LABELS: Record<string, string> = {
  salario_pendiente: 'Salario pendiente',
  aguinaldo: 'Aguinaldo proporcional',
  vacaciones: 'Vacaciones',
  prima_vacacional: 'Prima vacacional',
  indemnizacion_constitucional: '3 meses de salario',
  indemnizacion_20_dias: '20 días por año',
  prima_antiguedad: 'Prima de antigüedad',
};

export function separationExampleRows(input: SeparationInput): { label: string; value: string }[] {
  const r = calculateSeparation(input);
  if (!r.ok) throw new Error(`Example failed: ${r.error.code}`);
  const v = r.value;
  return [
    ...v.concepts.map((c) => ({ label: LABELS[c.id] ?? c.id, value: formatMoney(c.gross) })),
    { label: 'ISR estimado', value: `−${formatMoney(v.isr)}` },
    { label: 'Recibes', value: formatMoney(v.net) },
  ];
}
