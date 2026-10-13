/**
 * Copy and links shared by the /id/ pages: related tools, extra sources for the calendar rules,
 * and the disclaimer wording (tradition, not prediction; official Hijri dates come from Kemenag).
 */
import type { RelatedLink } from '../../components/page/types';
import { KALENDER_YEARS } from './meta';

export const ID_RELATED: RelatedLink[] = [
  { href: '/id/weton/', label: 'Cek weton dari tanggal lahir', tool: 'weton' },
  { href: '/id/weton/jodoh/', label: 'Hitung weton jodoh', tool: 'jodoh' },
  { href: '/id/weton/hari-ini/', label: 'Weton hari ini', tool: 'hari-ini' },
  ...KALENDER_YEARS.map((y) => ({ href: `/id/kalender-jawa/${y}/`, label: `Kalender Jawa ${y}`, tool: 'kalender' as const })),
];

export const ID_SOURCES = {
  /** The calendar rules the engine implements (year lengths, windu, kurup, Kemenag's printed dates). */
  calendar: [
    {
      title: 'EPJ Web of Conferences 240, 07007 (2020): siklus windu dan panjang tahun Alip–Jimakir (354/355 hari)',
      url: 'https://www.epj-conferences.org/articles/epjconf/pdf/2020/16/epjconf_seaan2020_07007.pdf',
    },
    {
      title: 'An ethnoarithmetic excursion into the Javanese calendar (arXiv 2012.10064): windu Adi, Kuntara, Sengara, Sancaya',
      url: 'https://arxiv.org/pdf/2012.10064',
    },
    {
      title: 'detikJatim — Malam 1 Suro 2026 Bertepatan Weton Apa? (kalender Kemenag: 1 Suro 1960 = Rabu Kliwon 17 Juni 2026)',
      url: 'https://www.detik.com/jatim/budaya/d-8517446/malam-1-suro-2026-bertepatan-weton-apa',
    },
    {
      title: 'GNFI — Perbedaan penanggalan 1 Suro antara Masehi, Hijriah dan kalender Jawa (kurup Asapon sejak 1936)',
      url: 'https://www.goodnewsfromindonesia.id/2024/07/09/perbedaan-penanggalan-1-suro-antara-masehi-hijriah-dan-kalender-jawa',
    },
    {
      title: 'Wikipedia — Javanese calendar (pancawara, wuku, windu)',
      url: 'https://en.wikipedia.org/wiki/Javanese_calendar',
    },
  ],
};

export const ID_DISCLAIMER = {
  weton:
    'Weton, neptu dan tafsir primbon adalah bagian dari tradisi budaya Jawa, bukan ramalan pasti. Jangan jadikan satu-satunya dasar keputusan penting seperti pernikahan, kesehatan, hukum atau keuangan.',
  hijri:
    'Tanggal Hijriah di sini mengikuti Kementerian Agama sejauh yang sudah diumumkan; untuk ibadah, ikuti pengumuman resmi Kemenag dan hasil sidang isbat. Tanggal bertanda ≈ masih perkiraan.',
  kalender:
    'Tanggal libur nasional mengikuti SKB 3 Menteri. Hari raya keagamaan bisa bergeser sesuai keputusan Menteri Agama; periksa pengumuman resmi sebelum membuat rencana.',
};
