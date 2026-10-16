/**
 * Interface strings per locale. Written natively for each market (AGENTS.md §7), not translated
 * word for word. Two dictionaries so islands only ship what they render:
 *  - SITE_UI: static pages (layouts, header, footer, sources, badges) — never sent to the browser;
 *  - CALC_UI: the few strings calculator islands need on the client.
 * Only published locales need entries; adding one is a type error until it is complete.
 */
import type { LocaleCode } from './locales';

export type UiLocale = Extract<LocaleCode, 'es-mx' | 'pt-br' | 'id'>;

/** Which kind of review a page waits for: legal (labour/tax/pension), technical or a domain expert. */
export type ReviewKind = 'legal' | 'technical' | 'expert';

export interface SiteStrings {
  skipLink: string;
  /** id of <main>, the skip link's target: a native word, stable per locale (es-MX keeps "contenido"). */
  mainId: string;
  home: string;
  homeAria: (brand: string) => string;
  nav: string;
  /** aria-label of the header navigation. */
  mainNav: string;
  themeToDark: string;
  themeToLight: string;
  themeTitle: string;
  breadcrumbs: string;
  updatedOn: string;
  howTitle: string;
  examplesTitle: string;
  faqTitle: string;
  sourcesTitle: string;
  relatedTitle: string;
  disclaimerTitle: string;
  exampleSource: string;
  openExample: string;
  reviewPending: Record<ReviewKind, string>;
  reviewedBy: (who: string, credentials: string | null, date: string) => string;
  sourceMeta: {
    effectiveFrom: string;
    retrievedOn: string;
    verified: string;
    pending: string;
  };
  otherCountries: string;
  /** schema.org WebApplication.browserRequirements. */
  browserRequirements: string;
}

export const SITE_UI: Record<UiLocale, SiteStrings> = {
  'es-mx': {
    skipLink: 'Saltar al contenido',
    mainId: 'contenido',
    home: 'Inicio',
    homeAria: (brand) => `${brand}, inicio`,
    nav: 'Calculadoras',
    mainNav: 'Principal',
    themeToDark: 'Cambiar a tema oscuro',
    themeToLight: 'Cambiar a tema claro',
    themeTitle: 'Cambiar tema',
    breadcrumbs: 'Ruta de navegación',
    updatedOn: 'Actualizado el',
    howTitle: 'Cómo se calcula',
    examplesTitle: 'Ejemplos resueltos',
    faqTitle: 'Preguntas frecuentes',
    sourcesTitle: 'Fuentes y valores oficiales',
    relatedTitle: 'Otras calculadoras',
    disclaimerTitle: 'Aviso importante',
    exampleSource: 'Fuente:',
    openExample: 'Abrir en la calculadora',
    reviewPending: {
      legal: 'Revisión legal: pendiente',
      technical: 'Revisión técnica: pendiente',
      expert: 'Revisión de especialista: pendiente',
    },
    reviewedBy: (who, credentials, date) => `Revisado por ${who}${credentials ? `, ${credentials}` : ''} el ${date}`,
    sourceMeta: {
      effectiveFrom: 'vigente desde el',
      retrievedOn: 'consultado el',
      verified: 'verificado contra la fuente oficial',
      pending: 'verificación contra el documento oficial pendiente',
    },
    otherCountries: 'Otros países',
    browserRequirements: 'Requiere JavaScript para recalcular en vivo.',
  },
  'pt-br': {
    skipLink: 'Pular para o conteúdo',
    mainId: 'conteudo',
    home: 'Início',
    homeAria: (brand) => `${brand}, início`,
    nav: 'Ferramentas',
    mainNav: 'Principal',
    themeToDark: 'Mudar para o tema escuro',
    themeToLight: 'Mudar para o tema claro',
    themeTitle: 'Mudar tema',
    breadcrumbs: 'Caminho de navegação',
    updatedOn: 'Atualizado em',
    howTitle: 'Como calculamos',
    examplesTitle: 'Exemplos resolvidos',
    faqTitle: 'Perguntas frequentes',
    sourcesTitle: 'Fontes',
    relatedTitle: 'Outras conversões',
    disclaimerTitle: 'Aviso importante',
    exampleSource: 'Fonte:',
    openExample: 'Abrir no conversor',
    reviewPending: {
      legal: 'Revisão jurídica: pendente',
      technical: 'Revisão técnica: pendente',
      expert: 'Revisão de especialista: pendente',
    },
    reviewedBy: (who, credentials, date) => `Revisado por ${who}${credentials ? `, ${credentials}` : ''} em ${date}`,
    sourceMeta: {
      effectiveFrom: 'vigente desde',
      retrievedOn: 'consultado em',
      verified: 'conferido no documento original',
      pending: 'conferência no documento original pendente',
    },
    otherCountries: 'Outros países',
    browserRequirements: 'Requer JavaScript para converter em tempo real.',
  },
  id: {
    skipLink: 'Langsung ke isi',
    mainId: 'isi',
    home: 'Beranda',
    homeAria: (brand) => `${brand}, beranda`,
    nav: 'Alat hitung',
    mainNav: 'Menu utama',
    themeToDark: 'Ganti ke tema gelap',
    themeToLight: 'Ganti ke tema terang',
    themeTitle: 'Ganti tema',
    breadcrumbs: 'Navigasi lokasi halaman',
    updatedOn: 'Diperbarui',
    howTitle: 'Cara menghitung',
    examplesTitle: 'Contoh perhitungan',
    faqTitle: 'Pertanyaan yang sering diajukan',
    sourcesTitle: 'Sumber dan metode',
    relatedTitle: 'Alat lainnya',
    disclaimerTitle: 'Catatan penting',
    exampleSource: 'Sumber:',
    openExample: 'Buka di kalkulator',
    reviewPending: {
      legal: 'Tinjauan hukum: menunggu',
      technical: 'Tinjauan teknis: menunggu',
      expert: 'Tinjauan ahli penanggalan Jawa: menunggu',
    },
    reviewedBy: (who, credentials, date) => `Ditinjau oleh ${who}${credentials ? `, ${credentials}` : ''} pada ${date}`,
    sourceMeta: {
      effectiveFrom: 'berlaku sejak',
      retrievedOn: 'diakses',
      verified: 'sudah dicocokkan dengan sumber asli',
      pending: 'belum dicocokkan dengan dokumen asli',
    },
    otherCountries: 'Negara lain',
    browserRequirements: 'Perlu JavaScript untuk menghitung langsung di perangkat.',
  },
};

