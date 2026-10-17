// `npm run check`: the quality gate from AGENTS.md. Runs every step, even after a failure,
// then prints one summary table and exits non-zero if anything failed.
//   types → lint + format → unit/golden → build → JS budget → e2e + a11y + visual → Lighthouse
import { execFileSync, spawn } from 'node:child_process';
import { closeSync, mkdirSync, openSync, writeSync } from 'node:fs';
import { join } from 'node:path';

const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };

const steps = [
  { name: 'Types (astro check)', cmd: 'npx', args: ['astro', 'check'] },
  { name: 'Lint (ESLint)', cmd: 'npx', args: ['eslint', '.'] },
  { name: 'Format (Prettier)', cmd: 'npx', args: ['prettier', '--check', '.'] },
  { name: 'Unit + golden (Vitest)', cmd: 'npx', args: ['vitest', 'run'] },
  { name: 'Build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'JS budget (≤ 70 KB gzip/page)', cmd: 'node', args: ['scripts/js-budget.mjs'] },
  { name: 'E2E + a11y + visual (Playwright)', cmd: 'npm', args: ['run', 'test:e2e:docker'] },
  { name: 'Lighthouse CI (budgets)', cmd: 'npx', args: ['lhci', 'autorun'] },
];

const only = process.argv.slice(2);
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() || 'detached';
const sha = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], { encoding: 'utf8' }).trim();
const reportPath = join('docs', 'check-reports', `${branch.replace(/[^A-Za-z0-9._-]/g, '-')}-${sha}.log`);
let reportFile;
if (!only.length) {
  mkdirSync(join('docs', 'check-reports'), { recursive: true });
  reportFile = openSync(reportPath, 'w');
}

function output(chunk, error = false) {
  if (reportFile !== undefined) writeSync(reportFile, chunk);
  (error ? process.stderr : process.stdout).write(chunk);
}

function runStep(step) {
  return new Promise((resolve) => {
    let launchFailed = false;
    const child = spawn(step.cmd, step.args, { stdio: ['inherit', 'pipe', 'pipe'], env, shell: process.platform === 'win32' });
    child.stdout.on('data', (chunk) => output(chunk));
    child.stderr.on('data', (chunk) => output(chunk, true));
    child.on('error', (error) => {
      launchFailed = true;
      output(`${error.stack ?? error}\n`, true);
    });
    child.on('close', (status) => resolve(!launchFailed && status === 0));
  });
}

const results = [];
for (const step of steps) {
  if (only.length && !only.some((o) => step.name.toLowerCase().includes(o.toLowerCase()))) continue;
  const started = Date.now();
  output(`\n▶ ${step.name}\n`);
  const ok = await runStep(step);
  results.push({ name: step.name, ok, seconds: ((Date.now() - started) / 1000).toFixed(1) });
}

output(`\n──────── npm run check ────────\nCommit: ${sha}\nDate: ${new Date().toISOString()}\nNode: ${process.version}\n`);
for (const r of results) output(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(36)} ${r.seconds}s\n`);
const failed = results.filter((r) => !r.ok);
if (reportFile !== undefined) output(`Log: ${reportPath}\n`);
output(failed.length ? `\n${failed.length} step(s) failed.\n` : '\nAll checks passed.\n');
if (reportFile !== undefined) closeSync(reportFile);
process.exitCode = failed.length ? 1 : 0;
