/**
 * Golden tests for the Javanese calendar engine (src/lib/calendar/javanese).
 *
 * Every golden date is checked against at least two published sources, cited per row. The press
 * sources (detik, Katadata, Kompas TV, Bisnis.com) reproduce the Kementerian Agama calendar,
 * which prints the Javanese (Sultan Agungan, kurup Asapon) date next to the Hijri date.
 * Fields are only asserted when the cited sources state them; where sources disagree the row
 * says so and we assert the arithmetic that the majority (and Kemenag) follow. The engine's own
 * rules (year lengths, kurup) are cited in src/lib/calendar/javanese/sultan-agungan.ts.
 *
 * Note on retrieval: sources were read through search-result summaries on 13 Oct 2026; the
 * build environment cannot open the pages directly (network policy). See docs/PLAN.md.
 */
import { describe, expect, it } from 'vitest';
import {
  ASAPON_EPOCH_JDN,
  WUKU_SINTA_ANCHOR_JDN,
  allWeton,
  checkDate,
  dayInfo,
  hijriDate,
  isoFromJdn,
  javaneseDate,
  jdnFromIso,
  monthDays,
  monthStartJdn,
  monthWeeks,
  newYearJdn,
  nextWetonDates,
  tabularHijri,
  tabularJdn,
  validateHijriTable,
  wetonDatesBetween,
  wukuOfWeton,
  type BulanHijriah,
  type Dina,
  type Pasaran,
  type Sasi,
  type Tahun,
  type Windu,
  type Wuku,
} from '../../../src/lib/calendar/javanese';
import { idCalendarOptions, jodohAll, jodohWith, wetonDay } from '../../../src/lib/weton';
import { defaultJodohMethod, jodohMethods, kemenagHijriTable } from '../../../src/lib/params/id';
import { JODOH_EXAMPLES, WETON_EXAMPLES } from '../../../src/content/id/examples';

