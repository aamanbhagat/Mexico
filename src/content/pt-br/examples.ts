/**
 * Worked examples for the pt-BR land-unit pages. The same objects drive the golden tests in
 * tests/unit/land-units/golden.test.ts, so a page never shows a figure the engine disagrees with.
 *
 * `expected` figures come from an independent re-derivation with Python Fractions
 * (tests/golden/land_units.py), not from the TypeScript engine.
 */
export interface ExampleSource {
  label: string;
  url: string;
}

export interface AreaExample {
  id: string;
  kind: 'area';
  title: string;
  /** One or two sentences in natural pt-BR describing the case. */
  story: string;
  amount: string;
  from: string;
  to: string;
  /** Exact result as a canonical decimal, or null when it has no finite expansion. */
  exact: string | null;
  /** Result rounded to 4 decimals (ABNT NBR 5891). */
  rounded4: string;
  source: ExampleSource;
}

export interface PriceExample {
  id: string;
  kind: 'price';
  title: string;
  story: string;
  price: string;
  per: string;
  to: string;
  exact: string | null;
  rounded2: string;
  source: ExampleSource;
}

export type LandExample = AreaExample | PriceExample;

const IEA: ExampleSource = {
  label: 'IEA-SP, convenção alqueire paulista = 2,42 ha',
  url: 'https://iea.agricultura.sp.gov.br/ftpiea/IE/2016/ie-0816.pdf',
};
const IBGE_1950: ExampleSource = {
  label: 'IBGE, Revista Brasileira de Geografia (1950): 5,98 acres ou 24 200 m²',
  url: 'https://biblioteca.ibge.gov.br/visualizacao/periodicos/115/rbg_1950_v12_n3.pdf',
};
const INDA: ExampleSource = {
  label: 'Tabela de medidas agrárias não decimais (INDA/MDA)',
  url: 'https://www.ipeadata.gov.br/doc/TABELA_MEDIDA_AGRARIA_NAO_DECIMAL.pdf',
};
const CANAL_RURAL: ExampleSource = {
  label: 'Canal Rural, medição de terras: litro = 605 m²; mineiro = 80 litros',
  url: 'https://www.canalrural.com.br/programas/especialistas-mostram-como-realizado-processo-medicao-terras-26577/',
};
const BOLEMA: ExampleSource = {
  label: 'Bolema (SciELO): tarefa = 4 quadras de 15 braças = 4.356 m²',
  url: 'https://www.scielo.br/j/bolema/a/LM5VKtbPWQSbVdnFcb5pjZs/?lang=pt',
};
const UFAL: ExampleSource = {
  label: 'UFAL, questão de concurso: tarefa de 25 × 25 braças',
  url: 'https://www.qconcursos.com/questoes-de-concursos/questoes/6b3a0dfdfdb',
};

