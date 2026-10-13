/**
 * pt-BR wording and number formatting for land units, shared by the converter island and the
 * static pages so a figure reads the same everywhere.
 */
import type { CompiledUnit, SourceKind } from '../../lib/land-units/catalog';
import { autoDecimals } from '../../lib/land-units/convert';
import { formatRational } from '../../lib/land-units/number';
import { cmp, div, fromNumber, isExactAt, type Rational } from '../../lib/land-units/rational';

export const LOCALE = 'pt-BR';
const plural = new Intl.PluralRules(LOCALE);
const NBSP = String.fromCharCode(160);

/** "2,42" — up to `max` decimals, trailing zeros trimmed, rounded per ABNT NBR 5891. */
export function num(value: Rational, max?: number): string {
  return formatRational(value, LOCALE, { maxDecimals: max ?? autoDecimals(value) });
}

/** "R$ 30.000,00" */
export function brl(value: Rational): string {
  return `R$${NBSP}${formatRational(value, LOCALE, { maxDecimals: 2, minDecimals: 2 })}`;
}

/** Same as `num` for a float (headline animation frames). */
export function numFromFloat(value: number, max: number): string {
  return num(fromNumber(value), max);
}

/** "alqueire do Norte" — the unit name as it reads mid-sentence. */
export function singular(unit: CompiledUnit): string {
  return unit.name.charAt(0).toLowerCase() + unit.name.slice(1);
}

/** "1 alqueire paulista", "3 alqueires paulistas", "1,5 hectare" (CLDR pt: one for 0 ≤ n < 2). */
export function countOf(amount: Rational, unit: CompiledUnit, max?: number): string {
  const shown = num(amount, max);
  const n = Number(shown.replace(/\./g, '').replace(',', '.').replace('−', '-'));
  return `${shown} ${plural.select(n) === 'one' ? singular(unit) : unit.plural}`;
}

const SHORT: Record<string, { one: string; other: string }> = {
  alqueire: { one: 'alq.', other: 'alq.' },
  tarefa: { one: 'tarefa', other: 'tarefas' },
  litro: { one: 'litro', other: 'litros' },
  quadra: { one: 'quadra', other: 'quadras' },
  braca: { one: 'braça²', other: 'braças²' },
};

/** Short unit for a big headline figure ("ha", "alq.", "tarefas"); the label above names the variant. */
export function shortUnit(unit: CompiledUnit, shown: string): string {
  if (unit.family === 'base') return unit.symbol;
  const forms = SHORT[unit.family];
  if (!forms) return unit.symbol;
  const n = Number(shown.replace(/\./g, '').replace(',', '.').replace('−', '-'));
  return plural.select(n) === 'one' ? forms.one : forms.other;
}

/** "24.200 m²" or "2,42 ha" — the size of one unit, in the clearest of the two. */
export function sizeOf(unit: CompiledUnit, ha: CompiledUnit): string {
  if (cmp(unit.area, ha.area) >= 0) return `${num(div(unit.area, ha.area), 4)}${NBSP}ha`;
  return `${num(unit.area, 4)}${NBSP}m²`;
}

/** True when the figure shown with `max` decimals is the exact value. */
export function isExact(value: Rational, max?: number): boolean {
  return isExactAt(value, max ?? autoDecimals(value));
}

export const KIND_LABEL: Record<SourceKind, string> = {
  oficial: 'órgão oficial',
  'oficial-historica': 'tabela oficial histórica',
  academica: 'pesquisa acadêmica',
  imprensa: 'imprensa',
  comercial: 'site comercial',
};

export const FAMILY_LABEL: Record<string, { one: string; many: string; article: string }> = {
  base: { one: 'medida oficial', many: 'medidas oficiais', article: 'a' },
  alqueire: { one: 'alqueire', many: 'alqueires', article: 'o' },
  tarefa: { one: 'tarefa', many: 'tarefas', article: 'a' },
  litro: { one: 'litro de terra', many: 'litros de terra', article: 'o' },
  quadra: { one: 'quadra', many: 'quadras', article: 'a' },
  braca: { one: 'braça quadrada', many: 'braças quadradas', article: 'a' },
};

/** Option groups for unit pickers, in the order people look for them. */
export const UNIT_GROUPS: { label: string; families: string[] }[] = [
  { label: 'Medidas oficiais', families: ['base'] },
  { label: 'Alqueires', families: ['alqueire'] },
  { label: 'Tarefas', families: ['tarefa'] },
  { label: 'Litro, quadras e braça', families: ['litro', 'quadra', 'braca'] },
];

/** "na Bahia", "em Goiás", "no Paraná": each state takes its own contraction. */
export const IN_STATE: Record<string, string> = {
  AC: 'no Acre',
  AL: 'em Alagoas',
  AP: 'no Amapá',
  AM: 'no Amazonas',
  BA: 'na Bahia',
  CE: 'no Ceará',
  DF: 'no Distrito Federal',
  ES: 'no Espírito Santo',
  GO: 'em Goiás',
  MA: 'no Maranhão',
  MT: 'em Mato Grosso',
  MS: 'em Mato Grosso do Sul',
  MG: 'em Minas Gerais',
  PA: 'no Pará',
  PB: 'na Paraíba',
  PR: 'no Paraná',
  PE: 'em Pernambuco',
  PI: 'no Piauí',
  RJ: 'no Rio de Janeiro',
  RN: 'no Rio Grande do Norte',
  RS: 'no Rio Grande do Sul',
  RO: 'em Rondônia',
  RR: 'em Roraima',
  SC: 'em Santa Catarina',
  SP: 'em São Paulo',
  SE: 'em Sergipe',
  TO: 'no Tocantins',
};

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
