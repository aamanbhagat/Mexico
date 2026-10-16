import { ParamNotAvailableError, type ParamFile, type ParamVersion } from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Throws if a parameter file breaks the registry contract (see AGENTS.md). */
export function validateParamFile(file: unknown, label = 'parameter file'): asserts file is ParamFile {
  const fail = (msg: string): never => {
    throw new Error(`${label}: ${msg}`);
  };
  if (typeof file !== 'object' || file === null) fail('not an object');
  const f = file as Record<string, unknown>;
  for (const key of ['id', 'name', 'unit', 'description'] as const) {
    if (typeof f[key] !== 'string' || (f[key] as string).length === 0) fail(`missing "${key}"`);
  }
  if (!Array.isArray(f['versions']) || f['versions'].length === 0) fail('needs at least one version');
  const versions = f['versions'] as Record<string, unknown>[];
  let previous = '';
  versions.forEach((v, i) => {
    const at = `version[${i}]`;
    if (!('value' in v) || v['value'] === null || v['value'] === undefined) fail(`${at} missing value`);
    for (const key of ['effective_from', 'retrieved_on'] as const) {
      if (typeof v[key] !== 'string' || !ISO_DATE.test(v[key] as string) || Number.isNaN(Date.parse(v[key] as string))) {
        fail(`${at} "${key}" must be an ISO date`);
      }
    }
    if (v['effective_to'] !== undefined) {
      if (typeof v['effective_to'] !== 'string' || !ISO_DATE.test(v['effective_to'])) fail(`${at} "effective_to" must be an ISO date`);
      if ((v['effective_to'] as string) < (v['effective_from'] as string)) fail(`${at} ends before it starts`);
    }
    if (typeof v['source_url'] !== 'string' || !/^https:\/\//.test(v['source_url'])) fail(`${at} "source_url" must be https`);
    if (typeof v['source_title'] !== 'string' || v['source_title'].length < 5) fail(`${at} missing "source_title"`);
    if (typeof v['verified'] !== 'boolean') fail(`${at} "verified" must be true/false`);
    if (typeof v['notes'] !== 'string') fail(`${at} "notes" must be a string (may be empty)`);
    const from = v['effective_from'] as string;
    if (from <= previous) fail(`${at} effective_from must be strictly ascending`);
    previous = from;
  });
}

/** Version in force on `date` (ISO). Refuses dates outside the known validity window. */
export function versionOn<T>(file: ParamFile<T>, date: string): ParamVersion<T> {
  let match: ParamVersion<T> | undefined;
  for (const v of file.versions) {
    if (v.effective_from <= date) match = v;
    else break;
  }
  if (!match) throw new ParamNotAvailableError(file.id, date, 'before-first-version');
  if (match.effective_to && date > match.effective_to) {
    throw new ParamNotAvailableError(file.id, date, 'after-known-validity');
  }
  return match;
}

/** Inclusive date range covered by a parameter's versions (end = null if open-ended). */
export function coverage(file: ParamFile): { from: string; to: string | null } {
  const first = file.versions[0];
  const last = file.versions[file.versions.length - 1];
  if (!first || !last) throw new Error(`${file.id} has no versions`);
  return { from: first.effective_from, to: last.effective_to ?? null };
}
