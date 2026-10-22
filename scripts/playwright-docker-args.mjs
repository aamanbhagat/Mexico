// Docker arguments for the pinned Playwright container (scripts/playwright-docker.mjs), kept pure so
// tests can check them without Docker.
import { createHash } from 'node:crypto';

/** Official Playwright image matching the version pinned in package-lock.json. */
export function imageFor(version) {
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

/** `linux/amd64`, `linux/arm64`…; empty means the Docker host's own architecture. */
export function platformArgs(platform) {
  if (!platform) return [];
  if (!/^linux\/[a-z0-9]+(\/v\d+)?$/.test(platform))
    throw new Error(`PLAYWRIGHT_DOCKER_PLATFORM must look like linux/amd64, got "${platform}"`);
  return ['--platform', platform];
}

/**
 * The host's node_modules holds binaries for the host OS (esbuild, rolldown, sharp…). The container
 * gets its own Linux install in a named volume, keyed by lockfile and platform, so the host install
 * is never touched.
 */
export function modulesVolume(lockfileText, platform) {
  const hash = createHash('sha256').update(lockfileText).digest('hex');
  const arch = (platform || 'native').replaceAll('/', '-');
  return { name: `calculadoras-node-modules-${arch}`, hash };
}

const MARKER = '.lockfile-sha256';

/** Shell run (as root) in a throwaway container to fill the volume with a clean `npm ci`. */
export function installScript({ hash, uid, gid }) {
  return [
    'set -e',
    'mkdir -p /tmp/deps',
    'cp /workspace/package.json /workspace/package-lock.json /tmp/deps/',
    'cd /tmp/deps',
    'npm ci --no-audit --no-fund',
    'find /modules -mindepth 1 -delete',
    'cp -a node_modules/. /modules/',
    `echo ${hash} > /modules/${MARKER}`,
    `chown -R ${uid}:${gid} /modules`,
  ].join(' && ');
}

export const MARKER_FILE = MARKER;

/**
 * Whether the container needs its own node_modules: any host that is not Linux (macOS, Windows), or
 * a forced container platform. On a Linux host with the native platform the host install is reused.
 */
export function needsOwnModules(hostPlatform, platform) {
  return hostPlatform !== 'linux' || Boolean(platform);
}

/** Arguments after `docker` for the Playwright test run (`volumeName` omitted = host node_modules). */
export function runArgs({ workspace, image, uid, gid, platform, volumeName, env, playwrightArgs }) {
  const args = [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    ...platformArgs(platform),
    '--user',
    `${uid}:${gid}`,
    '--env',
    'HOME=/tmp',
    '--env',
    'PLAYWRIGHT_BROWSERS_PATH=/ms-playwright',
    '--env',
    'ASTRO_TELEMETRY_DISABLED=1',
    '--mount',
    `type=bind,source=${workspace},target=/workspace`,
    ...(volumeName ? ['--mount', `type=volume,source=${volumeName},target=/workspace/node_modules`] : []),
    '--workdir',
    '/workspace',
  ];
  for (const name of ['CI', 'SITE_URL', 'PLAYWRIGHT_PORT', 'PLAYWRIGHT_OUTPUT_DIR']) {
    if (env[name] !== undefined) args.push('--env', `${name}=${env[name]}`);
  }
  args.push(image, 'npx', 'playwright', 'test', ...playwrightArgs);
  return args;
}