/* Sources (search-result summaries, retrieved 2026-10-13) ------------------------------------ */
const S = {
  detikOkt2026: 'detikJatim — Kalender Jawa Oktober 2026 dengan Hari, Weton dan Pasaran (d-8689105)',
  detikHariIni13Okt: 'detikJatim — Kalender Jawa 13 Oktober 2026: Hari Ini Selasa Pon (d-8703481)',
  katadata13Okt: 'Katadata — Kalender Jawa 13 Oktober 2026 (6ac384e65fc87): Selasa 3 + Pon 7',
  portalpantura13Okt: 'Portal Pantura — Kalender Jawa 13 Oktober 2026: Selasa Pon, wuku Kulawu',
  katadataHijriOkt: 'Katadata — Kalender Hijriah Oktober 2026 (Kemenag): 1 Jumadilawal 1448 = 12 Okt 2026',
  alhabibId2026: 'Alhabib — Kalender Hijriah Indonesia 2026 (tabel awal bulan dari Kemenag)',
  liputan6Okt: 'Liputan6 — Kalender Jawa Bulan Oktober (8301901): 12 Okt = 29 Bakda Mulud 1960',
  detik12Okt: 'detikJatim — Kalender Jawa Hari Ini 12 Oktober 2026, Senin Pahing (d-8701039)',
  katadata11Okt: 'Katadata — Kalender Jawa 11 Oktober 2026: Minggu Legi, neptu 10, wuku Kulawu (6ac47b3d85e1a)',
  kalenderku10Okt: 'kalenderku.id/10-oktober-2026: Sabtu Kliwon, 27 Bakda Mulud 1960, Be, Windu Sancaya, wuku Wayang',
  kompastvOkt1: 'Kompas TV — Kalender Jawa 1–7 Oktober 2026, dimulai Kamis Legi (693453)',
  katadataJawaOkt: 'Katadata — Kalender Jawa Oktober 2026 Lengkap (6aba6c602756a)',
  kalenderize: 'kalenderize.com — daftar Minggu: 18 Okt 2026 Minggu Pon Dukut, 25 Okt 2026 Minggu Kliwon Watugunung',
  detik1Suro2026:
    'detikJatim — Malam 1 Suro 2026 Bertepatan Weton Apa? (d-8517446): kalender Kemenag, 1 Suro 1960 = Rabu Kliwon 17 Juni 2026',
  gnfiKemenagJuni2026: "GNFI — tabel Kemenag: Rabu Kliwon | 17 Juni 2026 | 1 Suro 1960 Ba' | 2 Muharam 1448 H; 16 Juni = 1 Muharam 1448",
  merahputih1Suro: 'Merah Putih — Malam 1 Suro 2026 kapan, weton kalender Jawa',
  katadataJul2026: 'Katadata — Kalender Jawa Juli 2026 (6a39f918dddc9): 1 Sura 1960 = Rabu 17/6/2026; 1 Juli = Rabu Wage 15 Sura',
  bisnisJul2026: "Bisnis.com — Kalender Jawa Bulan Juli 2026 (20260701): 1 Juli Rabu Wage 15 Suro 1960 Ba' 16 Muharram 1448 H",
  pdip2Jul:
    'pdiperjuanganbali.id — Kemenag terbitkan Kalender Jawa 2 Juli 2026: Kamis Kliwon 16 Suro 1960, Be, Windu Sancaya, wuku Langkir',
  pdip11Jul: 'pdiperjuanganbali.id — Kalender Jawa 11 Juli 2026: Sabtu Wage, neptu 13',
  kalenderku9Jul: 'kalenderku.id/9-juli-2026: Kamis Pahing, neptu 17',
  kompastvMuharam: 'Kompas TV — Kapan 1 Muharam 2026? Jadwal resmi Kemenag (674802): Selasa 16 Juni 2026',
  metrotvMuharam: 'Metro TV — Kapan 1 Muharam 1448 H (KRXCQy2g): Selasa 16 Juni 2026',
  kompastv1Suro2025: 'Kompas TV — 1 Suro 2025 bertepatan Jumat Kliwon, kalender Juni menurut Kemenag (598601)',
  kompastvJuni2025: 'Kompas TV — Kalender Jawa Juni 2025: Jumat Kliwon 27 Juni 2025 = 1 Suro 1959 Dal = 1 Muharram 1447 H (601008)',
  detik1Suro2024: 'detikJatim — 1 Suro 2024 Jatuh pada Hari Apa? (d-7418837): Senin Legi 8 Juli 2024; 1 Muharam 1446 = 7 Juli',
  bisnisJul2024: 'Bisnis.com — Kalender Jawa Bulan Juli 2024 Lengkap dengan Weton (20240710)',
  republika: 'Republika — Mengapa Proklamasi RI pada Hari Jumat 17 Agustus 1945 (9 Ramadan 1364 H)',
  jatimtimesLegi: 'JatimTIMES — Bung Karno menyebut proklamasi jatuh pada Jumat Legi',
  detik19Mar: 'detikJateng — Kalender Jawa Kamis Kliwon 19 Maret 2026 (d-8406588): 30 Pasa 1959, Dal, Windu Sancaya, wuku Kulawu',
  skb2026: 'Setneg — SKB 3 Menteri 2026: Nyepi Kamis 19 Maret, Idulfitri 21–22 Maret, Iduladha Rabu 27 Mei, 1 Muharam Selasa 16 Juni',
  kemenagDkiRamadan: 'Kanwil Kemenag DKI — Pemerintah tetapkan 1 Ramadan 1447 H jatuh pada Kamis 19 Februari 2026',
  fimelaSyawal: 'Fimela — hasil sidang isbat: Idulfitri 1447 H jatuh Sabtu 21 Maret 2026',
  bisnisZulhijah: 'Bisnis.com — hasil sidang isbat: 1 Zulhijah 1447 = Senin 18 Mei 2026, Iduladha 27 Mei 2026',
  detik11Okt2024: 'detikJateng — Kalender Jawa Jumat Legi 11 Oktober 2024 (d-7582291): 7 Bakdamulud 1958, Je, Windu Sancaya, wuku Langkir',
  kalenderku1Des: 'kalenderku.id/1-desember-2026: Selasa Pahing, neptu 12, 20 Jumadilakir 1960, wuku Tolu',
  mamikos1Des: 'Mamikos — Kalender Jawa 2026: 1 Desember 2026 Selasa Pahing, 21 Jumadil Akhir 1448 H',
  kalenderkuDes:
    'kalenderku.id — Desember 2026: 12 Des Sabtu Pon 2 Rejeb 1960 Gumbreg; 20 Des Minggu Legi 10 Rejeb Warigagung; 26 Des Sabtu Pahing 16 Rejeb Warigagung',
  kalenderkuJan2027:
    'kalenderku.id — Januari 2027: 4 Jan Senin Legi 25 Rejeb 1960; 5 Jan Selasa Pahing 26 Rejeb; 20 Jan Rabu Pahing; 27 Jan Rabu Wage',
  skb2027:
    'Setneg/Metro TV — SKB 3 Menteri 2027: Isra Mikraj Selasa 5 Jan; Idulfitri Rabu–Kamis 10–11 Mar; Iduladha Senin 17 Mei; 1 Muharam Minggu 6 Jun; Maulid Minggu 15 Agu',
  detikHijriah2027: 'detikNews — Kalender Hijriah 2027 (d-8694893): Isra Mikraj 27 Rajab 1448 = 5 Jan 2027',
  galungan2026: 'Katadata — Galungan Rabu 17 Juni 2026, Kuningan Sabtu 27 Juni 2026 (SE Ditjen Bimas Hindu)',
  kalenderkuGalungan: 'kalenderku.id/blog — Galungan selalu Rabu Kliwon wuku Dungulan; Kuningan Sabtu Kliwon wuku Kuningan',
  twinklGalungan: 'Twinkl — Galungan berikutnya 13 Januari 2027 dan 11 Agustus 2027',
  gnfiAsapon: 'GNFI — Perbedaan penanggalan 1 Suro (2024-07-09): Asapon mulai 1867 J / 24 Maret 1936',
  walisongoAsapon: 'UIN Walisongo eprints 3156 (Bab 4): Asapon, Alip Selasa Pon, 1867–1986 J',
  epjYears: 'EPJ Web of Conferences (SEAAN 2020) 07007: Alip 354, Ehe 355, Jimawal 354, Je 354, Dal 355, Be 354, Wawu 354, Jimakir 355',
  gnfiAboge: 'GNFI — Mengenal siklus sewindu kalender Aboge: Ehe, Dal, Jimakir 355 hari; 2835 hari per windu',
  kalenderku1963: 'kalenderku.id/1-januari-1963: tahun Jawa 1894, Je, Windu Sancaya',
  arxivWindu: 'arXiv 2012.10064 — An ethnoarithmetic excursion into the Javanese calendar: windu Adi, Kuntara, Sengara, Sancaya',
} as const;

