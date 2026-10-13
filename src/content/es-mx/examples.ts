/**
 * Worked examples shown on the es-MX pages. The same objects drive the golden tests in
 * tests/unit/engine/*.test.ts, so a page can never show an example the engine disagrees with.
 *
 * `expected` values were derived independently (Decimal arithmetic in a separate script,
 * see tests/golden/README.md) and, where a public source publishes the same case, match it.
 */
import type { AguinaldoInput, PrimaVacacionalInput, SeparationInput, VacacionesInput } from '../../lib/engine/mx/lft';

export interface ExampleSource {
  label: string;
  url: string;
}

export interface Example<I, E> {
  id: string;
  title: string;
  /** One or two sentences in natural es-MX describing the case. */
  story: string;
  input: I;
  expected: E;
  /** Where the case or its arithmetic comes from. */
  source: ExampleSource;
}

const PROFEDET_AGUINALDO: ExampleSource = {
  label: 'PROFEDET, Preguntas frecuentes sobre aguinaldo',
  url: 'https://www.gob.mx/profedet/articulos/preguntas-frecuentes-sobre-aguinaldo',
};
const INADEM_AGUINALDO: ExampleSource = {
  label: 'INADEM (gob.mx), Calcula el pago de aguinaldo para tus trabajadores',
  url: 'https://www.inadem.gob.mx/calcula-el-pago-de-aguinaldo-para-tus-trabajadores/',
};
const CCL_VACACIONES: ExampleSource = {
  label: 'Centro de Conciliación Laboral de Sinaloa, Vacaciones y prima vacacional',
  url: 'https://cclsinaloa.gob.mx/vacaciones-ley-federal-del-trabajo-cuantos-dias-te-tocan-y-calculo-de-prima/',
};
const CCL_INDEMNIZACION: ExampleSource = {
  label: 'Centro de Conciliación Laboral de Sinaloa, Indemnización por despido injustificado',
  url: 'https://cclsinaloa.gob.mx/indemnizacion-por-despido-injustificado-como-se-calcula/',
};
const OWN_ARITHMETIC: ExampleSource = {
  label: 'Cálculo propio con la LFT, el art. 93 LISR, la UMA 2026 y la tarifa del Anexo 8 RMF 2026',
  url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
};

/* ---------------------------------------------------------------------------------------------- */

export interface AguinaldoExpected {
  daysWorked: number;
  gross: number;
  exempt: number;
  taxable: number;
  isrArt96: number;
  isrArt174: number;
  net: number;
}

export const AGUINALDO_EXAMPLES: Example<AguinaldoInput, AguinaldoExpected>[] = [
  {
    id: 'aguinaldo-ano-completo',
    title: 'Año completo con salario de $500 diarios',
    story:
      'Trabajaste todo 2026 y ganas $500 al día. Te tocan los 15 días que marca la ley: $7,500. Como pasa del monto exento (30 UMA = $3,519.30), una parte paga ISR.',
    input: { salary: { amount: 500, period: 'diario' }, aguinaldoDays: 15, year: 2026, withholding: 'art96' },
    expected: { daysWorked: 365, gross: 7500, exempt: 3519.3, taxable: 3980.7, isrArt96: 769.99, isrArt174: 713.34, net: 6730.01 },
    source: PROFEDET_AGUINALDO,
  },
  {
    id: 'aguinaldo-proporcional',
    title: 'Entraste el 1 de junio: aguinaldo proporcional',
    story:
      'Ganas $10,000 al mes ($333.33 diarios) y empezaste el 1 de junio de 2026. Del 1 de junio al 31 de diciembre son 214 días, así que te toca la parte proporcional y todo queda exento.',
    input: {
      salary: { amount: 333.33, period: 'diario' },
      aguinaldoDays: 15,
      year: 2026,
      startDate: '2026-06-01',
      withholding: 'art96',
    },
    expected: { daysWorked: 214, gross: 2931.48, exempt: 2931.48, taxable: 0, isrArt96: 0, isrArt174: 0, net: 2931.48 },
    source: INADEM_AGUINALDO,
  },
  {
    id: 'aguinaldo-30-dias',
    title: '30 días de aguinaldo con sueldo de $25,000 al mes',
    story:
      'Tu empresa da 30 días y ganas $25,000 mensuales. El aguinaldo es de $25,000. Con el procedimiento opcional del art. 174 del Reglamento te retienen menos que con el art. 96.',
    input: { salary: { amount: 25000, period: 'mensual' }, aguinaldoDays: 30, year: 2026, withholding: 'art174' },
    expected: { daysWorked: 365, gross: 25000, exempt: 3519.3, taxable: 21480.7, isrArt96: 4828.43, isrArt174: 4588.28, net: 20411.72 },
    source: OWN_ARITHMETIC,
  },
];

