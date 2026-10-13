/**
 * Brazilian land-unit converter (BR-01): area in any regional unit ↔ ha, m², acre and every
 * other variant; a state selector that shows the value used and its source; a to-scale plan;
 * and a price-per-area normaliser. Exact arithmetic (src/lib/land-units), pt-BR formatting.
 * Everything runs in the browser and lives in the URL, so a link reproduces the conversion.
 */
import { useMemo, useState } from 'preact/hooks';
import { BR_LAND } from '../../lib/params/br';
import {
  autoDecimals,
  convertArea,
  convertPrice,
  dimsInMeters,
  fromNumber,
  parseLocaleNumber,
  regionDiverges,
  regionVariants,
  squareSide,
  toNumber,
  type CompiledUnit,
  type Rational,
} from '../../lib/land-units';
import { nullableNum, oneOf, type Codec } from '../../lib/ui/url-state';
import { MoneyField, SelectField, type SelectGroup } from '../ui/fields';
import { AnimatedNumber, Icon, ResultActions } from '../ui/result';
import { CalculatorShell, Disclosure, Notice, useUrlState } from './shell';
import {
  FAMILY_LABEL,
  IN_STATE,
  KIND_LABEL,
  UNIT_GROUPS,
  brl,
  capitalize,
  countOf,
  isExact,
  num,
  numFromFloat,
  shortUnit,
  singular,
  sizeOf,
} from '../../content/pt-br/land-text';

/* Data ------------------------------------------------------------------------------------------- */

const UNITS = BR_LAND.units;
const UNIT_IDS = UNITS.map((u) => u.id);
const unit = (id: string): CompiledUnit => BR_LAND.byId.get(id) ?? (BR_LAND.byId.get('ha') as CompiledUnit);
const HA = unit('ha');
const STATES = Object.entries(BR_LAND.raw.states).sort((a, b) => a[1].name.localeCompare(b[1].name, 'pt-BR'));
const UF_CODES = STATES.map(([code]) => code);

const UNIT_OPTIONS: SelectGroup<string>[] = UNIT_GROUPS.map((g) => ({
  label: g.label,
  options: UNITS.filter((u) => g.families.includes(u.family)).map((u) => ({
    value: u.id,
    label: u.family === 'base' ? `${u.name} (${u.symbol})` : `${u.name} (${sizeOf(u, HA)})`,
  })),
}));

const STATE_OPTIONS = [
  { value: '', label: 'Todos os estados' },
  ...STATES.map(([code, s]) => ({ value: code, label: `${s.name} (${code})` })),
];

/* State ------------------------------------------------------------------------------------------ */

export interface ConverterPreset {
  from: string;
  to: string;
  quantity?: number;
  uf?: string;
  priceUnit?: string;
}

interface State {
  q: number | null;
  de: string;
  para: string;
  uf: string;
  pr: number | null;
  pu: string;
}

const codec: Codec<State> = {
  q: { key: 'q', ...nullableNum(0, 1e12) },
  de: { key: 'de', ...oneOf(UNIT_IDS) },
  para: { key: 'para', ...oneOf(UNIT_IDS) },
  uf: { key: 'uf', ...oneOf(['', ...UF_CODES]) },
  pr: { key: 'pr', ...nullableNum(0, 1e13) },
  pu: { key: 'pu', ...oneOf(['', ...UNIT_IDS]) },
};

/** "" = the price follows the converter's regional unit until someone picks another. */
function defaultsFor(p: ConverterPreset): State {
  return { q: p.quantity ?? 1, de: p.from, para: p.to, uf: p.uf ?? '', pr: null, pu: p.priceUnit ?? '' };
}

