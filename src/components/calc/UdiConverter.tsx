import { useEffect, useState } from 'preact/hooks';
import { formatDateLong } from '../../lib/ui/format';
import { consultedAt, mexicoDay, todayStatus, type DatedRates } from '../../lib/udis/date';
import { formatPesos, formatRate, formatScaled, pesosToMicroUdis, udisToCents } from '../../lib/udis/convert';

interface UdiDataset extends DatedRates {
  id: string;
  source_url: string;
  source_title: string;
  retrieved_at: string;
  verified: boolean;
  first_date: string;
}

interface Props {
  direction: 'udis-to-pesos' | 'pesos-to-udis';
  buildDay: string;
  buildRate: string;
  buildRetrievedAt: string;
  firstDay: string;
  sourceUrl: string;
  sourceTitle: string;
}

function isDataset(value: unknown): value is UdiDataset {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<UdiDataset>;
  return (
    data.id === 'SP68257' &&
    data.verified === true &&
    typeof data.source_url === 'string' &&
    typeof data.source_title === 'string' &&
    typeof data.retrieved_at === 'string' &&
    typeof data.first_date === 'string' &&
    typeof data.last_date === 'string' &&
    Array.isArray(data.rates) &&
    data.rates.length > 0 &&
    data.rates[0]?.[0] === data.first_date &&
    data.rates.at(-1)?.[0] === data.last_date &&
    data.rates.every((row) => Array.isArray(row) && /^\d{4}-\d{2}-\d{2}$/.test(row[0]) && /^\d+\.\d{6}$/.test(row[1]))
  );
}

