/**
 * Conversions between area units and between prices per area. Pure functions on exact
 * rationals; rounding happens only when a figure is formatted for display.
 */
import { div, isZero, mul, toNumber, type Rational } from './rational';

export interface HasArea {
  /** Exact area of one unit in m². */
  area: Rational;
}

/** amount × (m² per `from`) ÷ (m² per `to`). */
export function convertArea(amount: Rational, from: HasArea, to: HasArea): Rational {
  return div(mul(amount, from.area), to.area);
}

/**
 * A price per `from` unit expressed per `to` unit: R$ 72.600 per alqueire paulista is
 * R$ 30.000 per hectare because one alqueire holds 2,42 ha.
 * price_per_to = price_per_from × (m² per `to`) ÷ (m² per `from`).
 */
export function convertPrice(pricePerFrom: Rational, from: HasArea, to: HasArea): Rational {
  return div(mul(pricePerFrom, to.area), from.area);
}

/** Side in metres of the square with the given area (float: only used for a visual hint). */
export function squareSide(areaM2: Rational): number {
  if (isZero(areaM2)) return 0;
  return Math.sqrt(toNumber(areaM2));
}

/**
 * Decimals worth showing for a value: 4 for anything ≥ 1, and enough for four significant
 * digits below 1 (1 m² is 0,00004132 alqueire paulista, not "0").
 */
export function autoDecimals(value: Rational, atLeast = 4, cap = 12): number {
  const x = Math.abs(toNumber(value));
  if (x === 0 || x >= 1) return atLeast;
  const leadingZeros = Math.floor(-Math.log10(x));
  return Math.min(cap, Math.max(atLeast, leadingZeros + 4));
}