export interface CalcStrings {
  formLabel: string;
  seeDetails: string;
  copy: string;
  share: string;
  pdf: string;
  print: string;
  feedback: { copied: string; shared: string; link: string; pdf: string; print: string; error: string };
}

export const CALC_UI: Record<UiLocale, CalcStrings> = {
  'es-mx': {
    formLabel: 'Datos para el cálculo',
    seeDetails: 'Ver desglose',
    copy: 'Copiar',
    share: 'Compartir',
    pdf: 'Descargar PDF',
    print: 'Imprimir',
    feedback: {
      copied: 'Resumen copiado',
      shared: 'Listo para compartir',
      link: 'Enlace copiado',
      pdf: 'PDF descargado',
      print: 'Abriendo la impresión',
      error: 'No se pudo completar. Intenta de nuevo.',
    },
  },
  'pt-br': {
    formLabel: 'Dados da conversão',
    seeDetails: 'Ver detalhes',
    copy: 'Copiar',
    share: 'Compartilhar',
    pdf: 'Baixar PDF',
    print: 'Imprimir',
    feedback: {
      copied: 'Resultado copiado',
      shared: 'Pronto para compartilhar',
      link: 'Link copiado',
      pdf: 'PDF baixado',
      print: 'Abrindo a impressão',
      error: 'Não foi possível concluir. Tente de novo.',
    },
  },
  id: {
    formLabel: 'Data untuk menghitung',
    seeDetails: 'Lihat detail',
    copy: 'Salin',
    share: 'Bagikan',
    pdf: 'Unduh PDF',
    print: 'Cetak',
    feedback: {
      copied: 'Ringkasan disalin',
      shared: 'Siap dibagikan',
      link: 'Tautan disalin',
      pdf: 'PDF diunduh',
      print: 'Membuka jendela cetak',
      error: 'Gagal. Coba lagi.',
    },
  },
};

export function siteUi(locale: LocaleCode): SiteStrings {
  const s = (SITE_UI as Partial<Record<LocaleCode, SiteStrings>>)[locale];
  if (!s) throw new Error(`No interface strings for locale "${locale}"`);
  return s;
}
