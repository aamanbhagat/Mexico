/**
 * Interface strings per locale. Written natively for each market (CLAUDE.md §7), not translated
 * word for word. Two dictionaries so islands only ship what they render:
 *  - SITE_UI: static pages (layouts, header, footer, sources, badges) — never sent to the browser;
 *  - CALC_UI: the few strings calculator islands need on the client.
 * Only published locales need entries; adding one is a type error until it is complete.
 */
import type { LocaleCode } from './locales';

export type UiLocale = Extract<LocaleCode, 'es-mx' | 'pt-br'>;

export interface SiteStrings {
  skipLink: string;
  home: string;
  homeAria: (brand: string) => string;
  nav: string;
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
  reviewPending: { legal: string; technical: string };
  reviewedBy: (who: string, credentials: string | null, date: string) => string;
  sourceMeta: {
    effectiveFrom: string;
    retrievedOn: string;
    verified: string;
    pending: string;
  };
  otherCountries: string;
}

export const SITE_UI: Record<UiLocale, SiteStrings> = {
  'es-mx': {
    skipLink: 'Saltar al contenido',
    home: 'Inicio',
    homeAria: (brand) => `${brand}, inicio`,
    nav: 'Calculadoras',
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
    reviewPending: { legal: 'Revisión legal: pendiente', technical: 'Revisión técnica: pendiente' },
    reviewedBy: (who, credentials, date) => `Revisado por ${who}${credentials ? `, ${credentials}` : ''} el ${date}`,
    sourceMeta: {
      effectiveFrom: 'vigente desde el',
      retrievedOn: 'consultado el',
      verified: 'verificado contra la fuente oficial',
      pending: 'verificación contra el documento oficial pendiente',
    },
    otherCountries: 'Otros países',
  },
  'pt-br': {
    skipLink: 'Pular para o conteúdo',
    home: 'Início',
    homeAria: (brand) => `${brand}, início`,
    nav: 'Ferramentas',
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
    reviewPending: { legal: 'Revisão jurídica: pendente', technical: 'Revisão técnica: pendente' },
    reviewedBy: (who, credentials, date) => `Revisado por ${who}${credentials ? `, ${credentials}` : ''} em ${date}`,
    sourceMeta: {
      effectiveFrom: 'vigente desde',
      retrievedOn: 'consultado em',
      verified: 'conferido no documento original',
      pending: 'conferência no documento original pendente',
    },
    otherCountries: 'Outros países',
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
};

export function siteUi(locale: LocaleCode): SiteStrings {
  const s = (SITE_UI as Partial<Record<LocaleCode, SiteStrings>>)[locale];
  if (!s) throw new Error(`No interface strings for locale "${locale}"`);
  return s;
}
