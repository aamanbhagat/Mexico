// Lists every parameter version with its verification state (feeds docs/LAUNCH_CHECKLIST.md).
//   npm run params:report            → Markdown table of all versions
//   npm run params:report -- --unverified   → only verified=false
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const onlyUnverified = process.argv.includes('--unverified');
const DIR = 'src/data/parameters';
console.log('| Parameter | Effective | Value | Verified | Source |');
console.log('|---|---|---|---|---|');
for (const country of readdirSync(DIR)) {
  for (const file of readdirSync(join(DIR, country)).sort()) {
    const p = JSON.parse(readFileSync(join(DIR, country, file), 'utf8'));
    for (const v of p.versions) {
      // Land-unit catalogs: one row per unit, each with its own source and verification state.
      if (Array.isArray(v.value?.units)) {
        for (const u of v.value.units) {
          if (onlyUnverified && u.verified) continue;
          const dims = u.dims ? ` (${u.dims.join(' × ')} braças)` : '';
          console.log(
            `| \`${p.id}:${u.id}\` | customary | ${u.m2} m²${dims} | ${u.verified ? 'yes' : '**no**'} | [${u.source_title.replace(/\|/g, '\\|')}](${u.source_url}) |`,
          );
        }
        continue;
      }
      if (onlyUnverified && v.verified) continue;
      const value = Array.isArray(v.value)
        ? `${v.value.length} rows`
        : typeof v.value === 'object'
          ? JSON.stringify(v.value)
          : String(v.value);
      const range = `${v.effective_from} → ${v.effective_to ?? 'open'}`;
      console.log(
        `| \`${p.id}\` | ${range} | ${value.replace(/\|/g, '\\|')} | ${v.verified ? 'yes' : '**no**'} | [${v.source_title}](${v.source_url}) |`,
      );
    }
  }
}
