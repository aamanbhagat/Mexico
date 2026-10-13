/**
 * Open Graph cards for /id/ pages (1200×630, built once at build time): one per weton — the share
 * card of every weton result — one per tool, and one per Javanese calendar year and month.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../../config/site';
import { renderOg, type OgSpec } from '../../../lib/seo/og';
import { DINA, PASARAN, allWeton, suroInYear, wetonSlug } from '../../../lib/calendar/javanese';
import { defaultNeptuTable } from '../../../lib/params/id';
import { BULAN, BULAN_SLUGS, KALENDER_YEARS } from '../../../content/id/meta';

const NILA = '#2b3990';
const SOGA = '#8a4b0f';
const ROSE = '#9c1f4f';
const table = defaultNeptuTable();
const values = DINA.map((d) => PASARAN.map((p) => table.dina[d] + table.pasaran[p]));
const footer = 'Metode dan sumber tercantum di setiap halaman';

type Spec = Omit<OgSpec, 'siteName'>;
const SPECS: Record<string, Spec> = {
  weton: {
    title: 'Cek weton dari tanggal lahir',
    subtitle: 'Hari, pasaran, neptu, wuku, tanggal Jawa dan Hijriah.',
    color: NILA,
    footer,
    selapan: { values, row: 2, col: 2 },
  },
  jodoh: { title: 'Hitung weton jodoh', subtitle: 'Sisa 8, 7, 5 dan 4 berdampingan, dengan sumbernya.', color: ROSE, footer },
  'hari-ini': {
    title: 'Weton hari ini',
    subtitle: 'Pasaran, neptu dan tanggal Jawa hari ini, besok dan seminggu ke depan.',
    color: NILA,
    footer,
  },
};

for (const w of allWeton()) {
  const n = table.dina[w.dina] + table.pasaran[w.pasaran];
  SPECS[wetonSlug(w.dina, w.pasaran)] = {
    title: `Weton ${w.dina} ${w.pasaran}`,
    subtitle: `Neptu ${n}: ${w.dina} ${table.dina[w.dina]} + ${w.pasaran} ${table.pasaran[w.pasaran]}`,
    color: NILA,
    footer: 'Tanggal, wuku dan jodohnya di Tabula',
    selapan: { values, row: DINA.indexOf(w.dina), col: PASARAN.indexOf(w.pasaran) },
  };
}

for (const y of KALENDER_YEARS) {
  const suro = suroInYear(y)
    .map((s) => `1 Suro ${s.year} jatuh ${Number(s.iso.slice(8))} ${BULAN[Number(s.iso.slice(5, 7)) - 1]}`)
    .join('; ');
  SPECS[`kalender-${y}`] = {
    title: `Kalender Jawa ${y}`,
    subtitle: `Weton dan pasaran setiap tanggal. ${suro}.`,
    color: SOGA,
    footer: 'Tanggal Jawa (Asapon) dan Hijriah Kemenag',
  };
  BULAN_SLUGS.forEach((slug, i) => {
    SPECS[`kalender-${y}-${slug}`] = {
      title: `Kalender Jawa ${BULAN[i]} ${y}`,
      subtitle: 'Weton, pasaran, tanggal Jawa dan Hijriah setiap hari.',
      color: SOGA,
      footer: 'Tanggal Jawa (Asapon) dan Hijriah Kemenag',
    };
  });
}

export const getStaticPaths = (() => Object.keys(SPECS).map((slug) => ({ params: { slug } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const spec = SPECS[params['slug'] ?? 'weton'] ?? SPECS['weton']!;
  const png = await renderOg({ ...spec, siteName: SITE.name });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