export default function UdiConverter({ direction, buildDay, buildRate, buildRetrievedAt, firstDay, sourceUrl, sourceTitle }: Props) {
  const [amount, setAmount] = useState('100');
  const [date, setDate] = useState(buildDay);
  const [balance, setBalance] = useState('');
  const [dataset, setDataset] = useState<UdiDataset | null>(null);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [clockDay, setClockDay] = useState(buildDay);
  const [clockChecked, setClockChecked] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setClockDay(mexicoDay());
      setClockChecked(true);
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    document.addEventListener('visibilitychange', updateClock);
    const controller = new AbortController();
    fetch('/data/mx/udis.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('The dated Banxico archive is unavailable');
        return response.json() as Promise<unknown>;
      })
      .then((body) => {
        if (!isDataset(body)) throw new Error('The dated Banxico archive is invalid');
        setDataset(body);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDownloadFailed(true);
      });
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateClock);
    };
  }, []);

  const rates = dataset?.rates ?? [[buildDay, buildRate]];
  const selectedRate = date >= firstDay && date <= clockDay ? (rates.find(([day]) => day === date)?.[1] ?? null) : null;
  const today = todayStatus({ rates, last_date: dataset?.last_date ?? buildDay }, new Date(`${clockDay}T12:00:00-06:00`));
  const fresh = clockChecked && !today.stale;
  const rateUrl = dataset?.source_url ?? sourceUrl;
  const rateTitle = dataset?.source_title ?? sourceTitle;
  const retrievedAt = dataset?.retrieved_at ?? buildRetrievedAt;
  const reverse = direction === 'pesos-to-udis';
  const converted = selectedRate ? (reverse ? pesosToMicroUdis(amount, selectedRate) : udisToCents(amount, selectedRate)) : null;
  const answer = converted === null ? null : reverse ? `${formatScaled(converted, 6)} UDIS` : `${formatPesos(converted)} MXN`;
  const mortgage = fresh && today.rate && balance ? udisToCents(balance, today.rate) : null;
  const selectedIsToday = fresh && date === clockDay;
  const sourceLine = selectedRate
    ? `Vigente el ${formatDateLong(date)} · Consultado el ${consultedAt(retrievedAt)} (hora de Ciudad de México)`
    : '';

  const resultText = () =>
    `${amount} ${reverse ? 'MXN' : 'UDIS'} = ${answer} al ${formatDateLong(date)}. Tasa ${selectedRate} MXN/UDI. ${rateTitle}.`;
  const copyResult = async () => {
    if (!answer || !selectedRate) return;
    try {
      await navigator.clipboard.writeText(resultText());
      setFeedback('Resultado copiado.');
    } catch {
      setFeedback('No se pudo copiar. Selecciona el resultado y cópialo manualmente.');
    }
  };
  const shareResult = async () => {
    if (!answer || !selectedRate) return;
    if (!navigator.share) {
      setFeedback('Tu navegador no permite compartir. Usa “Copiar resultado”.');
      return;
    }
    try {
      await navigator.share({ text: resultText() });
      setFeedback('Resultado compartido.');
    } catch {
      setFeedback('No se compartió el resultado.');
    }
  };

  return (
    <div class="udi-tool" data-testid="udi-converter">
      {clockChecked && today.stale && (
        <div class="notice notice--warning udi-stale" role="status" data-testid="udi-stale">
          <div>
            <strong>Datos pendientes de actualizar</strong>
            <p>
              El último valor disponible es del {formatDateLong(today.lastAvailable ?? buildDay)}. No podemos calcular el valor vigente hoy.{' '}
              <a href={sourceUrl} rel="noopener" target="_blank">
                Consulta la serie de UDIS en Banxico.
              </a>
            </p>
          </div>
        </div>
      )}

      <div class="udi-tool__primary">
        <div class="udi-tool__entry">
          <label class="udi-tool__label" htmlFor="udi-amount">
            {reverse ? 'Pesos mexicanos' : 'Cantidad de UDIS'}
          </label>
          <input
            id="udi-amount"
            class="udi-tool__input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onInput={(event) => {
              setAmount(event.currentTarget.value);
              setFeedback('');
            }}
            aria-describedby="udi-format"
          />
          <span class="udi-tool__hint" id="udi-format">
            {reverse ? 'Usa punto para centavos; máximo dos decimales.' : 'Usa punto para decimales; máximo seis.'}
          </span>

          <label class="udi-tool__label" htmlFor="udi-date">
            Fecha de la tasa
          </label>
          <input
            id="udi-date"
            class="udi-tool__input udi-tool__date"
            type="date"
            min={firstDay}
            max={clockDay}
            value={date}
            onInput={(event) => {
              setDate(event.currentTarget.value);
              setFeedback('');
            }}
          />
        </div>

        <section class="udi-result" aria-label="Equivalencia de UDIS y pesos" data-testid="udi-result">
          <p class="udi-result__rate-label">{selectedIsToday ? 'Valor vigente hoy' : `Valor del ${formatDateLong(date || buildDay)}`}</p>
          {selectedRate ? (
            <>
              <p class="udi-result__rate">1 UDI = {formatRate(selectedRate)} MXN</p>
              <p class="udi-result__source">
                <a href={rateUrl} rel="noopener" target="_blank">
                  {rateTitle}
                </a>{' '}
                · {sourceLine}
              </p>
              <div class="udi-result__equation">
                <span>{reverse ? 'UDIS equivalentes' : 'Pesos equivalentes'}</span>
                <strong class="udi-result__number" aria-live="polite">
                  {answer ?? '—'}
                </strong>
              </div>
              {answer ? (
                <p class="udi-result__source">
                  Calculado con la tasa del {formatDateLong(date)} · Consultado el {consultedAt(retrievedAt)} ·{' '}
                  <a href={rateUrl} rel="noopener" target="_blank">
                    Banxico SIE
                  </a>
                </p>
              ) : (
                <p class="udi-result__error" role="status">
                  Escribe una cantidad no negativa con {reverse ? 'hasta dos' : 'hasta seis'} decimales; usa punto decimal.
                </p>
              )}
            </>
          ) : (
            <p class="udi-result__error" role="status">
              No hay tasa de Banxico para esta fecha. Elige un día con valor oficial, desde el {formatDateLong(firstDay)} hasta hoy.
            </p>
          )}
        </section>
      </div>

      <div class="udi-tool__actions">
        <button type="button" class="btn btn--quiet" onClick={copyResult} disabled={!answer}>
          Copiar resultado
        </button>
        <button type="button" class="btn btn--quiet" onClick={shareResult} disabled={!answer}>
          Compartir resultado
        </button>
        <span role="status" aria-live="polite" class="udi-tool__feedback">
          {feedback}
        </span>
      </div>

      {downloadFailed && (
        <p class="notice notice--warning" role="status">
          No se pudo cargar el historial completo. Vuelve a intentar más tarde; el valor mostrado conserva su fecha de vigencia.
        </p>
      )}

      {fresh && today.rate && (
        <section class="udi-mortgage" aria-labelledby="udi-mortgage-title" data-testid="udi-mortgage">
          <h2 id="udi-mortgage-title">Saldo hipotecario denominado en UDIS</h2>
          <p>Multiplica tu saldo en UDIS por la tasa fechada de hoy; no incluye intereses, seguros ni comisiones.</p>
          <label class="udi-tool__label" htmlFor="udi-balance">
            Saldo en UDIS
          </label>
          <input
            id="udi-balance"
            class="udi-tool__input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Ej. 150000"
            value={balance}
            onInput={(event) => setBalance(event.currentTarget.value)}
          />
          {balance && mortgage === null && <p class="udi-result__error">Escribe un saldo no negativo con máximo seis decimales.</p>}
          {mortgage !== null && (
            <p class="udi-mortgage__answer" aria-live="polite">
              {formatPesos(mortgage)} MXN · Tasa {formatRate(today.rate)} del {formatDateLong(clockDay)} · Consultado el{' '}
              {consultedAt(retrievedAt)} ·{' '}
              <a href={rateUrl} rel="noopener" target="_blank">
                Banxico SIE
              </a>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
