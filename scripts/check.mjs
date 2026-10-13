// `npm run check`: the quality gate from CLAUDE.md. Runs every step, even after a failure,
// then prints one summary table and exits non-zero if anything failed.
//   types → lint + format → unit/golden → build → JS budget → e2e + a11y + visual → Lighthouse
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const chromium = process.env.CHROME_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...(chromium ? { CHROME_PATH: chromium } : {}) };

const steps = [
  { name: 'Types (astro check)', cmd: 'npx', args: ['astro', 'check'] },
  { name: 'Lint (ESLint)', cmd: 'npx', args: ['eslint', '.'] },
  { name: 'Format (Prettier)', cmd: 'npx', args: ['prettier', '--check', '.'] },
  { name: 'Unit + golden (Vitest)', cmd: 'npx', args: ['vitest', 'run'] },
  { name: 'Build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'JS budget (≤ 70 KB gzip/page)', cmd: 'node', args: ['scripts/js-budget.mjs'] },
  { name: 'E2E + a11y + visual (Playwright)', cmd: 'npx', args: ['playwright', 'test'] },
  { name: 'Lighthouse CI (budgets)', cmd: 'npx', args: ['lhci', 'autorun'] },
];

const only = process.argv.slice(2);
const results = [];
for (const step of steps) {
  if (only.length && !only.some((o) => step.name.toLowerCase().includes(o.toLowerCase()))) continue;
  const started = Date.now();
  console.log(`\n▶ ${step.name}`);
  const r = spawnSync(step.cmd, step.args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  results.push({ name: step.name, ok: r.status === 0, seconds: ((Date.now() - started) / 1000).toFixed(1) });
}

console.log('\n──────── npm run check ────────');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(36)} ${r.seconds}s`);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n${failed.length} step(s) failed.` : '\nAll checks passed.');
process.exit(failed.length ? 1 : 0);
