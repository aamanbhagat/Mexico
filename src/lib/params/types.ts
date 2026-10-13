/**
 * Parameter registry types. Every legal value (rate, threshold, index) lives in
 * `src/data/parameters/<country>/*.json` with dated, sourced versions.
 */
export interface ParamVersion<T = unknown> {
  value: T;
  /** ISO date (YYYY-MM-DD) from which this value applies, inclusive. */
  effective_from: string;
  /**
   * ISO date until which the value is legally known to apply, inclusive.
   * Omitted when the value stays in force until replaced (e.g. ISR tariffs).
   * Used to refuse silent use of stale values (e.g. 2026 minimum wage in 2027).
   */
  effective_to?: string;
  source_url: string;
  source_title: string;
  /** ISO date when the source was consulted. */
  retrieved_on: string;
  /** True only after a person checked the value against the primary official source. */
  verified: boolean;
  notes: string;
}

export interface ParamFile<T = unknown> {
  id: string;
  name: string;
  unit: string;
  description: string;
  /** Sorted ascending by effective_from. */
  versions: ParamVersion<T>[];
}

export class ParamNotAvailableError extends Error {
  constructor(
    readonly paramId: string,
    readonly date: string,
    readonly reason: 'before-first-version' | 'after-known-validity' | 'unknown-param',
  ) {
    super(`Parameter "${paramId}" has no value in force on ${date} (${reason}).`);
    this.name = 'ParamNotAvailableError';
  }
}
