import { mkdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIRST_DAY = '1995-04-04';
export const SERIES_ID = 'SP68257';
export const SOURCE_URL =
  'https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CP150&locale=es&sector=8';
export const SOURCE_TITLE = 'Banco de México, SIE: Valor de UDIS (SP68257)';
const ENDPOINT = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${SERIES_ID}/datos`;

export function mexicoDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const field = (type) => parts.find((part) => part.type === type)?.value;
  return `${field('year')}-${field('month')}-${field('day')}`;
}

export function plusDays(iso, count) {
  const day = new Date(`${iso}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + count);
  return day.toISOString().slice(0, 10);
}

function validISO(iso) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(iso) &&
    !Number.isNaN(Date.parse(`${iso}T12:00:00Z`)) &&
    new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) === iso
  );
}

export function parseRange(body, start, end) {
  const series = body?.bmx?.series;
  if (!Array.isArray(series) || series.length !== 1 || series[0]?.idSerie !== SERIES_ID || !Array.isArray(series[0]?.datos)) {
    throw new Error('Banxico returned the wrong series or no dated records');
  }
  const records = [];
  for (const row of series[0].datos) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(row?.fecha);
    if (!match) throw new Error('Banxico returned an invalid date');
    const iso = `${match[3]}-${match[2]}-${match[1]}`;
    if (!validISO(iso) || iso < start || iso > end) throw new Error(`Banxico returned an out-of-range date: ${iso}`);
    if (typeof row?.dato !== 'string' || !/^(?:0|[1-9]\d*)\.\d{6}$/.test(row.dato) || row.dato === '0.000000') {
      throw new Error(`Banxico returned a nonnumeric or non-six-decimal rate for ${iso}`);
    }
    records.push([iso, row.dato]);
  }
  return records;
}

export function validateSeries(records, today) {
  if (!records.length || records[0]?.[0] !== FIRST_DAY) throw new Error('Banxico is missing the first UDI day');
  let previous = FIRST_DAY;
  for (let index = 1; index < records.length; index++) {
    const date = records[index]?.[0];
    if (date !== plusDays(previous, 1)) throw new Error(`Banxico is missing or duplicating a daily UDI near ${previous}`);
    previous = date;
  }
  if (previous < today) throw new Error(`Banxico has no UDI dated today (${today}); refusing a stale build`);
}

async function fetchRange(start, end, token) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetch(`${ENDPOINT}/${start}/${end}`, {
        headers: { 'Bmx-Token': token },
        signal: AbortSignal.timeout(25_000),
      });
    } catch {
      if (attempt === 2) throw new Error(`Banxico fetch failed for ${start}–${end}`);
    }
    if (response?.ok) {
      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error(`Banxico returned invalid JSON for ${start}–${end}`);
      }
      return { text, records: parseRange(body, start, end) };
    }
    if (response && response.status !== 429 && response.status < 500) {
      throw new Error(`Banxico returned HTTP ${response.status} for ${start}–${end}`);
    }
    if (attempt === 2) throw new Error(`Banxico did not respond for ${start}–${end} after three attempts`);
    await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
  }
  throw new Error('Banxico retry limit exceeded');
}

async function writeAtomic(path, contents) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, contents, { flag: 'wx' });
  await rename(temporary, path);
}

export async function runFetch(now = new Date()) {
  const token = process.env.BANXICO_TOKEN;
  if (!token) throw new Error('BANXICO_TOKEN is required for the UDI build');
  const today = mexicoDay(now);
  const through = plusDays(today, 20);
  const responses = [];
  const records = [];
  for (let year = Number(FIRST_DAY.slice(0, 4)); year <= Number(through.slice(0, 4)); year++) {
    const start = year === 1995 ? FIRST_DAY : `${year}-01-01`;
    const end = `${year}-12-31` < through ? `${year}-12-31` : through;
    const response = await fetchRange(start, end, token);
    records.push(...response.records);
    responses.push({ year, text: response.text });
  }
  validateSeries(records, today);

  const retrievedAt = now.toISOString();
  const retrievedOn = today;
  const snapshot = retrievedAt.replaceAll(':', '-').replaceAll('.', '-');
  const rawDir = join('docs', 'sources', 'mx-03', 'raw', snapshot);
  const publicDir = join('public', 'data', 'mx');
  await mkdir(rawDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  await Promise.all(responses.map(({ year, text }) => writeFile(join(rawDir, `${SERIES_ID}-${year}.json`), text)));

  const rates = records.map(([date, value]) => ({
    value,
    effective_from: date,
    source_url: SOURCE_URL,
    source_title: SOURCE_TITLE,
    retrieved_on: retrievedOn,
    retrieved_at: retrievedAt,
    verified: true,
    notes: 'Valor diario exacto recibido y validado de la serie oficial SP68257; seis decimales, sin interpolación.',
  }));
  const canonical = { id: SERIES_ID, retrieved_at: retrievedAt, rates };
  const compact = {
    id: SERIES_ID,
    source_url: SOURCE_URL,
    source_title: SOURCE_TITLE,
    retrieved_on: retrievedOn,
    retrieved_at: retrievedAt,
    verified: true,
    first_date: records[0][0],
    last_date: records.at(-1)[0],
    rates: records,
  };
  await writeAtomic(join('src', 'data', 'parameters', 'mx', 'udis.json'), `${JSON.stringify(canonical)}\n`);
  await writeAtomic(join(publicDir, 'udis.json'), `${JSON.stringify(compact)}\n`);
  console.log(`Banxico ${SERIES_ID}: ${records.length} dated values, ${records[0][0]}–${records.at(-1)[0]}; retrieved ${retrievedAt}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1]}`)) {
  runFetch().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Banxico UDI fetch failed');
    process.exitCode = 1;
  });
}
