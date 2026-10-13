/**
 * The tools published per locale: one list drives the locale home page, the footer and the
 * "related" links on every page. Figures in descriptions are read from the parameter registry,
 * never typed here.
 */
import type { PageKey } from './routes';
import type { UiLocale } from './ui';
import { BR_LAND } from '../lib/params/br';
import { formatRational } from '../lib/land-units/number';
import { convertArea } from '../lib/land-units/convert';
import { rat } from '../lib/land-units/rational';
import { KALENDER_YEARS } from '../content/id/meta';

/** Line color (data-tool) of a page. */
export type Tool =
  | 'aguinaldo'
  | 'finiquito'
  | 'liquidacion'
  | 'prima-vacacional'
  | 'vacaciones'
  | 'uma'
  | 'terra'
  | 'weton'
  | 'jodoh'
  | 'kalender'
  | 'hari-ini';
/** Pictogram drawn in the station icon; defaults to the tool. */
export type Pictogram = Tool | 'alqueire' | 'hectare' | 'tarefa' | 'litro';

export interface ToolEntry {
  key: PageKey;
  tool: Tool;
  icon: Pictogram;
  /** Short name (home page, footer). */
  name: string;
  /** Link text in "related" lists. */
  label: string;
  /** One line saying what the tool answers. */
  what: string;
}

/** "2,42" — hectares in one unit of the BR catalog, pt-BR formatted. */
export function brHa(id: string, decimals = 2): string {
  const unit = BR_LAND.byId.get(id);
  const ha = BR_LAND.byId.get('ha');
  if (!unit || !ha) throw new Error(`Unknown land unit ${id}`);
  return formatRational(convertArea(rat(1n), unit, ha), 'pt-BR', { maxDecimals: decimals });
}

/** "24.200" — square metres in one unit of the BR catalog. */
export function brM2(id: string): string {
  const unit = BR_LAND.byId.get(id);
  if (!unit) throw new Error(`Unknown land unit ${id}`);
  return formatRational(unit.area, 'pt-BR', { maxDecimals: 4 });
}

const NBSP = String.fromCharCode(160);
/** "2,42 ha" with a no-break space, so the unit never wraps away from its number. */
export const haOf = (id: string, decimals = 2) => `${brHa(id, decimals)}${NBSP}ha`;
/** "24.200 m²" with a no-break space. */
export const m2Of = (id: string) => `${brM2(id)}${NBSP}m²`;

