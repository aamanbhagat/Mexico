/**
 * Build-time Open Graph images (1200×630 PNG): the tool's line with stations, the page title
 * and the official values in force. Rendered with Satori → SVG → resvg; no runtime cost.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);

interface Node {
  type: string;
  props: Record<string, unknown> & { children?: unknown };
}

function h(type: string, style: Record<string, unknown>, ...children: unknown[]): Node {
  return { type, props: { style: { display: 'flex', ...style }, children: children.length <= 1 ? children[0] : children } };
}

let fonts: { name: string; data: Buffer; weight: 400 | 800; style: 'normal' }[] | undefined;

async function loadFonts() {
  if (fonts) return fonts;
  const file = (w: number) => require.resolve(`@fontsource/archivo/files/archivo-latin-${w}-normal.woff`);
  fonts = [
    { name: 'Archivo', data: await readFile(file(400)), weight: 400, style: 'normal' },
    { name: 'Archivo', data: await readFile(file(800)), weight: 800, style: 'normal' },
  ];
  return fonts;
}

export interface OgSpec {
  title: string;
  subtitle: string;
  color: string;
  footer: string;
  siteName: string;
}

export async function renderOg(spec: OgSpec): Promise<Buffer> {
  const station = (filled: boolean, size = 34) =>
    h('div', {
      width: size,
      height: size,
      borderRadius: size,
      border: `8px solid ${spec.color}`,
      background: filled ? spec.color : '#ffffff',
    });

  const tree = h(
    'div',
    { width: 1200, height: 630, background: '#ffffff', fontFamily: 'Archivo', color: '#000000' },
    h(
      'div',
      { width: 150, height: 630, alignItems: 'center', justifyContent: 'center', position: 'relative' },
      h('div', { position: 'absolute', left: 69, top: 0, width: 12, height: 630, background: spec.color }),
      h(
        'div',
        { flexDirection: 'column', alignItems: 'center', gap: 70 },
        station(false),
        station(false),
        station(false),
        station(true, 54),
      ),
    ),
    h(
      'div',
      { flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px 56px 24px', width: 1050 },
      h(
        'div',
        { flexDirection: 'column', gap: 24 },
        h('div', { fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }, spec.title),
        h('div', { fontSize: 34, fontWeight: 400, color: '#3d3d3a', lineHeight: 1.3 }, spec.subtitle),
      ),
      h(
        'div',
        { justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 26 },
        h('div', { fontWeight: 400, color: '#3d3d3a' }, spec.footer),
        h('div', { fontWeight: 800, fontSize: 34 }, spec.siteName),
      ),
    ),
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