interface Golden {
  iso: string;
  dina?: Dina;
  pasaran?: Pasaran;
  neptu?: number;
  wuku?: Wuku;
  jawa?: { day?: number; month?: Sasi; year: number; tahun?: Tahun; windu?: Windu };
  hijri?: { day: number; month: BulanHijriah; year: number };
  sources: string[];
  note?: string;
}

const GOLDEN: Golden[] = [
  // Today (build date of this change).
  {
    iso: '2026-10-13',
    dina: 'Selasa',
    pasaran: 'Pon',
    neptu: 10,
    wuku: 'Kulawu',
    jawa: { day: 1, month: 'Jumadilawal', year: 1960, tahun: 'Be', windu: 'Sancaya' },
    hijri: { day: 2, month: 'Jumadilawal', year: 1448 },
    sources: [S.detikOkt2026, S.detikHariIni13Okt, S.katadata13Okt, S.portalpantura13Okt, S.katadataHijriOkt, S.alhabibId2026],
    note: 'Conflict: detik prints "1 Jumadilawal 1448 H" (the Javanese day copied as Hijri); Katadata and Alhabib put 1 Jumadilawal 1448 on 12 Oct, so 13 Oct is the 2nd.',
  },
  {
    iso: '2026-10-12',
    dina: 'Senin',
    pasaran: 'Pahing',
    jawa: { day: 29, month: 'Bakdamulud', year: 1960 },
    hijri: { day: 1, month: 'Jumadilawal', year: 1448 },
    sources: [S.liputan6Okt, S.detik12Okt, S.katadataHijriOkt, S.alhabibId2026],
  },
  {
    iso: '2026-10-11',
    dina: 'Minggu',
    pasaran: 'Legi',
    neptu: 10,
    wuku: 'Kulawu',
    jawa: { day: 28, month: 'Bakdamulud', year: 1960 },
    sources: [S.katadata11Okt, S.portalpantura13Okt],
  },
  {
    iso: '2026-10-10',
    dina: 'Sabtu',
    pasaran: 'Kliwon',
    wuku: 'Wayang',
    jawa: { day: 27, month: 'Bakdamulud', year: 1960, tahun: 'Be', windu: 'Sancaya' },
    sources: [S.kalenderku10Okt, S.detikOkt2026],
  },
  { iso: '2026-10-01', dina: 'Kamis', pasaran: 'Legi', sources: [S.kompastvOkt1, S.detikOkt2026] },
  { iso: '2026-10-17', dina: 'Sabtu', pasaran: 'Pahing', neptu: 18, sources: [S.detikOkt2026, S.katadataJawaOkt] },
  { iso: '2026-10-18', dina: 'Minggu', pasaran: 'Pon', wuku: 'Dukut', sources: [S.kalenderize, S.portalpantura13Okt] },
  // 1 Suro boundaries.
  {
    iso: '2026-06-17',
    dina: 'Rabu',
    pasaran: 'Kliwon',
    wuku: 'Galungan',
    jawa: { day: 1, month: 'Suro', year: 1960, tahun: 'Be' },
    hijri: { day: 2, month: 'Muharam', year: 1448 },
    sources: [S.detik1Suro2026, S.gnfiKemenagJuni2026, S.merahputih1Suro, S.katadataJul2026, S.galungan2026],
  },
  {
    iso: '2026-06-16',
    dina: 'Selasa',
    pasaran: 'Wage',
    neptu: 7,
    jawa: { day: 30, month: 'Besar', year: 1959, tahun: 'Dal' },
    hijri: { day: 1, month: 'Muharam', year: 1448 },
    sources: [S.gnfiKemenagJuni2026, S.kompastvMuharam, S.metrotvMuharam, S.detik1Suro2026],
    note: 'Leap case: Dal is a long year, so Besar 1959 has a 30th day. Conflict: Katadata (Juni 2026) and the Unesa calendar print 16 June as 1 Suro 1960, aligning the Javanese date with 1 Muharam; Kemenag keeps them a day apart.',
  },
  {
    iso: '2025-06-27',
    dina: 'Jumat',
    pasaran: 'Kliwon',
    jawa: { day: 1, month: 'Suro', year: 1959, tahun: 'Dal' },
    sources: [S.kompastv1Suro2025, S.kompastvJuni2025],
    note: 'Conflict: a GNFI June 2025 table prints 27 June as "30 Besar 1958" and 1 Suro on 28 June (one day later, as in the Aboge convention); Je is a short year, so "30 Besar" fits neither convention.',
  },
  {
    iso: '2024-07-08',
    dina: 'Senin',
    pasaran: 'Legi',
    neptu: 9,
    jawa: { day: 1, month: 'Suro', year: 1958, tahun: 'Je' },
    sources: [S.detik1Suro2024, S.bisnisJul2024],
  },
  // July 2026 (Suro 1960, Muharam 1448).
  {
    iso: '2026-07-01',
    dina: 'Rabu',
    pasaran: 'Wage',
    neptu: 11,
    jawa: { day: 15, month: 'Suro', year: 1960 },
    hijri: { day: 16, month: 'Muharam', year: 1448 },
    sources: [S.katadataJul2026, S.bisnisJul2026],
  },
  {
    iso: '2026-07-02',
    dina: 'Kamis',
    pasaran: 'Kliwon',
    wuku: 'Langkir',
    jawa: { day: 16, month: 'Suro', year: 1960, tahun: 'Be', windu: 'Sancaya' },
    sources: [S.pdip2Jul, S.katadataJul2026],
  },
  {
    iso: '2026-07-04',
    jawa: { day: 18, month: 'Suro', year: 1960 },
    sources: [S.katadataJul2026, S.bisnisJul2026],
    note: 'Conflict: Dealls prints 4 July as 17 Suro; Katadata and Bisnis.com print 18 Suro (arithmetic from 1 Suro = 17 June).',
  },
  {
    iso: '2026-07-09',
    dina: 'Kamis',
    pasaran: 'Pahing',
    neptu: 17,
    jawa: { day: 23, month: 'Suro', year: 1960 },
    hijri: { day: 24, month: 'Muharam', year: 1448 },
    sources: [S.kalenderku9Jul, S.bisnisJul2026],
  },
  { iso: '2026-07-11', dina: 'Sabtu', pasaran: 'Wage', neptu: 13, sources: [S.pdip11Jul, S.katadataJul2026] },
  // Ramadan / Syawal / Zulhijah 1447 (sidang isbat) against the Javanese months.
  {
    iso: '2026-02-19',
    dina: 'Kamis',
    jawa: { day: 2, month: 'Pasa', year: 1959 },
    hijri: { day: 1, month: 'Ramadan', year: 1447 },
    sources: [S.kemenagDkiRamadan, S.detik19Mar],
  },
  {
    iso: '2026-03-19',
    dina: 'Kamis',
    pasaran: 'Kliwon',
    wuku: 'Kulawu',
    jawa: { day: 30, month: 'Pasa', year: 1959, tahun: 'Dal', windu: 'Sancaya' },
    hijri: { day: 29, month: 'Ramadan', year: 1447 },
    sources: [S.detik19Mar, S.skb2026, S.kemenagDkiRamadan, S.fimelaSyawal],
  },
  {
    iso: '2026-03-21',
    dina: 'Sabtu',
    jawa: { day: 2, month: 'Sawal', year: 1959 },
    hijri: { day: 1, month: 'Syawal', year: 1447 },
    sources: [S.fimelaSyawal, S.skb2026],
  },
  {
    iso: '2026-05-27',
    dina: 'Rabu',
    jawa: { day: 10, month: 'Besar', year: 1959 },
    hijri: { day: 10, month: 'Zulhijah', year: 1447 },
    sources: [S.bisnisZulhijah, S.skb2026],
  },
  // Older date in the same windu.
  {
    iso: '2024-10-11',
    dina: 'Jumat',
    pasaran: 'Legi',
    wuku: 'Langkir',
    jawa: { day: 7, month: 'Bakdamulud', year: 1958, tahun: 'Je', windu: 'Sancaya' },
    sources: [S.detik11Okt2024, S.epjYears],
  },
  // December 2026 – January 2027.
  {
    iso: '2026-12-01',
    dina: 'Selasa',
    pasaran: 'Pahing',
    neptu: 12,
    wuku: 'Tolu',
    jawa: { day: 20, month: 'Jumadilakir', year: 1960 },
    hijri: { day: 21, month: 'Jumadilakhir', year: 1448 },
    sources: [S.kalenderku1Des, S.mamikos1Des, S.alhabibId2026],
    note: 'Hijri differs by source: kalenderku.id follows Muhammadiyah (KHGT) and prints 22 Jumadilakhir; Mamikos and the Kemenag table give 21.',
  },
  {
    iso: '2026-12-12',
    dina: 'Sabtu',
    pasaran: 'Pon',
    wuku: 'Gumbreg',
    jawa: { day: 2, month: 'Rejeb', year: 1960 },
    sources: [S.kalenderkuDes, S.mamikos1Des],
  },
  {
    iso: '2026-12-20',
    dina: 'Minggu',
    pasaran: 'Legi',
    neptu: 10,
    wuku: 'Warigagung',
    jawa: { day: 10, month: 'Rejeb', year: 1960 },
    sources: [S.kalenderkuDes, S.mamikos1Des],
  },
  {
    iso: '2026-12-26',
    dina: 'Sabtu',
    pasaran: 'Pahing',
    neptu: 18,
    wuku: 'Warigagung',
    jawa: { day: 16, month: 'Rejeb', year: 1960 },
    sources: [S.kalenderkuDes, S.mamikos1Des],
  },
  {
    iso: '2027-01-01',
    dina: 'Jumat',
    pasaran: 'Pon',
    jawa: { day: 22, month: 'Rejeb', year: 1960 },
    sources: [S.kalenderkuJan2027, S.skb2027],
  },
  {
    iso: '2027-01-04',
    dina: 'Senin',
    pasaran: 'Legi',
    neptu: 9,
    jawa: { day: 25, month: 'Rejeb', year: 1960 },
    sources: [S.kalenderkuJan2027, S.skb2027],
  },
  {
    iso: '2027-01-05',
    dina: 'Selasa',
    pasaran: 'Pahing',
    neptu: 12,
    jawa: { day: 26, month: 'Rejeb', year: 1960 },
    hijri: { day: 27, month: 'Rajab', year: 1448 },
    sources: [S.kalenderkuJan2027, S.skb2027, S.detikHijriah2027],
  },
  { iso: '2027-01-27', dina: 'Rabu', pasaran: 'Wage', neptu: 11, sources: [S.kalenderkuJan2027, S.skb2027] },
  {
    iso: '2027-03-10',
    dina: 'Rabu',
    jawa: { day: 1, month: 'Sawal', year: 1960 },
    hijri: { day: 1, month: 'Syawal', year: 1448 },
    sources: [S.skb2027, S.detikHijriah2027],
  },
  {
    iso: '2027-05-17',
    dina: 'Senin',
    hijri: { day: 10, month: 'Zulhijah', year: 1448 },
    sources: [S.skb2027, S.detikHijriah2027],
  },
  {
    iso: '2027-06-06',
    dina: 'Minggu',
    pasaran: 'Wage',
    jawa: { day: 1, month: 'Suro', year: 1961, tahun: 'Wawu' },
    hijri: { day: 1, month: 'Muharam', year: 1449 },
    sources: [S.skb2027, S.epjYears, S.gnfiAboge],
    note: '1 Suro 1961 itself is not printed by any source we found; it follows from 1 Suro 1960 (17 Jun 2026) + 354 days (Be is a short year: EPJ, GNFI). 1 Muharam 1449 is from the SKB.',
  },
  // Balinese Galungan/Kuningan share the 210-day pawukon with the Javanese wuku.
  { iso: '2026-06-27', dina: 'Sabtu', pasaran: 'Kliwon', wuku: 'Kuningan', sources: [S.galungan2026, S.kalenderkuGalungan] },
  { iso: '2027-01-13', dina: 'Rabu', pasaran: 'Kliwon', wuku: 'Galungan', sources: [S.twinklGalungan, S.kalenderkuGalungan] },
  { iso: '2027-08-11', dina: 'Rabu', pasaran: 'Kliwon', wuku: 'Galungan', sources: [S.twinklGalungan, S.kalenderkuGalungan] },
  // Historic anchors.
  {
    iso: '1945-08-17',
    dina: 'Jumat',
    pasaran: 'Legi',
    neptu: 11,
    sources: [S.republika, S.jatimtimesLegi],
  },
  {
    iso: '1936-03-24',
    dina: 'Selasa',
    pasaran: 'Pon',
    jawa: { day: 1, month: 'Suro', year: 1867, tahun: 'Alip' },
    sources: [S.gnfiAsapon, S.walisongoAsapon],
    note: 'Start of kurup Asapon (Alip Selasa Pon). One secondary source gives 17 Feb 1936, which is not a Selasa Pon and contradicts the kurup name.',
  },
  {
    iso: '1963-01-01',
    jawa: { year: 1894, tahun: 'Je', windu: 'Sancaya' },
    sources: [S.kalenderku1963, S.arxivWindu],
    note: 'Only the year, tahun and windu are stated by the source, so only they are asserted.',
  },
];

