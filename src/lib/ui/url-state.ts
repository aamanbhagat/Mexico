/**
 * Shareable URL state. Inputs live in the query string (?s=15000&p=m…), so a link
 * reproduces the same calculation. Values are only read and written in the browser:
 * nothing is sent anywhere (AGENTS.md §5), the URL is just what people choose to share.
 */
export type Codec<T> = {
  [K in keyof T]: {
    key: string;
    parse: (raw: string) => T[K] | undefined;
    serialize: (value: T[K]) => string | undefined;
  };
};

export function readState<T extends object>(codec: Codec<T>, defaults: T, search: string): T {
  const params = new URLSearchParams(search);
  const out = { ...defaults };
  for (const field of Object.keys(codec) as (keyof T)[]) {
    const spec = codec[field];
    const raw = params.get(spec.key);
    if (raw === null) continue;
    const value = spec.parse(raw);
    if (value !== undefined) out[field] = value;
  }
  return out;
}

/**
 * Query string for `state`, omitting defaults. With `current` (the page's search), parameters the
 * codec does not own — utm_source, a second tool's keys — are kept as they were.
 */
export function buildSearch<T extends object>(codec: Codec<T>, state: T, defaults: T, current = ''): string {
  const params = new URLSearchParams(current);
  for (const field of Object.keys(codec) as (keyof T)[]) params.delete(codec[field].key);
  for (const field of Object.keys(codec) as (keyof T)[]) {
    const spec = codec[field];
    if (Object.is(state[field], defaults[field])) continue;
    const raw = spec.serialize(state[field]);
    if (raw !== undefined && raw !== '') params.set(spec.key, raw);
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

let pending: ReturnType<typeof setTimeout> | undefined;

/** Debounced history.replaceState so typing does not flood the history API. */
export function writeState(search: string): void {
  if (typeof window === 'undefined') return;
  clearTimeout(pending);
  pending = setTimeout(() => {
    const url = `${window.location.pathname}${search}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, 250);
}

/* Small codecs ------------------------------------------------------------------------------- */

export const num = (min = 0, max = 1e9) => ({
  parse: (raw: string) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
  },
  serialize: (v: number | null) => (v === null || Number.isNaN(v) ? undefined : String(v)),
});

export const nullableNum = (min = 0, max = 1e9) => ({
  parse: (raw: string) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
  },
  serialize: (v: number | null) => (v === null ? undefined : String(v)),
});

export const isoDate = {
  parse: (raw: string) => (/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined),
  serialize: (v: string) => v,
};

export function oneOf<T extends string>(values: readonly T[]) {
  return {
    parse: (raw: string) => (values.includes(raw as T) ? (raw as T) : undefined),
    serialize: (v: T) => v,
  };
}

export const bool = {
  parse: (raw: string) => (raw === '1' ? true : raw === '0' ? false : undefined),
  serialize: (v: boolean) => (v ? '1' : '0'),
};
