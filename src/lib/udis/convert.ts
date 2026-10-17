const UDI_SCALE = 1_000_000n;
const CENT_SCALE = 100n;

function parseScaled(input: string, decimals: number): bigint | null {
  const trimmed = input.trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(trimmed)) return null;
  const normalized = trimmed.replaceAll(',', '');
  const [whole, fraction = ''] = normalized.split('.');
  if (!whole || fraction.length > decimals) return null;
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0') || '0');
}

function halfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

export function udisToCents(amount: string, rate: string): bigint | null {
  const quantity = parseScaled(amount, 6);
  const rateMicro = parseScaled(rate, 6);
  if (quantity === null || rateMicro === null || rateMicro <= 0n) return null;
  return halfUp(quantity * rateMicro * CENT_SCALE, UDI_SCALE * UDI_SCALE);
}

export function pesosToMicroUdis(amount: string, rate: string): bigint | null {
  const cents = parseScaled(amount, 2);
  const rateMicro = parseScaled(rate, 6);
  if (cents === null || rateMicro === null || rateMicro <= 0n) return null;
  return halfUp(cents * UDI_SCALE * UDI_SCALE, CENT_SCALE * rateMicro);
}

export function formatScaled(value: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals);
  const whole = (value / scale).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${whole}.${(value % scale).toString().padStart(decimals, '0')}`;
}

export function formatPesos(cents: bigint): string {
  return `$${formatScaled(cents, 2)}`;
}

export function formatRate(rate: string): string {
  const micro = parseScaled(rate, 6);
  if (micro === null) throw new Error('Invalid UDI rate');
  return formatScaled(micro, 6);
}
