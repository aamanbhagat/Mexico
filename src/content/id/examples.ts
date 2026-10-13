/**
 * Worked examples for the /id/ weton pages. The same objects are asserted in
 * tests/unit/calendar/javanese.test.ts, so what a page shows is what is tested.
 */
import type { Dina, Pasaran } from '../../lib/calendar/javanese';

export interface ExampleSource {
  label: string;
  url: string;
}

export interface WetonExample {
  id: string;
  title: string;
  story: string;
  iso: string;
  expected: { dina: Dina; pasaran: Pasaran; neptu: number; jawa: string; wuku: string };
  sources: ExampleSource[];
}

export const WETON_EXAMPLES: WetonExample[] = [
  {
    id: 'proklamasi',
    title: '17 Agustus 1945',
    story:
      'Hari Proklamasi jatuh pada Jumat Legi, bertepatan dengan 9 Ramadan 1364 H. Bung Karno sendiri menyebut "Jumat Legi" saat menjelaskan pilihan tanggal itu.',
    iso: '1945-08-17',
    expected: { dina: 'Jumat', pasaran: 'Legi', neptu: 11, jawa: '9 Pasa 1876', wuku: 'Manahil' },
    sources: [
      {
        label: 'Republika — Mengapa Proklamasi RI pada Hari Jumat 17 Agustus 1945',
        url: 'https://news.republika.co.id/berita/siadin458/mengapa-proklamasi-ri-pada-hari-jumat-17-agustus-1945',
      },
      { label: 'JatimTIMES — Bung Karno dan Jumat Legi', url: 'https://jatimtimes.com/baca/308270/20240318/072900/privacy' },
    ],
  },
  {
    id: 'satu-suro-1960',
    title: '1 Suro 1960: 17 Juni 2026',
    story:
      'Tahun Baru Jawa 1960 (tahun Be) jatuh pada Rabu Kliwon, sehari setelah 1 Muharam 1448 H. Kalender Kemenag mencetak keduanya berdampingan.',
    iso: '2026-06-17',
    expected: { dina: 'Rabu', pasaran: 'Kliwon', neptu: 15, jawa: '1 Suro 1960', wuku: 'Galungan' },
    sources: [
      {
        label: 'detikJatim — Malam 1 Suro 2026 Bertepatan Weton Apa?',
        url: 'https://www.detik.com/jatim/budaya/d-8517446/malam-1-suro-2026-bertepatan-weton-apa',
      },
      {
        label: 'Katadata — Kalender Jawa Juli 2026 (1 Sura 1960 = Rabu, 17/6/2026)',
        url: 'https://katadata.co.id/lifestyle/varia/6a39f918dddc9/kalender-jawa-juli-2026-lengkap-dengan-weton-dan-pasarannya',
      },
    ],
  },
  {
    id: 'tiga-belas-oktober-2026',
    title: '13 Oktober 2026',
    story: 'Selasa Pon, hari pertama bulan Jumadilawal 1960 dalam kalender Jawa, di minggu wuku Kulawu.',
    iso: '2026-10-13',
    expected: { dina: 'Selasa', pasaran: 'Pon', neptu: 10, jawa: '1 Jumadilawal 1960', wuku: 'Kulawu' },
    sources: [
      {
        label: 'detikJatim — Kalender Jawa Oktober 2026 dengan Hari, Weton dan Pasaran',
        url: 'https://www.detik.com/jatim/budaya/d-8689105/kalender-jawa-oktober-2026-dengan-hari-weton-dan-pasaran',
      },
      {
        label: 'Katadata — Kalender Jawa 13 Oktober 2026',
        url: 'https://katadata.co.id/lifestyle/varia/6ac384e65fc87/kalender-jawa-13-oktober-2026-lengkap-dengan-weton-dan-prediksi-karakternya',
      },
    ],
  },
];

