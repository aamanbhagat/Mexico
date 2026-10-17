import schedule from '../../../docs/sources/mx-03/publication.json';
import type { UdiRecord } from '../../lib/udis/series';
import { consultedAt } from '../../lib/udis/date';
import { formatDateLong } from '../../lib/ui/format';
import type { FaqItem } from '../../lib/seo/jsonld';

const { first_period: firstPeriod, second_period: secondPeriod } = schedule.value;
export const udiPublicationSummary = `El procedimiento de Banxico fija que los valores para los días ${firstPeriod.from_day} al ${firstPeriod.through_day} se publiquen a más tardar el día ${firstPeriod.published_by_day}, y los del ${secondPeriod.from_day} al ${secondPeriod.through_next_month_day} siguiente, a más tardar el día ${secondPeriod.published_by_day}.`;

export function udiSources(record: UdiRecord) {
  return {
    sourceItems: [
      {
        title: record.source_title,
        url: record.source_url,
        meta: `SP68257 · Vigente el ${formatDateLong(record.effective_from)} · Consultado el ${consultedAt(record.retrieved_at)} (hora de Ciudad de México)`,
        verified: record.verified,
      },
    ],
    extraSources: [
      {
        title: schedule.source_title,
        url: schedule.source_url,
        note: `Regla oficial de publicación, días ${firstPeriod.published_by_day} y ${secondPeriod.published_by_day}.`,
      },
      {
        title: 'Banco de México: consulta de serie por rango de fechas',
        url: 'https://www.banxico.org.mx/SieAPIRest/service/v1/doc/consultaDatosSerieRango',
        note: 'Documentación del servicio oficial utilizado para consultar los valores diarios.',
      },
      {
        title: 'Banco de México: condiciones de reproducción',
        url: 'https://www.banxico.org.mx/salvedad/salvedad.html',
        note: 'Atribución y dirección de origen de los datos publicados.',
      },
    ],
  };
}

export function udiFaq(record: UdiRecord): FaqItem[] {
  return [
    {
      q: '¿Cuánto vale una UDI hoy en pesos?',
      a: `El registro de Banxico para el ${formatDateLong(record.effective_from)} es de ${record.value} pesos por UDI. Este dato no se considera vigente hoy si la fecha en Ciudad de México ya cambió; comprueba el indicador del convertidor.`,
    },
    {
      q: '¿Cómo convierto UDIS a pesos mexicanos?',
      a: 'Multiplica las UDIS por la tasa oficial de la fecha elegida. Redondeamos el total a centavos con la regla de mitad hacia arriba; mantenemos seis decimales de precisión en la tasa.',
    },
    {
      q: '¿Cómo calculo cuántas UDIS son mis pesos?',
      a: 'Divide los pesos entre el valor de una UDI fechado por Banxico. Mostramos seis decimales de UDIS; una conversión de ida y vuelta puede diferir hasta un centavo por el redondeo.',
    },
    {
      q: '¿Cuándo publica Banxico los valores de las UDIS?',
      a: `${udiPublicationSummary} Que una tasa futura ya esté publicada no la hace aplicable hoy.`,
    },
    {
      q: '¿Por qué no aparece el valor de hoy?',
      a: 'Si el archivo no tiene una tasa con la fecha exacta de hoy en Ciudad de México, mostramos «Datos pendientes de actualizar». No usamos la tasa anterior ni una fecha posterior como si fuera la de hoy; las fechas históricas siguen disponibles.',
    },
    {
      q: '¿Es lo mismo la UDI que la UMA?',
      a: 'No. Las UDIS se usan, entre otros casos, para denominar saldos de créditos y tienen valores diarios en Banxico. La UMA es una unidad de referencia publicada por el INEGI con otros valores y periodos de vigencia. No las intercambies.',
    },
  ];
}