const opts = idCalendarOptions();

describe('golden dates (≥ 30 dates, ≥ 2 sources each)', () => {
  it('has at least 30 golden dates, each with two or more sources', () => {
    expect(GOLDEN.length).toBeGreaterThanOrEqual(30);
    for (const g of GOLDEN) expect(g.sources.length, g.iso).toBeGreaterThanOrEqual(2);
  });

  it.each(GOLDEN.map((g) => [g.iso, g] as const))('%s', (_iso, g) => {
    const d = dayInfo(g.iso, opts);
    if (g.dina) expect(d.weton.dina).toBe(g.dina);
    if (g.pasaran) expect(d.weton.pasaran).toBe(g.pasaran);
    if (g.neptu) expect(d.neptu.total).toBe(g.neptu);
    if (g.wuku) expect(d.wuku.name).toBe(g.wuku);
    if (g.jawa) {
      expect(d.javanese.year).toBe(g.jawa.year);
      if (g.jawa.day !== undefined) expect(d.javanese.day).toBe(g.jawa.day);
      if (g.jawa.month) expect(d.javanese.monthName).toBe(g.jawa.month);
      if (g.jawa.tahun) expect(d.javanese.tahun).toBe(g.jawa.tahun);
      if (g.jawa.windu) expect(d.javanese.windu).toBe(g.jawa.windu);
    }
    if (g.hijri) {
      expect({ day: d.hijri.day, month: d.hijri.monthName, year: d.hijri.year }).toEqual(g.hijri);
    }
  });
});

