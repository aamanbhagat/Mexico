import { spawn } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';

const workspace = realpathSync(process.cwd());
const lockfile = JSON.parse(readFileSync(join(workspace, 'package-lock.json'), 'utf8'));
const version = lockfile.packages?.['node_modules/@playwright/test']?.version;
if (!version || version !== lockfile.packages?.['node_modules/playwright']?.version) {
  throw new Error('package-lock.json must pin matching @playwright/test and playwright versions');
}

const args = [
  'run',
  '--rm',
  '--init',
  '--ipc=host',
  '--user',
  `${process.getuid()}:${process.getgid()}`,
  '--env',
  'HOME=/tmp',
  '--env',
  'PLAYWRIGHT_BROWSERS_PATH=/ms-playwright',
  '--env',
  'ASTRO_TELEMETRY_DISABLED=1',
  '--mount',
  `type=bind,source=${workspace},target=/workspace`,
  '--workdir',
  '/workspace',
];

for (const name of ['CI', 'SITE_URL', 'PLAYWRIGHT_PORT', 'PLAYWRIGHT_OUTPUT_DIR']) {
  if (process.env[name] !== undefined) args.push('--env', `${name}=${process.env[name]}`);
}

const image = `mcr.microsoft.com/playwright:v${version}-noble`;
args.push(image, 'npx', 'playwright', 'test', ...process.argv.slice(2));
console.log(`Playwright image: ${image}`);
const useSudo = process.env.PLAYWRIGHT_DOCKER_SUDO === '1';
const child = spawn(useSudo ? 'sudo' : 'docker', useSudo ? ['-n', 'docker', ...args] : args, { stdio: 'inherit' });
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (status) => {
  process.exitCode = status ?? 1;
});
