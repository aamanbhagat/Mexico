// Post-build guard rails. Inspect the actual public files produced by the Vercel adapter.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = '.vercel/output/static';
const problems = [];

// 1. Unpublished locales must not produce pages (their folders are reserved, not live).
//    The list is read from the locale registry so publishing a locale is a one-line change.
const registry = readFileSync('src/i18n/locales.ts', 'utf8');
const entries = [...registry.matchAll(/code: '([a-z-]+)',[\s\S]*?published: (true|false)/g)];
if (entries.length !== (registry.match(/code: '/g) ?? []).length) problems.push('Could not read every locale in src/i18n/locales.ts');
const unpublished = entries.filter((m) => m[2] === 'false').map((m) => m[1]);
for (const code of unpublished) {
  if (existsSync(join(DIST, code))) problems.push(`Unpublished locale folder found in public output: /${code}/`);
}

// 2. The design lab only exists in LAB builds.
if (process.env.LAB !== '1' && existsSync(join(DIST, 'lab'))) problems.push('Design lab pages found in public output.');

// 3. No source maps in production output.
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const file of walk(DIST)) if (file.endsWith('.map')) problems.push(`Source map shipped: ${file}`);

if (problems.length) {
  console.error(`postbuild: ${problems.length} problem(s)\n - ${problems.join('\n - ')}`);
  process.exit(1);
}
console.log('postbuild: OK');