describe('cycles', () => {
  it('anchors: Asapon epoch and wuku Sinta are the JDN of their ISO dates', () => {
    expect(jdnFromIso('1936-03-24')).toBe(ASAPON_EPOCH_JDN);
    expect(jdnFromIso('2026-11-01')).toBe(WUKU_SINTA_ANCHOR_JDN);
    expect(isoFromJdn(2431685)).toBe('1945-08-17');
  });

  it('round-trips ISO ↔ JDN across leap days and centuries', () => {
    for (const iso of ['1900-02-28', '1900-03-01', '2000-02-29', '2024-02-29', '2100-12-31', '1970-01-01']) {
      expect(isoFromJdn(jdnFromIso(iso))).toBe(iso);
    }
    expect(jdnFromIso('2000-03-01') - jdnFromIso('2000-02-28')).toBe(2); // 2000 is a leap year
    expect(jdnFromIso('1900-03-01') - jdnFromIso('1900-02-28')).toBe(1); // 1900 is not
  });

  it('every weton recurs exactly every 35 days and all 35 occur once per selapan', () => {
    const start = jdnFromIso('2026-01-01');
    const seen = new Set<string>();
    for (let i = 0; i < 35; i += 1) {
      const d = dayInfo(isoFromJdn(start + i), opts);
      seen.add(`${d.weton.dina} ${d.weton.pasaran}`);
      expect(dayInfo(isoFromJdn(start + i + 35), opts).weton).toEqual(d.weton);
    }
    expect(seen.size).toBe(35);
    expect(allWeton()).toHaveLength(35);
  });

  it('neptu ranges from 7 (Selasa Wage) to 18 (Sabtu Pahing)', () => {
    const totals = allWeton().map((w) => dayInfo(nextWetonDates('2026-01-01', w, 1)[0] as string, opts).neptu.total);
    expect(Math.min(...totals)).toBe(7);
    expect(Math.max(...totals)).toBe(18);
  });

  it('wuku weeks start on Sunday and the pawukon repeats every 210 days', () => {
    const sinta = dayInfo('2026-11-01', opts);
    expect(sinta.weton.dina).toBe('Minggu');
    expect(sinta.wuku).toMatchObject({ index: 0, name: 'Sinta', day: 0 });
    expect(dayInfo('2027-05-30', opts).wuku.name).toBe('Sinta'); // +210 days
    expect(dayInfo('2026-10-31', opts).wuku.name).toBe('Watugunung');
  });

  it('each weton falls in six different wuku', () => {
    for (const w of allWeton()) expect(new Set(wukuOfWeton(w)).size).toBe(6);
  });

  it('finds the next dates of a weton', () => {
    // 27 Jun 2025 was Jumat Kliwon (Kompas TV, see GOLDEN); +35 × 14 days = 30 Oct 2026.
    expect(nextWetonDates('2026-10-13', { dina: 'Jumat', pasaran: 'Kliwon' }, 3)).toEqual(['2026-10-30', '2026-12-04', '2027-01-08']);
    expect(nextWetonDates('2026-10-13', { dina: 'Selasa', pasaran: 'Pon' }, 1)).toEqual(['2026-10-13']);
    const all = wetonDatesBetween('2026-01-01', '2026-12-31', { dina: 'Jumat', pasaran: 'Kliwon' });
    expect(all.length).toBeGreaterThanOrEqual(10);
    expect(all.every((iso) => dayInfo(iso, opts).weton.pasaran === 'Kliwon')).toBe(true);
  });
});

