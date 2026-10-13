// JS budget (CLAUDE.md §3): gzip size of every script a page loads before interaction —
// entry modules, island components/renderers and their static imports. Dynamic import()
// chunks (e.g. the PDF writer, loaded on click) are reported separately and not counted.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname, resolve } from 'node:path';

const DIST = resolve('dist');
const BUDGET = 70 * 1024;

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const gz = new Map();
const sizeOf = (file) => {
  if (!gz.has(file)) gz.set(file, gzipSync(readFileSync(file), { level: 9 }).length);
  return gz.get(file);
};

function staticGraph(entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  // static imports: import x from"./a.js" / import"./b.js" / export … from"./c.js"
  for (const m of code.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[^'"`;()]*?from\s*)?["'`]([^"'`]+\.js)["'`]/g)) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('/')) {
      const file = spec.startsWith('/') ? join(DIST, spec) : resolve(dirname(entry), spec);
      staticGraph(file, seen);
    }
  }
  return seen;
}

function lazyChunks(files) {
  const lazy = new Set();
  for (const f of files) {
    const code = readFileSync(f, 'utf8');
    for (const m of code.matchAll(/import\(\s*["'`]([^"'`]+\.js)["'`]\s*\)/g)) lazy.add(resolve(dirname(f), m[1]));
  }
  return lazy;
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
let failed = false;
const rows = [];
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const entries = new Set();
  for (const m of html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)) entries.add(join(DIST, m[1]));
  for (const m of html.matchAll(/(?:component-url|renderer-url)="([^"]+)"/g)) entries.add(join(DIST, m[1]));
  for (const m of html.matchAll(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)) {
    for (const i of m[1].matchAll(/["'](\/_astro\/[^"']+\.js)["']/g)) entries.add(join(DIST, i[1]));
  }
  const graph = new Set();
  for (const e of entries) staticGraph(e, graph);
  const inlineBytes = [...html.matchAll(/<script(?![^>]*src=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => gzipSync(Buffer.from(m[1])).length)
    .reduce((a, b) => a + b, 0);
  const total = [...graph].reduce((a, f) => a + sizeOf(f), 0) + inlineBytes;
  const lazy = [...lazyChunks(graph)].filter((f) => !graph.has(f));
  const lazyTotal = lazy.reduce((a, f) => a + sizeOf(f), 0);
  const rel = page.replace(DIST, '').replace(/index\.html$/, '');
  if (total > BUDGET) failed = true;
  rows.push({ page: rel || '/', kb: (total / 1024).toFixed(1), lazyKb: (lazyTotal / 1024).toFixed(1), ok: total <= BUDGET });
}
rows.sort((a, b) => a.page.localeCompare(b.page));
console.log('JS shipped per page (gzip, KB) — budget 70.0');
for (const r of rows) console.log(`${r.ok ? '✓' : '✗'} ${r.page.padEnd(44)} ${r.kb.padStart(6)}   (+${r.lazyKb} on demand)`);
if (failed) {
  console.error('JS budget exceeded.');
  process.exit(1);
}
