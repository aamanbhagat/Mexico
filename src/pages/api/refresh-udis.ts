import type { APIRoute } from 'astro';

export const prerender = false;

const responseHeaders = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' };

export const GET: APIRoute = async ({ request }) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401, headers: responseHeaders });
  }

  const configuredHook = process.env.VERCEL_DEPLOY_HOOK;
  let hook: URL;
  try {
    if (!configuredHook) throw new Error('Missing deploy hook');
    hook = new URL(configuredHook);
    if (
      hook.protocol !== 'https:' ||
      hook.hostname !== 'api.vercel.com' ||
      hook.port ||
      hook.username ||
      hook.password ||
      !/^\/v1\/integrations\/deploy\/[^/]+\//.test(hook.pathname)
    ) {
      throw new Error('Invalid deploy hook');
    }
  } catch {
    return new Response('Production deploy hook is not configured', { status: 503, headers: responseHeaders });
  }

  try {
    const accepted = await fetch(hook, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000) });
    if (!accepted.ok) return new Response('Production deploy hook did not accept the request', { status: 502, headers: responseHeaders });
    return new Response('Deployment requested; build completion has not been verified', { status: 202, headers: responseHeaders });
  } catch {
    return new Response('Production deploy hook could not be reached', { status: 502, headers: responseHeaders });
  }
};