describe('Sultan Agungan date', () => {
  it('long years (wuntu) are Ehe, Dal and Jimakir: 2835 days per windu', () => {
    const lengths = [1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962].map((y) => newYearJdn(y + 1) - newYearJdn(y));
    expect(lengths).toEqual([354, 355, 354, 354, 355, 354, 354, 355]);
    expect(javaneseDate(jdnFromIso('2026-06-16')).longYear).toBe(true); // Dal 1959
    expect(javaneseDate(jdnFromIso('2027-06-05'))).toMatchObject({ day: 29, monthName: 'Besar', longYear: false }); // Be 1960
  });

  it('months alternate 30 and 29 days from Suro', () => {
    const starts = Array.from({ length: 12 }, (_, i) => monthStartJdn(1960, i + 1));
    const lengths = starts.slice(1).map((s, i) => s - (starts[i] as number));
    expect(lengths).toEqual([30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30]);
    expect(isoFromJdn(starts[4] as number)).toBe('2026-10-13'); // 1 Jumadilawal 1960
  });

  it('1 Suro of an Alip year is Selasa Pon in Asapon and Senin Pahing in Anenhing (kurup names)', () => {
    expect(dayInfo(isoFromJdn(newYearJdn(1955)), opts).weton).toEqual({ dina: 'Selasa', pasaran: 'Pon' });
    const anenhing = dayInfo(isoFromJdn(newYearJdn(1987)), opts);
    expect(anenhing.weton).toEqual({ dina: 'Senin', pasaran: 'Pahing' });
    expect(anenhing.javanese.kurup).toBe('Anenhing');
    // The last Asapon year loses its 30 Besar, so 1 Suro 1987 comes one day earlier.
    // Sources print the switch as 25/26/27 Aug 2052; only 26 Aug is a Senin Pahing.
    expect(anenhing.iso).toBe('2052-08-26');
    expect(dayInfo('2052-08-25', opts).javanese).toMatchObject({ day: 29, monthName: 'Besar', year: 1986, daysInMonth: 29 });
  });

  it('dates before 24 March 1936 use kurup Aboge (Alip Rebo Wage)', () => {
    const before = dayInfo('1936-03-23', opts);
    expect(before.javanese).toMatchObject({ day: 29, monthName: 'Besar', year: 1866, kurup: 'Aboge', daysInMonth: 29 });
    expect(dayInfo(isoFromJdn(newYearJdn(1859)), opts).weton).toEqual({ dina: 'Rabu', pasaran: 'Wage' });
  });

  it('Aboge communities run one day behind Asapon today', () => {
    expect(javaneseDate(jdnFromIso('2026-06-18'), 'aboge')).toMatchObject({ day: 1, monthName: 'Suro', year: 1960, kurup: 'Aboge' });
    expect(javaneseDate(jdnFromIso('2026-06-17'), 'aboge')).toMatchObject({ day: 30, monthName: 'Besar', year: 1959 });
    expect(wetonDay('2026-10-13', 'aboge').javanese).toMatchObject({ day: 29, monthName: 'Bakdamulud' });
  });

  it('windu follows Adi → Kuntara → Sangara → Sancaya every 8 years', () => {
    const windu = (y: number) => javaneseDate(newYearJdn(y)).windu;
    expect([1955, 1963, 1971, 1979, 1987].map(windu)).toEqual(['Sancaya', 'Adi', 'Kuntara', 'Sangara', 'Sancaya']);
    expect(windu(1867)).toBe('Adi');
  });
});