/* ---------------------------------------------------------------------------------------------- */

export interface PrimaVacacionalExpected {
  gross: number;
  exempt: number;
  taxable: number;
  isrArt96: number;
  isrArt174: number;
}

export const PRIMA_VACACIONAL_EXAMPLES: Example<PrimaVacacionalInput, PrimaVacacionalExpected>[] = [
  {
    id: 'prima-primer-ano',
    title: 'Primer año: 12 días y prima del 25 %',
    story:
      'Cumpliste tu primer año, ganas $500 diarios y te tocan 12 días. Tus vacaciones valen $6,000 y la prima vacacional es el 25 %: $1,500, sin ISR porque no pasa de 15 UMA.',
    input: { salary: { amount: 500, period: 'diario' }, vacationDays: 12, primaPct: 25, paymentDate: '2026-06-15', withholding: 'art96' },
    expected: { gross: 1500, exempt: 1500, taxable: 0, isrArt96: 0, isrArt174: 0 },
    source: CCL_VACACIONES,
  },
  {
    id: 'prima-30-por-ciento',
    title: 'Siete años de antigüedad y prima del 30 %',
    story:
      'Llevas 7 años (22 días de vacaciones), ganas $800 diarios y tu contrato da 30 % de prima. Son $5,280; los primeros $1,759.65 están exentos.',
    input: { salary: { amount: 800, period: 'diario' }, vacationDays: 22, primaPct: 30, paymentDate: '2026-07-15', withholding: 'art96' },
    expected: { gross: 5280, exempt: 1759.65, taxable: 3520.35, isrArt96: 751.95, isrArt174: 751.95 },
    source: OWN_ARITHMETIC,
  },
  {
    id: 'prima-frontera',
    title: 'Salario mínimo de la frontera norte, segundo año',
    story:
      'Ganas el salario mínimo de la Zona Libre de la Frontera Norte ($440.87 en 2026) y cumpliste 2 años: 14 días. La prima es de $1,543.05 y queda exenta.',
    input: {
      salary: { amount: 440.87, period: 'diario' },
      vacationDays: 14,
      primaPct: 25,
      paymentDate: '2026-09-01',
      withholding: 'art96',
      zone: 'zlfn',
    },
    expected: { gross: 1543.05, exempt: 1543.05, taxable: 0, isrArt96: 0, isrArt174: 0 },
    source: OWN_ARITHMETIC,
  },
];

/* ---------------------------------------------------------------------------------------------- */

export interface VacacionesExpected {
  completedYears: number;
  daysEarned: number;
  daysNextYear: number;
  vacationPay: number;
  primaVacacional: number;
}

