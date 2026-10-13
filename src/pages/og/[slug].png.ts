import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../config/site';
import { mxValue } from '../../lib/params/mx';
import { formatMoney } from '../../lib/ui/format';
import { renderOg } from '../../lib/seo/og';

const AS_OF = '2026-12-20';

const SPECS: Record<string, { title: string; subtitle: string; color: string }> = {
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
};

export const getStaticPaths = (() => Object.keys(SPECS).map((slug) => ({ params: { slug } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const spec = SPECS[params['slug'] ?? 'default'] ?? SPECS['default']!;
  const uma = mxValue('mx.uma', AS_OF).daily;
  const sm = mxValue('mx.salario-minimo.general', AS_OF);
  const png = await renderOg({
    ...spec,
    footer: `UMA ${formatMoney(uma)} · Salario mínimo ${formatMoney(sm)}`,
    siteName: SITE.name,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
