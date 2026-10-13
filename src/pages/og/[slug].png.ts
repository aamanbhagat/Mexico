import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../config/site';
import { mxValue } from '../../lib/params/mx';
import { formatMoney } from '../../lib/ui/format';
import { renderOg } from '../../lib/seo/og';
import { brHa, brM2 } from '../../i18n/tools';

const AS_OF = '2026-12-20';

interface Spec {
  title: string;
  subtitle: string;
  color: string;
  /** Footer line; MX pages show the official values in force. */
  footer?: string;
}

const TERRA = '#8c2f1c';
const BR_FOOTER = `1 alqueire = ${brHa('alqueire-paulista')} ha (paulista) · ${brHa('alqueire-mineiro')} ha (mineiro) · ${brHa('alqueire-baiano')} ha (baiano)`;

const SPECS: Record<string, Spec> = {
  default: {
    title: 'Calculadoras laborales México 2026',
    subtitle: 'Aguinaldo, finiquito, liquidación y vacaciones con la ley vigente.',
    color: '#000000',
  },
  aguinaldo: { title: 'Calculadora de aguinaldo 2026', subtitle: 'Proporcional, parte exenta de ISR y neto.', color: '#b0005e' },
  finiquito: {
    title: 'Calculadora de finiquito 2026',
    subtitle: 'Aguinaldo, vacaciones y prima vacacional proporcionales.',
    color: '#00529b',
  },
  liquidacion: { title: 'Calculadora de liquidación 2026', subtitle: '3 meses, 20 días por año y prima de antigüedad.', color: '#b33a00' },
  'prima-vacacional': {
    title: 'Calculadora de prima vacacional 2026',
    subtitle: 'Prima mínima del 25 % y parte exenta de ISR.',
    color: '#007a44',
  },
  vacaciones: {
    title: 'Calculadora de vacaciones 2026',
    subtitle: 'Días por antigüedad con la reforma de vacaciones dignas.',
    color: '#8a6400',
  },
  uma: { title: 'UMA y salario mínimo 2026', subtitle: 'Valores oficiales vigentes y tabla de ISR mensual.', color: '#6b4423' },

  // pt-BR land units
  br: {
    title: 'Medidas de terra: alqueire, hectare, tarefa',
    subtitle: 'O valor usado em cada estado, com a fonte.',
    color: TERRA,
    footer: BR_FOOTER,
  },
  'alqueire-hectare': {
    title: 'Conversor de alqueire em hectare',
    subtitle: 'Paulista, mineiro, goiano, baiano e do Norte, estado por estado.',
    color: TERRA,
    footer: BR_FOOTER,
  },
  'alqueire-paulista': {
    title: `Alqueire paulista = ${brHa('alqueire-paulista')} ha`,
    subtitle: `${brM2('alqueire-paulista')} m², 50 × 100 braças. SP, PR e MS.`,
    color: TERRA,
    footer: BR_FOOTER,
  },
  'alqueire-mineiro-goiano': {
    title: `Alqueire mineiro e goiano = ${brHa('alqueire-mineiro')} ha`,
    subtitle: `${brM2('alqueire-mineiro')} m², 100 × 100 braças. MG, GO, TO, RJ e ES.`,
    color: TERRA,
    footer: BR_FOOTER,
  },
  'alqueire-baiano': {
    title: `Alqueire baiano: ${brHa('alqueire-baiano')} ou ${brHa('alqueire-mineiro')} ha?`,
    subtitle: 'Os dois valores registrados na Bahia, com as fontes.',
    color: TERRA,
    footer: BR_FOOTER,
  },
  'alqueire-do-norte': {
    title: `Alqueire do Norte = ${brM2('alqueire-norte')} m²`,
    subtitle: '75 × 75 braças, cerca de 2,72 ha. Norte e Nordeste.',
    color: TERRA,
    footer: BR_FOOTER,
  },
  'tarefa-hectare': {
    title: 'Tarefa em hectare',
    subtitle: `Baiana ${brM2('tarefa-baiana')} m², cearense ${brM2('tarefa-cearense')} m², AL e SE ${brM2('tarefa-al-se')} m².`,
    color: TERRA,
    footer: BR_FOOTER,
  },
  'litro-de-terra': {
    title: `1 litro de terra = ${brM2('litro')} m²`,
    subtitle: '80 litros no alqueire mineiro, 40 no paulista.',
    color: TERRA,
    footer: BR_FOOTER,
  },
  'hectare-alqueire': {
    title: 'Hectare para alqueire',
    subtitle: 'Da área do CCIR ou do CAR para o alqueire do seu estado.',
    color: TERRA,
    footer: BR_FOOTER,
  },
};

export const getStaticPaths = (() => Object.keys(SPECS).map((slug) => ({ params: { slug } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const spec = SPECS[params['slug'] ?? 'default'] ?? SPECS['default']!;
  const uma = mxValue('mx.uma', AS_OF).daily;
  const sm = mxValue('mx.salario-minimo.general', AS_OF);
  const png = await renderOg({
    title: spec.title,
    subtitle: spec.subtitle,
    color: spec.color,
    footer: spec.footer ?? `UMA ${formatMoney(uma)} · Salario mínimo ${formatMoney(sm)}`,
    siteName: SITE.name,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