export const EXAMPLES = {
  sitio3Paulistas: {
    id: 'sitio-3-paulistas',
    kind: 'area',
    title: 'Sítio de 3 alqueires paulistas',
    story: 'Um sítio no interior de São Paulo anunciado com 3 alqueires. Cada alqueire paulista tem 2,42 ha.',
    amount: '3',
    from: 'alqueire-paulista',
    to: 'ha',
    exact: '7.26',
    rounded4: '7.2600',
    source: IEA,
  },
  paulistaEmAcres: {
    id: 'paulista-em-acres',
    kind: 'area',
    title: 'Um alqueire paulista em acres',
    story: 'O IBGE já publicava em 1950 que cada alqueire paulista equivale a 5,98 acres ou 24.200 m².',
    amount: '1',
    from: 'alqueire-paulista',
    to: 'acre',
    exact: null,
    rounded4: '5.9800',
    source: IBGE_1950,
  },
  fazenda120Goiano: {
    id: 'fazenda-120ha-goiano',
    kind: 'area',
    title: 'Fazenda de 120 ha em alqueires goianos',
    story: 'O CCIR traz 120 hectares e o vizinho fala em alqueires goianos (4,84 ha cada).',
    amount: '120',
    from: 'ha',
    to: 'alqueire-mineiro',
    exact: null,
    rounded4: '24.7934',
    source: INDA,
  },
  litrosPorMineiro: {
    id: 'litros-por-mineiro',
    kind: 'area',
    title: '80 litros fazem um alqueire mineiro',
    story: 'Com o litro de 605 m², 80 litros de terra somam 48.400 m², exatamente um alqueire mineiro.',
    amount: '80',
    from: 'litro',
    to: 'alqueire-mineiro',
    exact: '1',
    rounded4: '1.0000',
    source: CANAL_RURAL,
  },
  litrosPorPaulista: {
    id: 'litros-por-paulista',
    kind: 'area',
    title: '40 litros fazem um alqueire paulista',
    story: 'O alqueire paulista tem metade do mineiro: 40 litros de 605 m² dão 24.200 m².',
    amount: '40',
    from: 'litro',
    to: 'alqueire-paulista',
    exact: '1',
    rounded4: '1.0000',
    source: CANAL_RURAL,
  },
  baiano2: {
    id: 'baiano-2',
    kind: 'area',
    title: '2 alqueires baianos em hectares',
    story: 'Uma roça na Bahia com 2 alqueires, lidos como alqueire baiano de 100 × 200 braças (9,68 ha).',
    amount: '2',
    from: 'alqueire-baiano',
    to: 'ha',
    exact: '19.36',
    rounded4: '19.3600',
    source: INDA,
  },
  baiano2ComoMineiro: {
    id: 'baiano-2-como-mineiro',
    kind: 'area',
    title: 'Os mesmos 2 alqueires lidos como 100 × 100 braças',
    story: 'A tabela INDA/MDA também registra na Bahia o alqueire de 4,84 ha. Lida assim, a mesma roça tem metade da área.',
    amount: '2',
    from: 'alqueire-mineiro',
    to: 'ha',
    exact: '9.68',
    rounded4: '9.6800',
    source: INDA,
  },
  alqueiraoEmBaianos: {
    id: 'alqueirao-em-baianos',
    kind: 'area',
    title: 'Um alqueirão em alqueires baianos',
    story: 'O alqueirão de 200 × 200 braças (19,36 ha) tem exatamente dois alqueires baianos.',
    amount: '1',
    from: 'alqueirao',
    to: 'alqueire-baiano',
    exact: '2',
    rounded4: '2.0000',
    source: INDA,
  },
  hectaresEmBaianos: {
    id: 'hectares-em-baianos',
    kind: 'area',
    title: '100 ha em alqueires baianos',
    story: 'Uma área de 100 hectares descrita para um comprador baiano.',
    amount: '100',
    from: 'ha',
    to: 'alqueire-baiano',
    exact: null,
    rounded4: '10.3306',
    source: INDA,
  },
  norte5: {
    id: 'norte-5',
    kind: 'area',
    title: '5 alqueires do Norte em hectares',
    story: 'Um lote no Pará com 5 alqueires de 75 × 75 braças (27.225 m² cada).',
    amount: '5',
    from: 'alqueire-norte',
    to: 'ha',
    exact: '13.6125',
    rounded4: '13.6125',
    source: INDA,
  },
  norte100: {
    id: 'norte-100',
    kind: 'area',
    title: '100 alqueires do Norte: o arredondamento pesa',
    story: 'Com 27.225 m² por alqueire são 272,25 ha. Quem usa 27.200 m² (2,72 ha) chega a 272 ha e perde 2.500 m².',
    amount: '100',
    from: 'alqueire-norte',
    to: 'ha',
    exact: '272.25',
    rounded4: '272.2500',
    source: INDA,
  },
  tarefasBaianas10: {
    id: 'tarefas-baianas-10',
    kind: 'area',
    title: '10 tarefas baianas em hectares',
    story: 'Uma roça de cacau no sul da Bahia com 10 tarefas de 30 × 30 braças.',
    amount: '10',
    from: 'tarefa-baiana',
    to: 'ha',
    exact: '4.356',
    rounded4: '4.3560',
    source: BOLEMA,
  },
  tarefasCearenses5: {
    id: 'tarefas-cearenses-5',
    kind: 'area',
    title: '5 tarefas cearenses em hectares',
    story: 'No Ceará a tarefa tem 3.630 m², menor que a baiana.',
    amount: '5',
    from: 'tarefa-cearense',
    to: 'ha',
    exact: '1.815',
    rounded4: '1.8150',
    source: INDA,
  },
  tarefasAlSe20: {
    id: 'tarefas-al-se-20',
    kind: 'area',
    title: '20 tarefas em Sergipe ou Alagoas',
    story: 'Com a tarefa de 3.053 m² da tabela oficial dá 6,106 ha; com a de 25 × 25 braças (3.025 m²), 6,05 ha.',
    amount: '20',
    from: 'tarefa-al-se',
    to: 'ha',
    exact: '6.106',
    rounded4: '6.1060',
    source: INDA,
  },
  tarefas25x25: {
    id: 'tarefas-25x25-20',
    kind: 'area',
    title: '20 tarefas de 25 × 25 braças',
    story: 'Na zona canavieira de Alagoas a tarefa de 25 × 25 braças (55 × 55 m) também é usada.',
    amount: '20',
    from: 'tarefa-25x25',
    to: 'ha',
    exact: '6.05',
    rounded4: '6.0500',
    source: UFAL,
  },
  litros12: {
    id: 'litros-12',
    kind: 'area',
    title: 'Escritura antiga com 12 litros de terra',
    story: 'Uma escritura do interior de Minas descreve a área como 12 litros de terra.',
    amount: '12',
    from: 'litro',
    to: 'm2',
    exact: '7260',
    rounded4: '7260.0000',
    source: CANAL_RURAL,
  },
  hectares50Paulista: {
    id: 'hectares-50-paulista',
    kind: 'area',
    title: '50 ha em alqueires paulistas',
    story: 'Uma fazenda de 50 hectares no Paraná, onde o alqueire usado é o paulista.',
    amount: '50',
    from: 'ha',
    to: 'alqueire-paulista',
    exact: null,
    rounded4: '20.6612',
    source: IEA,
  },
  hectares50Mineiro: {
    id: 'hectares-50-mineiro',
    kind: 'area',
    title: '50 ha em alqueires mineiros',
    story: 'A mesma área em Minas Gerais ou Goiás: quase metade do número de alqueires.',
    amount: '50',
    from: 'ha',
    to: 'alqueire-mineiro',
    exact: null,
    rounded4: '10.3306',
    source: INDA,
  },
  hectare1Paulista: {
    id: 'hectare-1-paulista',
    kind: 'area',
    title: 'Um hectare em alqueire paulista',
    story: 'Um hectare (100 × 100 m) é pouco mais de 41 % de um alqueire paulista.',
    amount: '1',
    from: 'ha',
    to: 'alqueire-paulista',
    exact: null,
    rounded4: '0.4132',
    source: IEA,
  },
  precoPaulista: {
    id: 'preco-paulista',
    kind: 'price',
    title: 'R$ 72.600 o alqueire paulista',
    story: 'Um anúncio pede R$ 72.600 por alqueire paulista. Por hectare, divida por 2,42.',
    price: '72600',
    per: 'alqueire-paulista',
    to: 'ha',
    exact: '30000',
    rounded2: '30000.00',
    source: IEA,
  },
  precoMineiro: {
    id: 'preco-mineiro',
    kind: 'price',
    title: 'R$ 150.000 o alqueire mineiro',
    story: 'Em Minas o alqueire tem 4,84 ha, então o mesmo preço por alqueire vale menos por hectare.',
    price: '150000',
    per: 'alqueire-mineiro',
    to: 'ha',
    exact: null,
    rounded2: '30991.74',
    source: INDA,
  },
} as const satisfies Record<string, LandExample>;

export type ExampleKey = keyof typeof EXAMPLES;