export const TOOLS: Record<UiLocale, ToolEntry[]> = {
  'es-mx': [
    {
      key: 'mx.aguinaldo',
      tool: 'aguinaldo',
      icon: 'aguinaldo',
      name: 'Aguinaldo',
      label: 'Calculadora de aguinaldo',
      what: 'Cuánto te toca antes del 20 de diciembre, proporcional y neto de ISR.',
    },
    {
      key: 'mx.finiquito',
      tool: 'finiquito',
      icon: 'finiquito',
      name: 'Finiquito',
      label: 'Calculadora de finiquito',
      what: 'Lo que te deben al renunciar: aguinaldo, vacaciones y prima vacacional.',
    },
    {
      key: 'mx.liquidacion',
      tool: 'liquidacion',
      icon: 'liquidacion',
      name: 'Liquidación',
      label: 'Calculadora de liquidación',
      what: 'Despido injustificado: 3 meses, 20 días por año y prima de antigüedad.',
    },
    {
      key: 'mx.prima-vacacional',
      tool: 'prima-vacacional',
      icon: 'prima-vacacional',
      name: 'Prima vacacional',
      label: 'Calculadora de prima vacacional',
      what: 'El 25 % extra sobre tus días de vacaciones y su parte exenta.',
    },
    {
      key: 'mx.vacaciones',
      tool: 'vacaciones',
      icon: 'vacaciones',
      name: 'Vacaciones',
      label: 'Calculadora de vacaciones',
      what: 'Días que te tocan por antigüedad con la reforma de 2023.',
    },
    {
      key: 'mx.uma-salario-minimo',
      tool: 'uma',
      icon: 'uma',
      name: 'UMA y salario mínimo 2026',
      label: 'UMA y salario mínimo 2026',
      what: 'Valores oficiales vigentes, tabla de ISR y montos exentos.',
    },
  ],
  'pt-br': [
    {
      key: 'br.alqueire-hectare',
      tool: 'terra',
      icon: 'alqueire',
      name: 'Alqueire em hectare',
      label: 'Conversor de alqueire em hectare',
      what: 'Todos os alqueires, tarefas, litros e quadras, com o valor usado em cada estado e a fonte.',
    },
    {
      key: 'br.hectare-alqueire',
      tool: 'terra',
      icon: 'hectare',
      name: 'Hectare para alqueire',
      label: 'Hectare para alqueire',
      what: 'O caminho inverso, para quem tem a área do CCIR, do CAR ou do georreferenciamento.',
    },
    {
      key: 'br.alqueire-paulista',
      tool: 'terra',
      icon: 'alqueire',
      name: 'Alqueire paulista',
      label: 'Alqueire paulista em hectare',
      what: `${brHa('alqueire-paulista')} hectares, o alqueire de São Paulo, do Paraná e de Mato Grosso do Sul.`,
    },
    {
      key: 'br.alqueire-mineiro-goiano',
      tool: 'terra',
      icon: 'alqueire',
      name: 'Alqueire mineiro e goiano',
      label: 'Alqueire mineiro e goiano em hectare',
      what: `${brHa('alqueire-mineiro')} hectares, o alqueire de Minas, Goiás, Tocantins, Rio de Janeiro e Espírito Santo.`,
    },
    {
      key: 'br.alqueire-baiano',
      tool: 'terra',
      icon: 'alqueire',
      name: 'Alqueire baiano',
      label: 'Alqueire baiano em hectare',
      what: `${brHa('alqueire-baiano')} ou ${brHa('alqueire-mineiro')} hectares: por que a Bahia tem dois valores.`,
    },
    {
      key: 'br.alqueire-do-norte',
      tool: 'terra',
      icon: 'alqueire',
      name: 'Alqueire do Norte',
      label: 'Alqueire do Norte em hectare',
      what: `${brM2('alqueire-norte')} m², o alqueire de 75 × 75 braças do Norte e do Nordeste.`,
    },
    {
      key: 'br.tarefa-hectare',
      tool: 'terra',
      icon: 'tarefa',
      name: 'Tarefa em hectare',
      label: 'Tarefa em hectare',
      what: 'A tarefa baiana, a cearense e as duas de Alagoas e Sergipe.',
    },
    {
      key: 'br.litro-de-terra',
      tool: 'terra',
      icon: 'litro',
      name: 'Litro de terra',
      label: 'Litro de terra em m²',
      what: `${brM2('litro')} m² por litro, e quantos litros cabem em cada alqueire.`,
    },
  ],
  id: [
    {
      key: 'id.weton',
      tool: 'weton',
      icon: 'weton',
      name: 'Cek weton',
      label: 'Cek weton',
      what: 'Weton, neptu, wuku, tanggal Jawa dan Hijriah dari tanggal lahir.',
    },
    {
      key: 'id.weton.jodoh',
      tool: 'jodoh',
      icon: 'jodoh',
      name: 'Weton jodoh',
      label: 'Weton jodoh',
      what: 'Hasil sisa 8, 7, 5 dan 4 sekaligus, dengan sumber setiap metode.',
    },
    {
      key: 'id.weton.hari-ini',
      tool: 'hari-ini',
      icon: 'hari-ini',
      name: 'Weton hari ini',
      label: 'Weton hari ini',
      what: 'Pasaran dan tanggal Jawa hari ini, besok dan tujuh hari ke depan.',
    },
    ...KALENDER_YEARS.map((y) => ({
      key: `id.kalender.${y}` as const,
      tool: 'kalender' as const,
      icon: 'kalender' as const,
      name: `Kalender Jawa ${y}`,
      label: `Kalender Jawa ${y}`,
      what: `Setiap tanggal ${y} dengan pasaran, tanggal Jawa, Hijriah Kemenag dan hari libur. Bisa dicetak.`,
    })),
  ],
};

export function toolsFor(locale: UiLocale): ToolEntry[] {
  return TOOLS[locale];
}

export function toolFor(key: PageKey): ToolEntry | undefined {
  for (const list of Object.values(TOOLS)) {
    const hit = list.find((t) => t.key === key);
    if (hit) return hit;
  }
  return undefined;
}