/** Query string that opens the converter on a worked example (used by the static pages). */
export function converterSearch(preset: ConverterPreset, patch: Partial<State>): string {
  const params = new URLSearchParams();
  const d = defaultsFor(preset);
  const s = { ...d, ...patch };
  for (const key of Object.keys(codec) as (keyof State)[]) {
    const v = s[key];
    if (Object.is(v, d[key]) || v === null || v === '') continue;
    params.set(codec[key].key, String(v));
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

/** The state's usual variant for a unit's family, or the unit itself when the state has none (or several). */
function pickFor(uf: string, id: string): string {
  const u = unit(id);
  if (!uf || u.family === 'base') return id;
  return BR_LAND.raw.states[uf]?.defaults[u.family] ?? id;
}

const parseQty = (text: string) => {
  const r = parseLocaleNumber(text, 'pt-BR');
  return r ? toNumber(r) : null;
};
const showQty = (v: number) => num(fromNumber(v), 6);
const editQty = (v: number) => showQty(v).replace(/\./g, '');

/* Pieces ---------------------------------------------------------------------------------------- */

function SourceLine({ u }: { u: CompiledUnit }) {
  const primary = BR_LAND.raw.sources[u.sources[0] ?? ''];
  return (
    <p class="unit-card__source">
      Fonte:{' '}
      <a href={u.source_url} rel="noopener" target="_blank">
        {u.source_title}
      </a>
      {primary ? <span class="source-kind">{KIND_LABEL[primary.kind]}</span> : null}
      <span class={`verify ${u.verified ? 'verify--ok' : 'verify--pending'}`}>
        {u.verified ? 'conferido no documento original' : 'conferência no documento original pendente'}
      </span>
    </p>
  );
}

function UnitCard({ u, uf, onPick }: { u: CompiledUnit; uf: string; onPick: (id: string) => void }) {
  const dims = dimsInMeters(BR_LAND, u);
  const state = uf ? BR_LAND.raw.states[uf] : undefined;
  const inState = IN_STATE[uf] ?? `em ${state?.name ?? ''}`;
  const usual = uf ? regionVariants(BR_LAND, uf, u.family, ['usual']) : [];
  const diverges = uf ? regionDiverges(BR_LAND, uf, u.family) : false;
  const listed = usual.some((v) => v.unit.id === u.id);
  const family = FAMILY_LABEL[u.family] ?? { one: u.family, many: u.family, article: 'o' };
  const others = state && usual.length === 0 ? regionVariants(BR_LAND, uf, undefined, ['usual']) : [];

  return (
    <div class="unit-card">
      <h3 class="unit-card__title">
        {u.name}: {num(u.area, 4)} m²
      </h3>
      <p class="unit-card__body">
        {dims && u.dims
          ? `${u.dims[0]} × ${u.dims[1]} braças, ou ${num(dims[0])} × ${num(dims[1])} m. `
          : u.family === 'base'
            ? ''
            : 'As fontes dão a área, não as medidas dos lados. '}
        {u.region_label}.
      </p>
      <SourceLine u={u} />
      {state && diverges ? (
        <div class="notice notice--warning unit-card__notice" role="group" aria-label={`Valores de ${family.one} ${inState}`}>
          <Icon name="alert" />
          <div>
            <p>
              {capitalize(inState)} as fontes não concordam sobre {family.article} {family.one}. Confira na escritura ou no anúncio qual foi
              usado:
            </p>
            <div class="chip-row">
              {usual.map((v) => (
                <button
                  type="button"
                  class="chip"
                  aria-pressed={v.unit.id === u.id ? 'true' : 'false'}
                  onClick={() => onPick(v.unit.id)}
                  key={v.unit.id}
                >
                  {v.unit.name} · {sizeOf(v.unit, HA)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {state && !diverges && usual.length > 0 && !listed ? (
        <div class="notice notice--info unit-card__notice">
          <Icon name="info" />
          <div>
            <p>
              {capitalize(inState)}, {family.article} {family.one} mais citado é outro:
            </p>
            <div class="chip-row">
              {usual.map((v) => (
                <button type="button" class="chip" aria-pressed="false" onClick={() => onPick(v.unit.id)} key={v.unit.id}>
                  {v.unit.name} · {sizeOf(v.unit, HA)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {state && usual.length === 0 && u.family !== 'base' ? (
        <Notice tone="info">
          Não encontramos registro de {family.one} {inState}
          {others.length
            ? `. Lá as fontes citam ${others.map((v) => `${singular(v.unit)} (${sizeOf(v.unit, HA)})`).join(', ')}.`
            : '. Confirme no cartório qual medida aparece no documento.'}
        </Notice>
      ) : null}
    </div>
  );
}

/** The unit drawn to scale next to one hectare. Elongated strips fall back to the square of equal area. */
function ScalePlan({ u }: { u: CompiledUnit }) {
  const dims = dimsInMeters(BR_LAND, u);
  let w: number;
  let h: number;
  let exactShape = false;
  if (dims) {
    const [a, b] = dims.map(toNumber) as [number, number];
    exactShape = Math.max(a, b) / Math.min(a, b) <= 5;
    // Wider than tall, like a plot drawn on a deed.
    [w, h] = exactShape ? [Math.max(a, b), Math.min(a, b)] : [0, 0];
  } else {
    w = 0;
    h = 0;
  }
  if (!exactShape) {
    const side = squareSide(u.area);
    w = side;
    h = side;
  }
  const W = Math.max(w, 100);
  const H = Math.max(h, 100);
  const pad = W * 0.02;
  const label = exactShape
    ? `${u.name} em escala: ${num(fromNumber(w), 1)} × ${num(fromNumber(h), 1)} m, ao lado de um hectare (100 × 100 m).`
    : `${u.name} em escala, como um quadrado de mesma área (${num(fromNumber(w), 1)} m de lado), ao lado de um hectare.`;
  return (
    <figure class="scale-plan">
      <svg viewBox={`${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}`} role="img" aria-label={label} preserveAspectRatio="xMinYMax meet">
        <g transform={`translate(0 ${H}) scale(1 -1)`}>
          <rect class="scale-plan__unit" x="0" y="0" width={w} height={h} />
          <rect class="scale-plan__ha" x="0" y="0" width="100" height="100" />
        </g>
      </svg>
      <figcaption class="scale-plan__caption">
        <span class="legend-item">
          <span class="scale-plan__key scale-plan__key--unit" aria-hidden="true" />
          {exactShape
            ? `${u.name}, ${num(fromNumber(w), 1)} × ${num(fromNumber(h), 1)} m`
            : `${u.name}, quadrado de ${num(fromNumber(w), 1)} m de lado`}
        </span>
        <span class="legend-item">
          <span class="scale-plan__key scale-plan__key--ha" aria-hidden="true" />1 hectare, 100 × 100 m
        </span>
      </figcaption>
    </figure>
  );
}

function AllUnitsTable({ amount, from, focusFamily }: { amount: Rational; from: CompiledUnit; focusFamily: string }) {
  const rows = UNITS.filter((u) => u.id !== from.id).map((u) => ({ u, value: convertArea(amount, from, u) }));
  const main = rows.filter((r) => r.u.family === 'base' || r.u.family === focusFamily);
  const rest = rows.filter((r) => !main.includes(r));
  const table = (list: typeof rows, caption: string, id?: string) => (
    <table class="measure-table" id={id}>
      <caption class="measure-table__caption">{caption}</caption>
      <thead class="sr-only">
        <tr>
          <th scope="col">Medida</th>
          <th scope="col">Quantidade</th>
        </tr>
      </thead>
      <tbody>
        {list.map(({ u, value }) => (
          <tr key={u.id}>
            <th scope="row">
              <span class="measure-table__name">{u.name}</span>
              {u.family === 'base' ? null : <span class="measure-table__size">{sizeOf(u, HA)}</span>}
            </th>
            <td>
              {isExact(value) ? '' : '≈ '}
              {num(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <>
      {table(main, `${countOf(amount, from)} em outras medidas`, 'conversao-detalhes')}
      {rest.length ? (
        <Disclosure summary={`Mais ${rest.length} medidas tradicionais`}>{table(rest, 'Outras medidas tradicionais')}</Disclosure>
      ) : null}
    </>
  );
}

/* Island ---------------------------------------------------------------------------------------- */

export default function LandConverter({ preset }: { preset: ConverterPreset }) {
  const defaults = useMemo(() => defaultsFor(preset), [preset]);
  const [st, set] = useUrlState(
    codec,
    () => defaults,
    '',
    () => '',
  );
  const [spin, setSpin] = useState(0);

  const from = unit(st.de);
  const to = unit(st.para);
  const focus = from.family !== 'base' ? from : to.family !== 'base' ? to : null;
  // A negative area is an input error, never a result.
  const amount = st.q === null || st.q < 0 ? null : fromNumber(st.q);
  const result = amount ? convertArea(amount, from, to) : null;
  const places = result ? autoDecimals(result) : 4;

  const pickFocus = (id: string) => (focus === from ? set({ de: id }) : set({ para: id }));
  const onState = (uf: string) => set({ uf, de: pickFor(uf, st.de), para: pickFor(uf, st.para), pu: st.pu ? pickFor(uf, st.pu) : '' });

  const priceUnit = unit(st.pu || focus?.id || 'alqueire-paulista');
  const price =
    st.pr !== null && st.pr > 0
      ? (() => {
          const amountR = fromNumber(st.pr);
          return { amount: amountR, per: priceUnit, perHa: convertPrice(amountR, priceUnit, HA) };
        })()
      : null;
  const priceRows = price
    ? UNITS.filter(
        (u) => u.id !== priceUnit.id && u.id !== 'ha' && (u.family === 'alqueire' || u.family === 'tarefa' || u.id === 'm2'),
      ).filter((u) => !['alqueire-50x50', 'alqueire-50x75'].includes(u.id))
    : [];

  const summary = () => {
    if (!result || !amount) return '';
    const facts = [
      `${countOf(amount, from)} = ${countOf(result, to, places)}`,
      focus ? `${focus.name}: ${num(focus.area, 4)} m². Fonte: ${focus.source_title} (${focus.source_url})` : null,
      st.uf ? `Estado: ${BR_LAND.raw.states[st.uf]?.name ?? st.uf}` : null,
      price ? `${brl(price.amount)} por ${singular(price.per)} = ${brl(price.perHa)} por hectare` : null,
    ].filter((l): l is string => l !== null);
    return [
      ...facts,
      '',
      'Conversão informativa. Escritura, CCIR, CAR e ITR trazem a área oficial em hectares.',
      window.location.href,
    ].join('\n');
  };

  const form = (
    <>
      <SelectField
        name="estado"
        label="Estado do imóvel"
        value={st.uf}
        options={STATE_OPTIONS}
        onChange={onState}
        hint="Muda qual alqueire, tarefa ou quadra é usado e mostra se as fontes divergem."
      />
      <div class="conv-row">
        <MoneyField
          name="quantidade"
          label="Área"
          value={st.q}
          onChange={(q) => set({ q })}
          prefix=""
          placeholder="0"
          parse={parseQty}
          format={showQty}
          editText={editQty}
          error={st.q !== null && st.q < 0 ? 'Use um número positivo.' : undefined}
        />
        <SelectField name="de" label="Medida" value={st.de} options={UNIT_OPTIONS} onChange={(de) => set({ de })} />
      </div>
      <div class="conv-swap">
        <button
          type="button"
          class="btn btn--quiet conv-swap__btn"
          onClick={() => {
            set({ de: st.para, para: st.de });
            setSpin((n) => n + 1);
          }}
          aria-label={`Inverter: converter de ${singular(to)} para ${singular(from)}`}
        >
          <span class="conv-swap__icon" data-flipped={spin % 2 === 1 ? 'true' : 'false'}>
            <Icon name="swap" />
          </span>
          Inverter
        </button>
      </div>
      <SelectField name="para" label="Converter para" value={st.para} options={UNIT_OPTIONS} onChange={(para) => set({ para })} />
    </>
  );

  const resultBlock =
    result && amount ? (
      <>
        <p class="calc__fine conv-formula">
          {countOf(amount, from)} × {num(from.area, 4)} m² ÷ {num(to.area, 4)} m².{' '}
          {isExact(result, places) ? 'Resultado exato.' : `Arredondado na ${places}ª casa decimal (ABNT NBR 5891).`}
        </p>
        {focus ? <UnitCard key={`${focus.id}-${st.uf}`} u={focus} uf={st.uf} onPick={pickFocus} /> : null}
        {focus ? <ScalePlan key={focus.id} u={focus} /> : null}
        <AllUnitsTable amount={amount} from={from} focusFamily={focus?.family ?? 'alqueire'} />
        <ResultActions
          tool="terra"
          locale="pt-br"
          shareTitle="Conversão de medida de terra"
          summary={summary}
          onPrint={() => window.print()}
        />
      </>
    ) : null;

  return (
    <>
      <CalculatorShell
        tool="terra"
        locale="pt-br"
        resultLabel={`Em ${to.plural}`}
        headline={result ? toNumber(result) : null}
        format={(n) => {
          const shown = numFromFloat(n, places);
          return `${shown} ${shortUnit(to, shown)}`;
        }}
        round={(n) => n}
        headlineNote={result && amount ? `${countOf(amount, from)} = ${countOf(result, to, places)}` : undefined}
        empty={st.q === null ? 'Digite a área para converter.' : 'Use um número positivo.'}
        form={form}
        result={resultBlock}
        detailsHref="#conversao-detalhes"
      />

      <section class="price" aria-labelledby="preco-terra" data-tool="terra">
        <h2 id="preco-terra" class="price__title">
          Preço por alqueire ou por hectare
        </h2>
        <p class="price__intro">
          Anúncios falam em alqueire; o INCRA, os bancos e a Receita usam hectare. Digite o preço pedido para comparar os dois.
        </p>
        <div class="conv-row price__form">
          <MoneyField
            name="preco"
            label="Preço pedido"
            value={st.pr}
            onChange={(pr) => set({ pr })}
            prefix="R$"
            placeholder="0,00"
            parse={parseQty}
            format={(v) => num(fromNumber(v), 2)}
            editText={editQty}
          />
          <SelectField name="preco-por" label="Por" value={priceUnit.id} options={UNIT_OPTIONS} onChange={(pu) => set({ pu })} />
        </div>
        {price ? (
          <div class="price__result">
            <p class="price__headline">
              <AnimatedNumber value={toNumber(price.perHa)} format={(n) => brl(fromNumber(n))} />
              <span class="price__per"> por hectare</span>
            </p>
            <table class="measure-table">
              <caption class="measure-table__caption">
                {brl(price.amount)} por {singular(price.per)} equivale a
              </caption>
              <thead class="sr-only">
                <tr>
                  <th scope="col">Por</th>
                  <th scope="col">Preço</th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map((u) => (
                  <tr key={u.id}>
                    <th scope="row">
                      <span class="measure-table__name">por {singular(u)}</span>
                      {u.family === 'base' ? null : <span class="measure-table__size">{sizeOf(u, HA)}</span>}
                    </th>
                    <td>{brl(convertPrice(price.amount, price.per, u))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p class="field__hint">O resultado aparece por hectare e por cada alqueire e tarefa, com a mesma conta exata.</p>
        )}
      </section>
    </>
  );
}
