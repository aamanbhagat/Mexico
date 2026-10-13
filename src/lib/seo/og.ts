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
  /** Optional 7 × 5 neptu grid (weton cards): values per row/column and the crossing cell. */
  selapan?: { values: number[][]; row: number; col: number } | undefined;
}

/** The weton crossing drawn as in the page: the active row and column as lines, one filled station. */
function selapanGraphic(spec: NonNullable<OgSpec['selapan']>, color: string): Node {
  const cell = 52;
  const size = 42;
  const lines = [
    h('div', { position: 'absolute', left: 0, top: spec.row * cell + cell / 2 - 4, width: 5 * cell, height: 8, background: color }),
    h('div', { position: 'absolute', top: 0, left: spec.col * cell + cell / 2 - 4, width: 8, height: 7 * cell, background: color }),
  ];
  const circles = spec.values.flatMap((row, r) =>
    row.map((v, c) => {
      const on = r === spec.row && c === spec.col;
      const line = r === spec.row || c === spec.col;
      return h(
        'div',
        {
          position: 'absolute',
          left: c * cell + (cell - size) / 2,
          top: r * cell + (cell - size) / 2,
          width: size,
          height: size,
          borderRadius: size,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: on ? 24 : 20,
          fontWeight: on ? 800 : 400,
          color: on ? '#ffffff' : line ? '#000000' : '#6b6b67',
          background: on ? color : '#ffffff',
          border: line && !on ? `6px solid ${color}` : '0',
        },
        String(v),
      );
    }),
  );
  return h('div', { position: 'relative', width: 5 * cell, height: 7 * cell, flex: 'none' }, ...lines, ...circles);
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
        { justifyContent: 'space-between', alignItems: 'flex-start', gap: 40 },
        h(
          'div',
          { flexDirection: 'column', gap: 24, flex: 1 },
          h('div', { fontSize: spec.selapan ? 70 : 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }, spec.title),
          h('div', { fontSize: 34, fontWeight: 400, color: '#3d3d3a', lineHeight: 1.3 }, spec.subtitle),
        ),
        ...(spec.selapan ? [selapanGraphic(spec.selapan, spec.color)] : []),
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
