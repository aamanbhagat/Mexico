/**
 * Sources section for the pt-BR land pages, built from the catalog: every source behind the
 * units shown on the page, its kind and whether the document itself could be checked.
 */
import type { SourceItem } from '../Sources.astro';
import { BR_LAND } from '../../../lib/params/br';
import { KIND_LABEL } from '../../../content/pt-br/land-text';
import { formatDateLongIn } from '../../../lib/ui/format';

/** Always cited: the primary table, the 1948 publication to check against, the legal units. */
const ALWAYS = ['inda-1966', 'ibge-1948', 'inmetro-qgum'];

export function landSourceItems(unitIds: string[]): SourceItem[] {
  const ids: string[] = [];
  for (const id of unitIds) {
    const unit = BR_LAND.byId.get(id);
    if (!unit) throw new Error(`Unknown land unit ${id}`);
    for (const s of unit.sources) if (!ids.includes(s)) ids.push(s);
  }
  for (const s of ALWAYS) if (!ids.includes(s)) ids.push(s);
  return ids.map((id) => {
    const s = BR_LAND.raw.sources[id];
    if (!s) throw new Error(`Unknown source ${id}`);
    const read = s.opened ? 'documento conferido' : 'lido em trechos indexados';
    return {
      title: s.title,
      url: s.url,
      meta: `${KIND_LABEL[s.kind]}, consultado em ${formatDateLongIn(s.retrieved_on, 'pt-BR')}, ${read}${s.notes ? `. ${s.notes}` : ''}`,
      verified: s.opened,
    };
  });
}

/** Documents behind the "official papers use hectares" note. */
export const OFFICIAL_DOC_SOURCES = [
  {
    title: 'INCRA/Serpro — Manual da Declaração para Cadastro de Imóveis Rurais (DCR/SNCR): áreas em hectares com quatro casas decimais',
    url: 'https://www.cnabrasil.org.br/assets/arquivos/manual_dcr_19.11.2020.pdf',
    note: 'Cópia publicada pela CNA (edição de novembro de 2020).',
  },
  {
    title: 'Manual do ITR 2025 (FAESP/SENAR): utilização do imóvel informada em hectares na DITR',
    url: 'https://faespsenar.com.br/wp-content/uploads/2025/08/Manual-ITR-2025-1.pdf',
  },
  {
    title: 'Conecta gov.br — API SICAR Imóvel: área total do imóvel e número de módulos fiscais do CAR',
    url: 'https://www.gov.br/conecta/catalogo/apis/sicar-imovel',
  },
  {
    title:
      'Lei nº 6.015/1973 (Registros Públicos), art. 176: matrícula do imóvel rural com descrição georreferenciada certificada pelo INCRA',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l6015compilada.htm',
  },
  {
    title: 'ABNT NBR 5891:2014 — Regras de arredondamento na numeração decimal',
    url: 'https://normas.com.br/visualizar/abnt-nbr-nm/5276/abnt-nbr5891-regras-de-arredondamento-na-numeracao-decimal',
  },
];