export const VACACIONES_EXAMPLES: Example<VacacionesInput, VacacionesExpected>[] = [
  {
    id: 'vacaciones-primer-ano',
    title: 'Cumpliste un año: 12 días',
    story:
      'Entraste el 1 de junio de 2025 y ganas $500 al día. Desde tu primer aniversario te tocan 12 días: $6,000 de vacaciones más $1,500 de prima.',
    input: { salary: { amount: 500, period: 'diario' }, startDate: '2025-06-01', referenceDate: '2026-06-15', primaPct: 25 },
    expected: { completedYears: 1, daysEarned: 12, daysNextYear: 14, vacationPay: 6000, primaVacacional: 1500 },
    source: CCL_VACACIONES,
  },
  {
    id: 'vacaciones-siete-anos',
    title: 'Siete años: 22 días',
    story:
      'Entraste el 4 de marzo de 2019 y ganas $18,000 al mes ($600 diarios). Con 7 años cumplidos estás en el bloque de 6 a 10 años: 22 días.',
    input: { salary: { amount: 18000, period: 'mensual' }, startDate: '2019-03-04', referenceDate: '2026-10-13', primaPct: 25 },
    expected: { completedYears: 7, daysEarned: 22, daysNextYear: 22, vacationPay: 13200, primaVacacional: 3300 },
    source: OWN_ARITHMETIC,
  },
  {
    id: 'vacaciones-26-anos',
    title: 'Veintiséis años: 30 días',
    story: 'Llevas desde enero de 2000 y ganas $1,000 diarios. Con 26 años cumplidos te tocan 30 días: $30,000 más $7,500 de prima.',
    input: { salary: { amount: 1000, period: 'diario' }, startDate: '2000-01-10', referenceDate: '2026-10-13', primaPct: 25 },
    expected: { completedYears: 26, daysEarned: 30, daysNextYear: 30, vacationPay: 30000, primaVacacional: 7500 },
    source: OWN_ARITHMETIC,
  },
];

/* ---------------------------------------------------------------------------------------------- */

export interface SeparationExpected {
  completedYears: number;
  integratedDaily: number;
  concepts: Partial<Record<string, number>>;
  gross: number;
  isrOrdinary: number;
  isrSeparation: number;
  net: number;
}

const BASE_SEPARATION = {
  aguinaldoDays: 15,
  primaPct: 25,
  pendingVacationDays: 0,
  unpaidDays: 0,
  aguinaldoAlreadyPaid: false,
  include20DaysPerYear: false,
  zone: 'general',
} as const satisfies Partial<SeparationInput>;

export const FINIQUITO_EXAMPLES: Example<SeparationInput, SeparationExpected>[] = [
  {
    id: 'finiquito-renuncia-3-anos',
    title: 'Renuncia con 3 años y medio de antigüedad',
    story:
      'Ganas $15,000 al mes, entraste el 1 de marzo de 2023 y tu último día es el 15 de octubre de 2026. Por renunciar no hay indemnización ni prima de antigüedad (necesitas 15 años), pero sí aguinaldo, vacaciones y prima vacacional proporcionales.',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 15000, period: 'mensual' },
      startDate: '2023-03-01',
      endDate: '2026-10-15',
      cause: 'renuncia',
    },
    expected: {
      completedYears: 3,
      integratedDaily: 526.71,
      concepts: { aguinaldo: 5917.81, vacaciones: 5646.58, prima_vacacional: 1411.64 },
      gross: 12976.03,
      isrOrdinary: 1631.26,
      isrSeparation: 0,
      net: 11344.77,
    },
    source: OWN_ARITHMETIC,
  },
  {
    id: 'finiquito-renuncia-16-anos',
    title: 'Renuncia con 16 años: sí hay prima de antigüedad',
    story:
      'Ganas $900 diarios, entraste el 1 de junio de 2010 y renuncias el 30 de septiembre de 2026, con 15 días trabajados sin pagar. Con más de 15 años sí cobras prima de antigüedad, pero el salario se topa en dos salarios mínimos ($630.08).',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 900, period: 'diario' },
      startDate: '2010-06-01',
      endDate: '2026-09-30',
      cause: 'renuncia',
      unpaidDays: 15,
    },
    expected: {
      completedYears: 16,
      integratedDaily: 953.01,
      concepts: {
        salario_pendiente: 13500,
        aguinaldo: 10097.26,
        vacaciones: 7821.37,
        prima_vacacional: 1955.34,
        prima_antiguedad: 123502.58,
      },
      gross: 156876.55,
      isrOrdinary: 5211.74,
      isrSeparation: 0,
      net: 151664.81,
    },
    source: OWN_ARITHMETIC,
  },
  {
    id: 'finiquito-primer-ano',
    title: 'Renuncia antes de cumplir un año',
    story:
      'Entraste el 16 de febrero de 2026, ganas $400 diarios y te vas el 31 de agosto. Aunque no cumpliste el año, te pagan las vacaciones proporcionales (art. 79) con su prima y el aguinaldo proporcional.',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 400, period: 'diario' },
      startDate: '2026-02-16',
      endDate: '2026-08-31',
      cause: 'renuncia',
    },
    expected: {
      completedYears: 0,
      integratedDaily: 419.73,
      concepts: { aguinaldo: 3238.36, vacaciones: 2590.68, prima_vacacional: 647.67 },
      gross: 6476.71,
      isrOrdinary: 394.12,
      isrSeparation: 0,
      net: 6082.59,
    },
    source: OWN_ARITHMETIC,
  },
];

