// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { requireSiteUrl } from './scripts/site-url.mjs';

const DEV_ORIGIN = 'http://localhost:4321';

function siteUrlIntegration() {
  return {
    name: 'site-url',
    hooks: {
      /** @param {import('astro').HookParameters<'astro:config:setup'>} options */
      'astro:config:setup'({ command, updateConfig }) {
        const configured = loadEnv(command === 'build' ? 'production' : 'development', process.cwd(), 'SITE_URL').SITE_URL;
        const siteUrl = command === 'build' ? requireSiteUrl(configured) : configured || DEV_ORIGIN;
        process.env.SITE_URL = siteUrl;
        updateConfig({ site: siteUrl });
      },
    },
  };
}

/** Local, self-hosted font files (no third-party requests: privacy rule in AGENTS.md §5). */
/** @param {string} pkg @param {string} file */
const fs = (pkg, file) => `${pkg}/files/${file}`;
const local = fontProviders.local();

/**
 * Client bundles only need values, dates and source links from the parameter registry.
 * Long editorial fields (notes, descriptions) stay in the static HTML (sources section)
 * and are stripped from browser JavaScript to protect the per-page JS budget.
 */
function stripParamNotesForClient() {
  return {
    name: 'strip-param-notes-for-client',
    enforce: /** @type {const} */ ('pre'),
    /** @param {string} code @param {string} id @param {{ ssr?: boolean } | undefined} options */
    transform(code, id, options) {
      // @ts-expect-error Vite environment API
      const env = this?.environment?.name;
      const isClient = env ? env === 'client' : !options?.ssr;
      if (!isClient || !/[\\/]src[\\/]data[\\/]parameters[\\/].+\.json$/.test(id.split('?')[0] ?? '')) return null;
      const data = JSON.parse(code);
      delete data.description;
      // Editorial fields can sit at any depth (land-unit catalogs carry notes per unit and source).
      /** @param {unknown} node */
      const strip = (node) => {
        if (Array.isArray(node)) node.forEach(strip);
        else if (node && typeof node === 'object') {
          const o = /** @type {Record<string, unknown>} */ (node);
          delete o['notes'];
          delete o['retrieved_on'];
          Object.values(o).forEach(strip);
        }
      };
      for (const v of data.versions ?? []) strip(v);
      return { code: JSON.stringify(data), map: null };
    },
  };
}

/** @type {any[]} Lab-only font families (typed loosely: the shape matches `fonts` entries). */
const LAB_FONTS = [
  {
    provider: local,
    name: 'Martian Mono',
    cssVariable: '--font-martian',
    fallbacks: ['Courier New', 'monospace'],
    options: {
      variants: [
        {
          src: [fs('@fontsource-variable/martian-mono', 'martian-mono-latin-wght-normal.woff2')],
          weight: '100 800',
          style: 'normal',
        },
      ],
    },
  },
  {
    provider: local,
    name: 'Instrument Sans',
    cssVariable: '--font-instrument',
    fallbacks: ['Arial', 'sans-serif'],
    options: {
      variants: [
        {
          src: [fs('@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2')],
          weight: '400 700',
          style: 'normal',
        },
      ],
    },
  },
  {
    provider: local,
    name: 'Bitter',
    cssVariable: '--font-bitter',
    fallbacks: ['Georgia', 'serif'],
    options: {
      variants: [
        {
          src: [fs('@fontsource-variable/bitter', 'bitter-latin-wght-normal.woff2')],
          weight: '100 900',
          style: 'normal',
        },
      ],
    },
  },
  {
    provider: local,
    name: 'Courier Prime',
    cssVariable: '--font-courier',
    fallbacks: ['Courier New', 'monospace'],
    options: {
      variants: [
        {
          src: [fs('@fontsource/courier-prime', 'courier-prime-latin-400-normal.woff2')],
          weight: 400,
          style: 'normal',
        },
      ],
    },
  },
];

export default defineConfig({
  site: DEV_ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  integrations: [siteUrlIntegration(), preact()],
  vite: {
    plugins: [tailwindcss(), stripParamNotesForClient()],
  },
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
    },
  },
  fonts: [
    {
      provider: local,
      name: 'Archivo',
      cssVariable: '--font-archivo',
      fallbacks: ['Archivo Fallback', 'Arial', 'sans-serif'],
      optimizedFallbacks: false,
      options: {
        variants: [
          {
            // Spanish subset with axes limited to the ranges in use (scripts/subset-fonts.py).
            src: ['./src/assets/fonts/archivo-es.woff2'],
            weight: '400 800',
            style: 'normal',
            stretch: '100% 125%',
          },
        ],
      },
    },
    // Fonts of the rejected design directions, only for the lab build (npm run build:lab).
    ...(process.env.LAB === '1' ? LAB_FONTS : []),
  ],
});
