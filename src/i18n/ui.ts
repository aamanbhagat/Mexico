/**
 * Interface strings of the shared chrome (layout, header, footer, theme toggle, page sections),
 * one set per published locale. Page copy lives with each page; only words reused by shared
 * components belong here.
 */
import type { LocaleCode } from './locales';

export interface UiStrings {
  skipLink: string;
  home: string;
  brandHome: string;
  mainNav: string;
  breadcrumbs: string;
  themeToDark: string;
  themeToLight: string;
  themeTitle: string;
  updatedOn: string;
  how: string;
  examples: string;
  faq: string;
  sources: string;
  related: string;
  notice: string;
  example: { source: string; open: string };
  review: { pending: string; reviewedBy: string; on: string };
  sourceMeta: {
    inForceFrom: string;
    consulted: string;
    verified: string;
    pending: string;
  };
  /** Text for WebApplication.browserRequirements. */
  browserRequirements: string;
}

const ES_MX: UiStrings = {
  skipLink: 'Saltar al contenido',
  home: 'Inicio',
  brandHome: 'inicio',
  mainNav: 'Principal',
  breadcrumbs: 'Ruta de navegación',
  themeToDark: 'Cambiar a tema oscuro',
  themeToLight: 'Cambiar a tema claro',
  themeTitle: 'Cambiar tema',
  updatedOn: 'Actualizado el',
  how: 'Cómo se calcula',
  examples: 'Ejemplos resueltos',
  faq: 'Preguntas frecuentes',
  sources: 'Fuentes y valores oficiales',
  related: 'Otras calculadoras',
  notice: 'Aviso importante',
  example: { source: 'Fuente', open: 'Abrir en la calculadora' },
  review: { pending: 'Revisión legal: pendiente', reviewedBy: 'Revisado por', on: 'el' },
  sourceMeta: {
    inForceFrom: 'vigente desde el',
    consulted: 'consultado el',
    verified: 'verificado contra la fuente oficial',
    pending: 'verificación contra el documento oficial pendiente',
  },
  browserRequirements: 'Requiere JavaScript para recalcular en vivo.',
};

const ID: UiStrings = {
  skipLink: 'Langsung ke isi',
  home: 'Beranda',
  brandHome: 'beranda',
  mainNav: 'Menu utama',
  breadcrumbs: 'Navigasi lokasi halaman',
  themeToDark: 'Ganti ke tema gelap',
  themeToLight: 'Ganti ke tema terang',
  themeTitle: 'Ganti tema',
  updatedOn: 'Diperbarui',
  how: 'Cara menghitung',
  examples: 'Contoh perhitungan',
  faq: 'Pertanyaan yang sering diajukan',
  sources: 'Sumber dan metode',
  related: 'Alat lainnya',
  notice: 'Catatan penting',
  example: { source: 'Sumber', open: 'Buka di kalkulator' },
  review: { pending: 'Tinjauan ahli penanggalan Jawa: menunggu', reviewedBy: 'Ditinjau oleh', on: 'pada' },
  sourceMeta: {
    inForceFrom: 'berlaku sejak',
    consulted: 'diakses',
    verified: 'sudah dicocokkan dengan sumber asli',
    pending: 'belum dicocokkan dengan dokumen asli',
  },
  browserRequirements: 'Perlu JavaScript untuk menghitung langsung di perangkat.',
};

const STRINGS: Partial<Record<LocaleCode, UiStrings>> = { 'es-mx': ES_MX, id: ID };

export function ui(locale: LocaleCode): UiStrings {
  return STRINGS[locale] ?? ES_MX;
}