export const LIQUIDACION_EXAMPLES: Example<SeparationInput, SeparationExpected>[] = [
  {
    id: 'liquidacion-5-anos-sdi',
    title: 'Despido injustificado, 5 años, salario integrado de $349.31',
    story:
      'Te despiden sin causa después de exactamente 5 años y el patrón se niega a reinstalarte. Con un salario diario integrado de $349.31: 3 meses ($31,437.90), 20 días por año ($34,931.00) y prima de antigüedad ($20,958.60), más tu aguinaldo proporcional.',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 333.33, period: 'diario' },
      integratedDaily: 349.31,
      startDate: '2021-10-16',
      endDate: '2026-10-15',
      cause: 'despido_injustificado',
      include20DaysPerYear: true,
    },
    expected: {
      completedYears: 5,
      integratedDaily: 349.31,
      concepts: { aguinaldo: 3945.17, indemnizacion_constitucional: 31437.9, indemnizacion_20_dias: 34931, prima_antiguedad: 20958.6 },
      gross: 91272.67,
      isrOrdinary: 46.33,
      isrSeparation: 2534.17,
      net: 88692.17,
    },
    source: CCL_INDEMNIZACION,
  },
  {
    id: 'liquidacion-sueldo-alto',
    title: 'Despido injustificado con sueldo de $45,000',
    story:
      'Ganas $45,000 al mes con 30 días de aguinaldo y 50 % de prima, entraste el 8 de enero de 2018 y te despiden el 31 de octubre de 2026 con 6 días de vacaciones pendientes. La indemnización de 3 meses usa tu salario integrado; la prima de antigüedad se topa en $630.08 diarios.',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 45000, period: 'mensual' },
      startDate: '2018-01-08',
      endDate: '2026-10-31',
      cause: 'despido_injustificado',
      aguinaldoDays: 30,
      primaPct: 50,
      pendingVacationDays: 6,
    },
    expected: {
      completedYears: 8,
      integratedDaily: 1668.49,
      concepts: {
        aguinaldo: 37479.45,
        vacaciones: 35852.05,
        prima_vacacional: 17926.03,
        indemnizacion_constitucional: 150164.1,
        prima_antiguedad: 66640.02,
      },
      gross: 308061.65,
      isrOrdinary: 25589.19,
      isrSeparation: 21465.8,
      net: 261006.66,
    },
    source: OWN_ARITHMETIC,
  },
  {
    id: 'liquidacion-rescision-frontera',
    title: 'Rescisión por culpa del patrón en la frontera norte',
    story:
      'Trabajas en Tijuana, ganas $600 diarios y dejas el empleo el 9 de octubre de 2026 porque el patrón dejó de pagarte (art. 51). Te corresponde lo mismo que en un despido injustificado con los 20 días por año, y el tope de la prima de antigüedad usa el salario mínimo de la frontera ($881.74).',
    input: {
      ...BASE_SEPARATION,
      salary: { amount: 600, period: 'diario' },
      startDate: '2022-05-02',
      endDate: '2026-10-09',
      cause: 'rescision_trabajador',
      zone: 'zlfn',
    },
    expected: {
      completedYears: 4,
      integratedDaily: 632.88,
      concepts: {
        aguinaldo: 6953.42,
        vacaciones: 5293.15,
        prima_vacacional: 1323.29,
        indemnizacion_constitucional: 56959.2,
        indemnizacion_20_dias: 56213.62,
        prima_antiguedad: 33728.17,
      },
      gross: 160470.85,
      isrOrdinary: 1864.14,
      isrSeparation: 11521.19,
      net: 147085.52,
    },
    source: OWN_ARITHMETIC,
  },
];
