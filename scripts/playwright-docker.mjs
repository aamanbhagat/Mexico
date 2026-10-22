import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { MARKER_FILE, imageFor, installScript, modulesVolume, needsOwnModules, platformArgs, runArgs } from './playwright-docker-args.mjs';

const workspace = realpathSync(process.cwd());
const lockfileText = readFileSync(join(workspace, 'package-lock.json'), 'utf8');
const lockfile = JSON.parse(lockfileText);
const version = lockfile.packages?.['node_modules/@playwright/test']?.version;
if (!version || version !== lockfile.packages?.['node_modules/playwright']?.version) {
  throw new Error('package-lock.json must pin matching @playwright/test and playwright versions');
}

// PLAYWRIGHT_DOCKER_PLATFORM=linux/amd64 runs the (amd64) image the visual baselines were made in
// on an Apple Silicon Mac, through Rosetta.
const platform = process.env.PLAYWRIGHT_DOCKER_PLATFORM || '';
const image = imageFor(version);
const useSudo = process.env.PLAYWRIGHT_DOCKER_SUDO === '1';
const docker = (args, options = {}) => spawnSync(useSudo ? 'sudo' : 'docker', useSudo ? ['-n', 'docker', ...args] : args, options);
const uid = process.getuid();
const gid = process.getgid();

let volumeName;
if (needsOwnModules(process.platform, platform)) {
  const volume = modulesVolume(lockfileText, platform);
  volumeName = volume.name;
  const marker = docker(
    [
      'run',
      '--rm',
      ...platformArgs(platform),
      '--mount',
      `type=volume,source=${volume.name},target=/modules`,
      image,
      'cat',
      `/modules/${MARKER_FILE}`,
    ],
    { encoding: 'utf8' },
  );
  if (marker.stdout?.trim() !== volume.hash) {
    console.log(`Installing Linux node_modules in Docker volume ${volume.name} (host node_modules stays untouched)…`);
    const install = docker(
      [
        'run',
        '--rm',
        '--user',
        '0:0',
        ...platformArgs(platform),
        '--env',
        'HOME=/tmp',
        '--mount',
        `type=bind,source=${workspace},target=/workspace,readonly`,
        '--mount',
        `type=volume,source=${volume.name},target=/modules`,
        image,
        'sh',
        '-c',
        installScript({ hash: volume.hash, uid, gid }),
      ],
      { stdio: 'inherit' },
    );
    if (install.status !== 0) {
      console.error('Could not install Linux node_modules for the Playwright container.');
      process.exit(install.status ?? 1);
    }
  }
}

const args = runArgs({ workspace, image, uid, gid, platform, volumeName, env: process.env, playwrightArgs: process.argv.slice(2) });
console.log(`Playwright image: ${image}${platform ? ` (${platform})` : ''}${volumeName ? `, node_modules: volume ${volumeName}` : ''}`);
const child = spawn(useSudo ? 'sudo' : 'docker', useSudo ? ['-n', 'docker', ...args] : args, { stdio: 'inherit' });
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (status) => {
  process.exitCode = status ?? 1;
});
