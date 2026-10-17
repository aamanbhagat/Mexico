export function mexicoDay(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function consultedAt(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export interface DatedRates {
  rates: [string, string][];
  last_date: string;
}

export function todayStatus(data: DatedRates, now = new Date()) {
  const today = mexicoDay(now);
  const rate = data.rates.find(([date]) => date === today)?.[1] ?? null;
  const lastAvailable = data.rates.filter(([date]) => date <= today).at(-1)?.[0] ?? null;
  return { today, rate, lastAvailable, stale: today > data.last_date || rate === null };
}
