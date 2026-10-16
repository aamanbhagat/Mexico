import { describe, expect, it } from 'vitest';
import { requireSiteUrl } from '../../scripts/site-url.mjs';

describe('build-time SITE_URL', () => {
  it('accepts an HTTPS origin without choosing a production domain', () => {
    expect(requireSiteUrl('https://ci.tabula.test')).toBe('https://ci.tabula.test');
    expect(requireSiteUrl('https://your-project.vercel.app/')).toBe('https://your-project.vercel.app');
  });

  it.each([
    undefined,
    '',
    '   ',
    'https://calculadoras.example',
    'https://calculadoras.example.',
    'https://another.example',
    'not a URL',
    'http://ci.tabula.test',
    'https://ci.tabula.test/path',
    'https://ci.tabula.test?debug=true',
    'https://user:pass@ci.tabula.test',
  ])('rejects a missing, placeholder or malformed origin: %s', (value) => {
    expect(() => requireSiteUrl(value)).toThrow(/SITE_URL/);
  });
});
