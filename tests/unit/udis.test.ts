import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatPesos, formatScaled, pesosToMicroUdis, udisToCents } from '../../src/lib/udis/convert';
import { mexicoDay, todayStatus } from '../../src/lib/udis/date';
import { parseRange, validateSeries } from '../../scripts/fetch-udis.mjs';

const archive = JSON.parse(readFileSync('docs/sources/mx-03/series.json', 'utf8')) as {
  rates: { effective_from: string; value: string; source_url: string; verified: boolean }[];
};
const dated = new Map(archive.rates.map(({ effective_from, value }) => [effective_from, value]));

function officialRate(date: string, expected: string): string {
  const row = archive.rates.find((rate) => rate.effective_from === date);
  expect(row?.source_url).toContain('banxico.org.mx');
  expect(row?.verified).toBe(true);
  expect(row?.value).toBe(expected);
  return row!.value;
}

describe('UDI fixed-decimal conversions', () => {
  it('udiToPesos_1995_04_04', () => {
    // Banxico SIE SP68257, 04/04/1995; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('100', officialRate('1995-04-04', '1.000000'))!)).toBe('$100.00');
  });
  it('udiToPesos_2000_01_01', () => {
    // Banxico SIE SP68257, 01/01/2000; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('100', officialRate('2000-01-01', '2.672114'))!)).toBe('$267.21');
  });
  it('udiToPesos_2010_01_01', () => {
    // Banxico SIE SP68257, 01/01/2010; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('1234.567890', officialRate('2010-01-01', '4.340855'))!)).toBe('$5,359.08');
  });
  it('udiToPesos_2025_12_31', () => {
    // Banxico SIE SP68257, 31/12/2025; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('42', officialRate('2025-12-31', '8.665387'))!)).toBe('$363.95');
  });
  it('udiToPesos_2026_09_11', () => {
    // Banxico SIE SP68257, 11/09/2026; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('2500', officialRate('2026-09-11', '8.816612'))!)).toBe('$22,041.53');
  });
  it('udiToPesos_2026_10_17', () => {
    // Banxico SIE SP68257, 17/10/2026; archived raw response in docs/sources/mx-03/raw/.
    expect(formatPesos(udisToCents('123.456789', officialRate('2026-10-17', '8.857145'))!)).toBe('$1,093.47');
  });
  it.each([
    ['usesRateOn10', '2026-09-10', '8.816055'],
    ['usesRateOn11', '2026-09-11', '8.816612'],
    ['usesRateOn25', '2026-09-25', '8.824423'],
    ['usesRateOn26', '2026-09-26', '8.826356'],
  ])('%s', (_name, date, value) => {
    // Banxico SIE SP68257, 10/11/25/26 Sep 2026; archived raw response in docs/sources/mx-03/raw/.
    expect(officialRate(date, value)).toBe(value);
    expect(udisToCents('1', value)).toBe(BigInt(Math.round(Number(value) * 100)));
  });
  it('todayAcrossMexicoMidnight', () => {
    // Banxico SP68257 assigns rates to Mexican calendar dates, not UTC dates.
    expect(mexicoDay(new Date('2026-10-18T05:59:59Z'))).toBe('2026-10-17');
    expect(mexicoDay(new Date('2026-10-18T06:00:00Z'))).toBe('2026-10-18');
    expect(todayStatus({ rates: [...dated], last_date: '2026-10-25' }, new Date('2026-10-18T05:59:59Z')).rate).toBe('8.857145');
  });
  it('showsStaleNoticeAfterLastDate', () => {
    // Banxico SP68257 publishes future windows; never substitute their last value for an absent today.
    const status = todayStatus({ rates: [...dated], last_date: '2026-10-25' }, new Date('2026-10-26T19:00:00Z'));
    expect(status).toMatchObject({ today: '2026-10-26', stale: true, rate: null, lastAvailable: '2026-10-25' });
  });
  it('pesosUdisRoundTrip', () => {
    // Banxico SIE SP68257, 17/10/2026; fixed-point result rounds to cents and six-decimal UDIS.
    const rate = officialRate('2026-10-17', '8.857145');
    const udis = pesosToMicroUdis('15000.00', rate);
    expect(udis).not.toBeNull();
    const cents = udisToCents(formatScaled(udis!, 6), rate);
    expect(cents).toBe(1_500_000n);
    expect(pesosToMicroUdis('invalid', rate)).toBeNull();
  });
  it('rejectsMissingDuplicateOrWrongSeries', () => {
    // Banxico's dated-range response contract: https://www.banxico.org.mx/SieAPIRest/service/v1/doc/consultaDatosSerieRango
    const response = (idSerie: string, datos: { fecha: string; dato: string }[]) => ({ bmx: { series: [{ idSerie, datos }] } });
    expect(() => parseRange(response('wrong', []), '1995-04-04', '1995-04-05')).toThrow(/wrong series/);
    expect(() => parseRange(response('SP68257', [{ fecha: '04/04/1995', dato: 'N/E' }]), '1995-04-04', '1995-04-05')).toThrow(/nonnumeric/);
    expect(() =>
      validateSeries(
        [
          ['1995-04-04', '1.000000'],
          ['1995-04-04', '1.000000'],
        ],
        '1995-04-04',
      ),
    ).toThrow(/duplicating/);
    expect(() => validateSeries([['1995-04-04', '1.000000']], '1995-04-05')).toThrow(/stale/);
  });
});
