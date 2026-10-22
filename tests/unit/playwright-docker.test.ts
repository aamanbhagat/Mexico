import { describe, expect, it } from 'vitest';
import { imageFor, installScript, modulesVolume, needsOwnModules, platformArgs, runArgs } from '../../scripts/playwright-docker-args.mjs';

const base = {
  workspace: '/work',
  image: imageFor('1.64.0'),
  uid: 501,
  gid: 20,
  env: {},
  playwrightArgs: ['visual.spec.ts'],
};

describe('Playwright Docker runner arguments', () => {
  it('adds --platform only when asked, and rejects anything that is not a linux platform', () => {
    expect(platformArgs('')).toEqual([]);
    expect(platformArgs('linux/amd64')).toEqual(['--platform', 'linux/amd64']);
    expect(platformArgs('linux/arm64/v8')).toEqual(['--platform', 'linux/arm64/v8']);
    expect(() => platformArgs('windows/amd64')).toThrow(/PLAYWRIGHT_DOCKER_PLATFORM/);
    expect(() => platformArgs('linux/amd64; rm -rf')).toThrow();
  });

  it('keeps the host node_modules on Linux, and uses the container own install elsewhere', () => {
    expect(needsOwnModules('linux', '')).toBe(false);
    expect(needsOwnModules('linux', 'linux/amd64')).toBe(true);
    expect(needsOwnModules('darwin', '')).toBe(true);
    expect(needsOwnModules('win32', '')).toBe(true);
  });

  it('mounts a Linux node_modules volume over the workspace one, after the workspace bind', () => {
    const args = runArgs({ ...base, platform: 'linux/amd64', volumeName: 'vol' });
    const mounts = args.flatMap((a, i) => (args[i - 1] === '--mount' ? [a] : []));
    expect(mounts).toEqual(['type=bind,source=/work,target=/workspace', 'type=volume,source=vol,target=/workspace/node_modules']);
    expect(args.slice(args.indexOf('--platform'), args.indexOf('--platform') + 2)).toEqual(['--platform', 'linux/amd64']);
    expect(args.slice(-4)).toEqual(['npx', 'playwright', 'test', 'visual.spec.ts']);
  });

  it('is unchanged for a Linux host without a platform override', () => {
    const args = runArgs({ ...base, platform: '', volumeName: undefined });
    expect(args).not.toContain('--platform');
    expect(args.join(' ')).not.toContain('/workspace/node_modules');
  });

  it('passes through only the documented environment variables', () => {
    const args = runArgs({ ...base, platform: '', env: { CI: '1', SITE_URL: 'https://example.com', SECRET: 'x' } });
    expect(args).toContain('CI=1');
    expect(args).toContain('SITE_URL=https://example.com');
    expect(args.join(' ')).not.toContain('SECRET');
  });

  it('keys the volume by lockfile content and platform, and installs from a copy of the lockfile', () => {
    const a = modulesVolume('{"a":1}', 'linux/amd64');
    expect(a.name).toBe('calculadoras-node-modules-linux-amd64');
    expect(modulesVolume('{"a":1}', 'linux/amd64').hash).toBe(a.hash);
    expect(modulesVolume('{"a":2}', 'linux/amd64').hash).not.toBe(a.hash);
    expect(modulesVolume('{}', '').name).toBe('calculadoras-node-modules-native');
    const script = installScript({ hash: a.hash, uid: 501, gid: 20 });
    expect(script).toContain('npm ci');
    expect(script).toContain('cp /workspace/package.json /workspace/package-lock.json /tmp/deps/');
    expect(script).toContain('chown -R 501:20 /modules');
  });
});
