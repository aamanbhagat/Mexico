import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, prerender } from '../../src/pages/api/refresh-udis';

const deployHook = 'https://api.vercel.com/v1/integrations/deploy/prj_example/synthetic-secret';
const cronSecret = 'synthetic-cron-secret';

function request(authorization?: string) {
  const headers = authorization ? { Authorization: authorization } : {};
  return GET({ request: new Request('https://example.org/api/refresh-udis/', { headers }) } as Parameters<typeof GET>[0]);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('daily Banxico production refresh', () => {
  it('keeps only the Cron endpoint on demand', () => {
    expect(prerender).toBe(false);
  });

  it('cronRejectsUnauthorizedRequests without triggering any deploy hook', async () => {
    vi.stubEnv('CRON_SECRET', cronSecret);
    vi.stubEnv('VERCEL_DEPLOY_HOOK', deployHook);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await request()).status).toBe(401);
    expect((await request('Bearer wrong-secret')).status).toBe(401);
    expect((await request(cronSecret)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.stubEnv('CRON_SECRET', '');
    expect((await request('Bearer ')).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not request deploys if a valid production hook is not configured', async () => {
    vi.stubEnv('CRON_SECRET', cronSecret);
    vi.stubEnv('VERCEL_DEPLOY_HOOK', 'https://another.example.org/v1/integrations/deploy/fake');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await request(`Bearer ${cronSecret}`)).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('asks Vercel to build once, without claiming the deployment completed', async () => {
    vi.stubEnv('CRON_SECRET', cronSecret);
    vi.stubEnv('VERCEL_DEPLOY_HOOK', deployHook);
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await request(`Bearer ${cronSecret}`);
    expect(response.status).toBe(202);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toBe('Deployment requested; build completion has not been verified');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(new URL(deployHook), expect.objectContaining({ method: 'POST' }));
  });

  it('returns safe errors on rejection or network failure without leaking secrets', async () => {
    vi.stubEnv('CRON_SECRET', cronSecret);
    vi.stubEnv('VERCEL_DEPLOY_HOOK', deployHook);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('secret details', { status: 429 })),
    );
    const rejected = await request(`Bearer ${cronSecret}`);
    expect(rejected.status).toBe(502);
    expect(await rejected.text()).not.toMatch(/synthetic|secret details/);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error(deployHook))),
    );
    const failed = await request(`Bearer ${cronSecret}`);
    expect(failed.status).toBe(502);
    expect(await failed.text()).not.toMatch(/synthetic|prj_example/);
  });
});
