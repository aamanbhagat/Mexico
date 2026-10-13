// Prints the median Lighthouse scores and metrics per URL from .lighthouseci/ (after `lhci autorun`).
import { readdirSync, readFileSync } from 'node:fs';

const runs = readdirSync('.lighthouseci')
  .filter((f) => f.startsWith('lhr-') && f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`.lighthouseci/${f}`, 'utf8')));
const byUrl = new Map();
for (const r of runs) {
  const path = new URL(r.finalDisplayedUrl ?? r.finalUrl).pathname;
  if (!byUrl.has(path)) byUrl.set(path, []);
  byUrl.get(path).push(r);
}
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log('| Page | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT | JS (transfer) |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [path, rs] of [...byUrl.entries()].sort()) {
  const cat = (k) => Math.round(median(rs.map((r) => r.categories[k].score)) * 100);
  const num = (k) => median(rs.map((r) => r.audits[k].numericValue));
  const js = median(rs.map((r) => r.audits['resource-summary'].details.items.find((i) => i.resourceType === 'script')?.transferSize ?? 0));
  console.log(
    `| ${path} | ${cat('performance')} | ${cat('accessibility')} | ${cat('best-practices')} | ${cat('seo')} | ${(num('largest-contentful-paint') / 1000).toFixed(2)} s | ${num('cumulative-layout-shift').toFixed(3)} | ${Math.round(num('total-blocking-time'))} ms | ${(js / 1024).toFixed(1)} KB |`,
  );
}