describe('Hijri date', () => {
  const table = kemenagHijriTable();

  it('the Kemenag table is consecutive with 29- or 30-day months', () => {
    expect(validateHijriTable(table)).toEqual([]);
    expect(table.length).toBeGreaterThanOrEqual(25);
  });

  it('covers every day of the 2026 and 2027 calendars', () => {
    for (const iso of ['2026-01-01', '2026-12-31', '2027-01-01', '2027-12-31']) {
      expect(hijriDate(jdnFromIso(iso), table).basis).not.toBe('hisab-urfi');
    }
  });

  it('flags estimated months and the arithmetical fallback as approximate', () => {
    expect(hijriDate(jdnFromIso('2026-10-13'), table)).toMatchObject({ approx: false, basis: 'kalender-kemenag' });
    expect(hijriDate(jdnFromIso('2027-01-20'), table)).toMatchObject({ day: 12, monthName: 'Syakban', approx: true });
    // Rajab 1448 starts on a known date (SKB); only its 30th depends on the estimated 1 Syakban.
    expect(hijriDate(jdnFromIso('2027-01-07'), table)).toMatchObject({ day: 29, monthName: 'Rajab', approx: false });
    expect(hijriDate(jdnFromIso('2027-01-08'), table)).toMatchObject({ day: 30, monthName: 'Rajab', approx: true });
    const outside = hijriDate(jdnFromIso('1945-08-17'), table);
    expect(outside).toMatchObject({ basis: 'hisab-urfi', approx: true, year: 1364, monthName: 'Ramadan' });
    // Republika: 9 Ramadan 1364. The tabular calendar is one day off, which is why it is flagged.
    expect(Math.abs(outside.day - 9)).toBeLessThanOrEqual(1);
  });

  it('tabular calendar round-trips and matches its own epoch', () => {
    expect(tabularHijri(1948440)).toEqual({ year: 1, month: 1, day: 1 });
    for (const iso of ['1900-01-01', '1999-12-31', '2026-06-16', '2100-12-31']) {
      const h = tabularHijri(jdnFromIso(iso));
      expect(tabularJdn(h.year, h.month, h.day)).toBe(jdnFromIso(iso));
    }
  });

  it('rejects a table with a gap', () => {
    const bad = [table[0]!, { ...table[2]! }];
    expect(validateHijriTable(bad).length).toBeGreaterThan(0);
  });
});

