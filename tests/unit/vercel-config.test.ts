import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')) as {
  framework: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory?: string;
  trailingSlash: boolean;
  crons: { path: string; schedule: string }[];
  redirects: { source: string; destination: string; statusCode: number }[];
  headers: HeaderRule[];
};

function headersFor(path: string): Record<string, string> {
  return Object.fromEntries(
    config.headers
      .filter((rule) => new RegExp(`^${rule.source}$`).test(path))
      .flatMap((rule) => rule.headers.map(({ key, value }) => [key, value])),
  );
}

describe('Vercel static pages and the daily UDI Cron function', () => {
  it('uses Astro adapter output with the directory URLs used by canonicals', () => {
    expect(config).toMatchObject({
      framework: 'astro',
      installCommand: 'npm ci',
      buildCommand: 'npm run build',
      trailingSlash: true,
    });
    expect(config.outputDirectory).toBeUndefined();
    expect(config.redirects).toContainEqual({ source: '/', destination: '/es-mx/', statusCode: 302 });
    expect(config.crons).toEqual([{ path: '/api/refresh-udis/', schedule: '0 18 * * *' }]);
  });

  it('keeps security headers on pages and static assets', () => {
    for (const path of [
      '/es-mx/',
      '/pt-br/conversor-alqueire-hectare/',
      '/id/weton/',
      '/robots.txt',
      '/_astro/app.js',
      '/api/refresh-udis/',
    ]) {
      expect(headersFor(path)).toMatchObject({
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      });
    }
  });

  it('caches hashed assets and OG images but never the dated archive or Cron response', () => {
    expect(headersFor('/_astro/BaseLayout.js')['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(headersFor('/_astro/fonts/font.woff2')['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(headersFor('/og/id/weton.png')['Cache-Control']).toBe('public, max-age=86400');
    expect(headersFor('/data/mx/udis.json')['Cache-Control']).toBe('no-store');
    expect(headersFor('/api/refresh-udis/')['Cache-Control']).toBe('no-store');
    expect(headersFor('/es-mx/calculadora-aguinaldo/')['Cache-Control']).toBeUndefined();
    expect(headersFor('/sitemap.xml')['Cache-Control']).toBeUndefined();
  });
});