export interface JodohExample {
  id: string;
  title: string;
  story: string;
  a: { dina: Dina; pasaran: Pasaran };
  b: { dina: Dina; pasaran: Pasaran };
  /** Expected label per method id. */
  expected: Record<string, string>;
  total: number;
  sources: ExampleSource[];
}

export const JODOH_EXAMPLES: JodohExample[] = [
  {
    id: 'selasa-legi-minggu-pahing',
    title: 'Selasa Legi dan Minggu Pahing',
    story:
      'Contoh dari kumparan (mengutip Primbon Betaljemur Adammakna): neptu 8 + 14 = 22. Dengan sisa 5 hasilnya Dana; metode lain memberi hasil berbeda.',
    a: { dina: 'Selasa', pasaran: 'Legi' },
    b: { dina: 'Minggu', pasaran: 'Pahing' },
    total: 22,
    expected: { 'sisa-8': 'Padu', 'sisa-7': 'Wasesa Segara', 'sisa-5': 'Dana', 'sisa-4': 'Gembili' },
    sources: [
      {
        label: 'kumparan — Perhitungan Weton: Seberapa Cocok Kamu dengan Pasangan',
        url: 'https://kumparan.com/millennial/perhitungan-weton-seberapa-cocok-kamu-dengan-pasangan-1rgiwFtEkMk',
      },
    ],
  },
  {
    id: 'minggu-pon-sabtu-kliwon',
    title: 'Minggu Pon dan Sabtu Kliwon',
    story:
      'Contoh metode sisa 7 di detikJateng dan Popbela: neptu 12 + 17 = 29, 29 dibagi 7 sisa 1, Wasesa Segara. Dengan sisa 5 hasilnya Pati: satu pasangan, empat tafsir.',
    a: { dina: 'Minggu', pasaran: 'Pon' },
    b: { dina: 'Sabtu', pasaran: 'Kliwon' },
    total: 29,
    expected: { 'sisa-8': 'Tinari', 'sisa-7': 'Wasesa Segara', 'sisa-5': 'Pati', 'sisa-4': 'Gentho' },
    sources: [
      {
        label: 'detikJateng — Cara Cek Kecocokan Jodoh Berdasarkan Weton',
        url: 'https://www.detik.com/jateng/budaya/d-8165445/cara-cek-kecocokan-jodoh-berdasarkan-weton-dan-primbon-jawa-untuk-pernikahan',
      },
      {
        label: 'Popbela — Ramalan Jodoh Berdasarkan Weton',
        url: 'https://www.popbela.com/relationship/married/ramalan-jodoh-berdasarkan-weton-00-jsc25-47t6sd',
      },
    ],
  },
  {
    id: 'jumat-kliwon-minggu-legi',
    title: 'Jumat Kliwon dan Minggu Legi',
    story:
      'Neptu 14 + 10 = 24 habis dibagi 8. Sisa 0 dihitung 8, jadi hasilnya Pesthi. Pasangan yang sama menjadi Pati pada sisa 5 dan Punggel pada sisa 4: alasan kami selalu menampilkan semua metode.',
    a: { dina: 'Jumat', pasaran: 'Kliwon' },
    b: { dina: 'Minggu', pasaran: 'Legi' },
    total: 24,
    expected: { 'sisa-8': 'Pesthi', 'sisa-7': 'Satriya Wibawa', 'sisa-5': 'Pati', 'sisa-4': 'Punggel' },
    sources: [
      {
        label: 'Popbela — Arti Pesthi dalam Hitungan Weton Jawa',
        url: 'https://www.popbela.com/relationship/married/arti-pesthi-kecocokan-pasangan-hitungan-weton-jawa-untuk-pernikahan-00-ck827-q40gbs',
      },
      {
        label: 'WetonJawa.com — Arti Hasil Perhitungan Weton Jodoh',
        url: 'https://www.wetonjawa.com/blog/arti-hasil-perhitungan-weton-jodoh',
      },
    ],
  },
];