describe('month grids and validation', () => {
  it('October 2026 starts on Kamis Legi and has 5 rows', () => {
    const days = monthDays(2026, 10, opts);
    expect(days).toHaveLength(31);
    expect(days[0]?.weton).toEqual({ dina: 'Kamis', pasaran: 'Legi' });
    const weeks = monthWeeks(days);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]?.slice(0, 4).every((c) => c === null)).toBe(true);
  });

  it('refuses invalid and out-of-range dates', () => {
    expect(checkDate('2026-02-30')).toBe('invalid-date');
    expect(checkDate('1899-12-31')).toBe('out-of-range');
    expect(checkDate('2101-01-01')).toBe('out-of-range');
    expect(checkDate('2026-10-13')).toBeNull();
    expect(() => dayInfo('abc', opts)).toThrow(RangeError);
  });
});

describe('worked examples on the pages are the tested ones', () => {
  it.each(WETON_EXAMPLES.map((e) => [e.id, e] as const))('weton example %s', (_id, e) => {
    const d = wetonDay(e.iso);
    expect(d.weton).toEqual({ dina: e.expected.dina, pasaran: e.expected.pasaran });
    expect(d.neptu.total).toBe(e.expected.neptu);
    expect(`${d.javanese.day} ${d.javanese.monthName} ${d.javanese.year}`).toBe(e.expected.jawa);
    expect(d.wuku.name).toBe(e.expected.wuku);
  });

  it.each(JODOH_EXAMPLES.map((e) => [e.id, e] as const))('jodoh example %s', (_id, e) => {
    const all = jodohAll(e.a, e.b);
    expect(all[0]?.total).toBe(e.total);
    expect(Object.fromEntries(all.map((o) => [o.method.id, o.result.label]))).toEqual(e.expected);
  });
});

describe('jodoh methods', () => {
  it('the default is sisa 8 (Pegat … Pesthi), the most widely cited', () => {
    expect(defaultJodohMethod().id).toBe('sisa-8');
    expect(defaultJodohMethod().results.map((r) => r.label)).toEqual([
      'Pegat',
      'Ratu',
      'Jodoh',
      'Topo',
      'Tinari',
      'Padu',
      'Sujanan',
      'Pesthi',
    ]);
  });

  it('every method covers every remainder 1 … divisor and cites sources', () => {
    for (const m of jodohMethods()) {
      expect(m.results.map((r) => r.remainder)).toEqual(Array.from({ length: m.divisor }, (_, i) => i + 1));
      expect(m.refs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('a remainder of 0 counts as the divisor', () => {
    const o = jodohWith(defaultJodohMethod(), { dina: 'Jumat', pasaran: 'Kliwon' }, { dina: 'Minggu', pasaran: 'Legi' });
    expect(o).toMatchObject({ total: 24, remainder: 0, counted: 8, quotient: 3 });
    expect(o.result.label).toBe('Pesthi');
  });

  it('is symmetric: swapping the two people never changes the result', () => {
    const ws = allWeton();
    for (const m of jodohMethods()) {
      for (let i = 0; i < ws.length; i += 7) {
        for (let j = 0; j < ws.length; j += 5) {
          expect(jodohWith(m, ws[i]!, ws[j]!).result.label).toBe(jodohWith(m, ws[j]!, ws[i]!).result.label);
        }
      }
    }
  });
});

describe('Javanese new years inside a Gregorian year', () => {
  it('finds 1 Suro 1960 in 2026 and 1 Suro 1961 in 2027', async () => {
    const { suroInYear } = await import('../../../src/lib/calendar/javanese');
    expect(suroInYear(2026)).toEqual([{ year: 1960, iso: '2026-06-17' }]);
    expect(suroInYear(2027)).toEqual([{ year: 1961, iso: '2027-06-06' }]);
    // Roughly every 33 years two Javanese years start in one Gregorian year.
    const twice = Array.from({ length: 80 }, (_, i) => 1990 + i).filter((y) => suroInYear(y).length === 2);
    expect(twice.length).toBeGreaterThanOrEqual(2);
  });
});
