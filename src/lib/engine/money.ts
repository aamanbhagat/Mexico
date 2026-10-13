/** Rounds to cents, half away from zero, immune to binary artefacts like 1.005. */
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 100 + 1e-7)) / 100;
}

export function sum(values: readonly number[]): number {
  return round2(values.reduce((acc, v) => acc + v, 0));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
