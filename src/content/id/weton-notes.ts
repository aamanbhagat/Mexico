/**
 * Facts specific to a single weton, each with its sources. Only facts we could source are listed;
 * a weton without an entry simply gets none (no filler).
 */
import type { ExampleSource } from './examples';

export interface WetonNote {
  text: string;
  sources: ExampleSource[];
}

const DETIK_1_SURO: ExampleSource = {
  label: 'detikJatim — Malam 1 Suro 2026 Bertepatan Weton Apa? (pergantian hari Jawa saat magrib)',
  url: 'https://www.detik.com/jatim/budaya/d-8517446/malam-1-suro-2026-bertepatan-weton-apa',
};
const GALUNGAN: ExampleSource = {
  label: 'Kalenderku.id — Galungan dan Kuningan: hari raya Bali setiap 210 hari',
  url: 'https://kalenderku.id/blog/galungan-kuningan-hari-raya-bali',
};
const KATADATA_GALUNGAN: ExampleSource = {
  label: 'Katadata — Kapan Hari Raya Galungan dan Kuningan 2026',
  url: 'https://katadata.co.id/lifestyle/varia/6a3244b6b5cf1/kapan-hari-raya-galungan-dan-kuningan-2026-simak-jadwal-dan-perayaannya',
};

export const WETON_NOTES: Record<string, WetonNote[]> = {
  'jumat-legi': [
    {
      text: 'Proklamasi Kemerdekaan, 17 Agustus 1945, jatuh pada Jumat Legi. Bung Karno sendiri menyebut weton itu ketika menjelaskan pilihan tanggalnya.',
      sources: [
        {
          label: 'Republika — Mengapa Proklamasi RI pada Hari Jumat 17 Agustus 1945',
          url: 'https://news.republika.co.id/berita/siadin458/mengapa-proklamasi-ri-pada-hari-jumat-17-agustus-1945',
        },
        { label: 'JatimTIMES — Bung Karno dan Jumat Legi', url: 'https://jatimtimes.com/baca/308270/20240318/072900/privacy' },
      ],
    },
  ],
  'jumat-kliwon': [
    {
      text: 'Malam Jumat Kliwon adalah Kamis malam sebelum Jumat Kliwon, karena dalam kalender Jawa hari berganti saat magrib. 1 Suro 1959 (27 Juni 2025) juga jatuh pada Jumat Kliwon.',
      sources: [
        DETIK_1_SURO,
        {
          label: 'Kompas TV — Kalender Jawa Juni 2025: 1 Muharram 1447 H jatuh pada Jumat Kliwon',
          url: 'https://www.kompas.tv/lifestyle/601008/kalender-jawa-juni-2025-pekan-ini-1-muharram-1447-h-jatuh-pada-jumat-kliwon',
        },
      ],
    },
  ],
  'selasa-kliwon': [
    {
      text: 'Selasa Kliwon juga disebut Anggara Kasih atau Anggoro Kasih: anggara berarti Selasa, kasih merujuk pada Kliwon.',
      sources: [
        { label: 'Popbela — Weton Selasa Kliwon', url: 'https://www.popbela.com/relationship/single/weton-selasa-kliwon-00-fzpls-j7gql2' },
        {
          label: 'JawaPos — Weton Selasa Kliwon, dino Anggoro Kasih',
          url: 'https://www.jawapos.com/lifestyle/2407120326/dua-kasta-khodam-tertinggi-dimiliki-oleh-weton-selasa-kliwon-dino-anggoro-kasih-salah-satunya-kanjeng-ratu-kidul',
        },
      ],
    },
  ],
  'rabu-kliwon': [
    {
      text: 'Tahun Baru Jawa 1 Suro 1960 jatuh pada Rabu Kliwon, 17 Juni 2026. Di Bali, Hari Raya Galungan selalu jatuh pada Rabu Kliwon (Buda Kliwon) di wuku Dungulan, yang dalam kalender Jawa disebut wuku Galungan.',
      sources: [DETIK_1_SURO, GALUNGAN, KATADATA_GALUNGAN],
    },
  ],
  'sabtu-kliwon': [
    {
      text: 'Di Bali, Hari Raya Kuningan selalu jatuh pada Sabtu Kliwon di wuku Kuningan, sepuluh hari setelah Galungan; pada 2026 tanggalnya 27 Juni.',
      sources: [GALUNGAN, KATADATA_GALUNGAN],
    },
  ],
  'senin-legi': [
    {
      text: 'Tahun Baru Jawa 1 Suro 1958 jatuh pada Senin Legi, 8 Juli 2024, sehari setelah 1 Muharam 1446 H.',
      sources: [
        {
          label: 'detikJatim — 1 Suro 2024 Jatuh pada Hari Apa?',
          url: 'https://www.detik.com/jatim/berita/d-7418837/1-suro-2024-jatuh-pada-hari-apa-begini-penjelasan-dan-sejarahnya',
        },
        {
          label: 'Bisnis.com — Kalender Jawa Bulan Juli 2024 Lengkap dengan Weton',
          url: 'https://kabar24.bisnis.com/read/20240710/79/1780960/kalender-jawa-bulan-juli-2024-lengkap-dengan-weton',
        },
      ],
    },
  ],
};
