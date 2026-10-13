import type { SalaryPeriod, SeparationCause, WithholdingMethod, Zone } from '../../lib/engine/mx/lft';

export const PERIOD_OPTIONS: readonly { value: SalaryPeriod; label: string }[] = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'diario', label: 'Diario' },
];

export function periodLabel(p: SalaryPeriod): string {
  return { mensual: 'al mes', quincenal: 'a la quincena', semanal: 'a la semana', diario: 'al día' }[p];
}

export const ZONE_OPTIONS: readonly { value: Zone; label: string }[] = [
  { value: 'general', label: 'Resto del país' },
  { value: 'zlfn', label: 'Frontera norte' },
];

export const METHOD_OPTIONS: readonly { value: WithholdingMethod; label: string }[] = [
  { value: 'art96', label: 'Art. 96 LISR' },
  { value: 'art174', label: 'Art. 174 RLISR' },
];

export const CAUSE_OPTIONS: readonly { value: SeparationCause; label: string; description: string }[] = [
  { value: 'renuncia', label: 'Renuncia voluntaria', description: 'Finiquito. Prima de antigüedad solo con 15 años o más.' },
  { value: 'despido_injustificado', label: 'Despido injustificado', description: 'Finiquito + 3 meses de salario + prima de antigüedad.' },
  {
    value: 'rescision_trabajador',
    label: 'Dejé el trabajo por culpa del patrón',
    description: 'Art. 51: 3 meses + 20 días por año + prima de antigüedad.',
  },
  { value: 'despido_justificado', label: 'Despido con causa justificada', description: 'Finiquito + prima de antigüedad (art. 162).' },
  { value: 'mutuo_acuerdo', label: 'Terminación por mutuo acuerdo', description: 'Se trata como renuncia para la prima de antigüedad.' },
];
