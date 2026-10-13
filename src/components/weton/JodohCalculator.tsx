/**
 * Weton jodoh: two weton (from birth dates, or picked directly) and the result of every jodoh
 * method in the registry. The chosen method is the headline, but the others stay visible:
 * the methods disagree, and hiding that is how other calculators lose people's trust.
 */
import { useMemo } from 'preact/hooks';
import { DINA, PASARAN, checkDate, wetonSlug, type Dina, type Pasaran, type Weton } from '../../lib/calendar/javanese';
import { jodohAll, wetonDay } from '../../lib/weton';
import { defaultJodohMethod, jodohMethods } from '../../lib/params/id';
import { todayIn } from '../../lib/ui/format';
import { isoDate, oneOf, type Codec } from '../../lib/ui/url-state';
import { DatePartsField, Segmented, SelectField } from '../ui/fields';
import { ACTION_LABELS_ID, ResultActions } from '../ui/result';
import { CalculatorShell, useUrlState } from '../calc/shared';
import { BULAN_NAMES, DATE_PART_LABELS, wetonName } from './copy';

type Mode = 'tanggal' | 'weton';

interface State {
  modeA: Mode;
  dateA: string;
  wetonA: string;
  modeB: Mode;
  dateB: string;
  wetonB: string;
  method: string;
}

const SLUGS = DINA.flatMap((d) => PASARAN.map((p) => wetonSlug(d, p)));
const methods = jodohMethods();
const METHOD_IDS = methods.map((m) => m.id);

const codec: Codec<State> = {
  modeA: { key: 'ma', ...oneOf<Mode>(['tanggal', 'weton']) },
  dateA: { key: 'a', ...isoDate },
  wetonA: { key: 'wa', ...oneOf(SLUGS) },
  modeB: { key: 'mb', ...oneOf<Mode>(['tanggal', 'weton']) },
  dateB: { key: 'b', ...isoDate },
  wetonB: { key: 'wb', ...oneOf(SLUGS) },
  method: { key: 'm', ...oneOf(METHOD_IDS) },
};

const makeDefaults = (): State => ({
  modeA: 'tanggal',
  dateA: '',
  wetonA: 'minggu-legi',
  modeB: 'tanggal',
  dateB: '',
  wetonB: 'minggu-legi',
  method: defaultJodohMethod().id,
});

const MODE_OPTIONS = [
  { value: 'tanggal', label: 'Tanggal lahir' },
  { value: 'weton', label: 'Sudah tahu weton' },
] as const;

const DINA_OPTIONS = DINA.map((d) => ({ value: d, label: d }));
const PASARAN_OPTIONS = PASARAN.map((p) => ({ value: p, label: p }));

function slugToWeton(slug: string): Weton {
  const [d = 'minggu', p = 'legi'] = slug.split('-');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return { dina: cap(d) as Dina, pasaran: cap(p) as Pasaran };
}

interface Resolved {
  weton: Weton | null;
  error?: string | undefined;
  from?: string | undefined;
}

function resolve(mode: Mode, date: string, slug: string): Resolved {
  if (mode === 'weton') return { weton: slugToWeton(slug) };
  if (!date) return { weton: null };
  const err = checkDate(date);
  if (err)
    return {
      weton: null,
      error: err === 'out-of-range' ? 'Kami menghitung tahun 1900 sampai 2100.' : 'Tanggal itu tidak ada di kalender.',
    };
  return { weton: wetonDay(date).weton, from: date };
}

const todayJakarta = () => todayIn('Asia/Jakarta');
const SHELL_LABELS = { form: 'Data dua orang untuk hitungan jodoh', barLink: 'Lihat semua metode' };

function Person({
  title,
  mode,
  date,
  slug,
  error,
  onMode,
  onDate,
  onWeton,
  name,
}: {
  title: string;
  mode: Mode;
  date: string;
  slug: string;
  error?: string | undefined;
  onMode: (m: Mode) => void;
  onDate: (iso: string) => void;
  onWeton: (slug: string) => void;
  name: string;
}) {
  const w = slugToWeton(slug);
  return (
    <fieldset class="field person">
      <legend class="person__title">{title}</legend>
      <Segmented
        legend={`Cara mengisi untuk ${title.toLowerCase()}`}
        legendHidden
        name={`${name}-mode`}
        value={mode}
        options={MODE_OPTIONS}
        onChange={onMode}
      />
      {mode === 'tanggal' ? (
        <DatePartsField
          legend="Tanggal lahir"
          name={name}
          value={date}
          onChange={(iso) => onDate(iso ?? '')}
          monthNames={BULAN_NAMES}
          labels={DATE_PART_LABELS}
          error={error}
        />
      ) : (
        <div class="field-pair">
          <SelectField
            label="Hari"
            name={`${name}-dina`}
            value={w.dina}
            options={DINA_OPTIONS}
            onChange={(d) => onWeton(wetonSlug(d, w.pasaran))}
          />
          <SelectField
            label="Pasaran"
            name={`${name}-pasaran`}
            value={w.pasaran}
            options={PASARAN_OPTIONS}
            onChange={(p) => onWeton(wetonSlug(w.dina, p))}
          />
        </div>
      )}
    </fieldset>
  );
}

export default function JodohCalculator({ buildDay }: { buildDay: string }) {
  const [st, set] = useUrlState(codec, makeDefaults, buildDay, todayJakarta);
  const a = resolve(st.modeA, st.dateA, st.wetonA);
  const b = resolve(st.modeB, st.dateB, st.wetonB);
  const outcomes = useMemo(() => (a.weton && b.weton ? jodohAll(a.weton, b.weton) : null), [a.weton, b.weton]);
  const chosen = outcomes?.find((o) => o.method.id === st.method) ?? outcomes?.[0] ?? null;

  const form = (
    <>
      <Person
        title="Orang pertama"
        name="a"
        mode={st.modeA}
        date={st.dateA}
        slug={st.wetonA}
        error={a.error}
        onMode={(modeA) => set({ modeA })}
        onDate={(dateA) => set({ dateA })}
        onWeton={(wetonA) => set({ wetonA })}
      />
      <Person
        title="Orang kedua"
        name="b"
        mode={st.modeB}
        date={st.dateB}
        slug={st.wetonB}
        error={b.error}
        onMode={(modeB) => set({ modeB })}
        onDate={(dateB) => set({ dateB })}
        onWeton={(wetonB) => set({ wetonB })}
      />
      <Segmented
        legend="Metode hitungan"
        name="metode"
        value={st.method}
        options={methods.map((m) => ({ value: m.id, label: m.short }))}
        onChange={(method) => set({ method })}
        hint={`Bawaan: ${defaultJodohMethod().short}, metode yang paling banyak dipakai. Hasil semua metode tetap ditampilkan.`}
      />
    </>
  );

  if (!outcomes || !chosen || !a.weton || !b.weton) {
    return (
      <CalculatorShell
        resultLabel="Hasil jodoh"
        headline={null}
        empty="Isi tanggal lahir atau weton kedua orang."
        form={form}
        result={null}
        tool="jodoh"
        labels={SHELL_LABELS}
        anchor="jodoh-semua"
      />
    );
  }

  const nameA = wetonName(a.weton);
  const nameB = wetonName(b.weton);
  const summary = () =>
    [
      `Weton jodoh: ${nameA} (neptu ${chosen.neptuA}) dan ${nameB} (neptu ${chosen.neptuB}), jumlah ${chosen.total}`,
      ...outcomes.map(
        (o) =>
          `${o.method.short}: ${o.result.label} (${o.total} ÷ ${o.method.divisor} sisa ${o.remainder}${o.remainder === 0 ? `, dihitung ${o.counted}` : ''})`,
      ),
      '',
      'Hitungan primbon ini tradisi budaya, bukan kepastian.',
      window.location.href,
    ].join('\n');

  const result = (
    <div class="jodoh-result">
      <table class="breakdown" id="jodoh-hitungan">
        <caption class="breakdown__caption">Hitungan {chosen.method.short}</caption>
        <thead class="sr-only">
          <tr>
            <th scope="col">Langkah</th>
            <th scope="col">Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr class="breakdown__row">
            <th scope="row" class="breakdown__concept">
              <span class="breakdown__label">{nameA}</span>
              <span class="breakdown__detail">orang pertama{a.from ? `, lahir ${a.from.split('-').reverse().join('/')}` : ''}</span>
            </th>
            <td class="breakdown__amount">{chosen.neptuA}</td>
          </tr>
          <tr class="breakdown__row">
            <th scope="row" class="breakdown__concept">
              <span class="breakdown__label">{nameB}</span>
              <span class="breakdown__detail">orang kedua{b.from ? `, lahir ${b.from.split('-').reverse().join('/')}` : ''}</span>
            </th>
            <td class="breakdown__amount">{chosen.neptuB}</td>
          </tr>
          <tr class="breakdown__row breakdown__row--subtotal">
            <th scope="row" class="breakdown__concept">
              <span class="breakdown__label">Jumlah neptu</span>
            </th>
            <td class="breakdown__amount">{chosen.total}</td>
          </tr>
          <tr class="breakdown__row breakdown__row--total">
            <th scope="row" class="breakdown__concept">
              <span class="breakdown__label">{chosen.result.label}</span>
              <span class="breakdown__detail">
                {chosen.total} ÷ {chosen.method.divisor} = {chosen.quotient} sisa {chosen.remainder}
                {chosen.remainder === 0 ? `, sisa 0 dihitung ${chosen.counted}` : ''}
              </span>
            </th>
            <td class="breakdown__amount">{chosen.counted}</td>
          </tr>
        </tbody>
      </table>
      <p class={`jodoh-meaning jodoh-meaning--${chosen.result.tone}`}>{chosen.result.summary}</p>

      <div class="table-scroll" id="jodoh-semua" tabIndex={0} role="region" aria-label="Hasil semua metode">
        <table class="data-table jodoh-table">
          <caption>Semua metode untuk pasangan ini</caption>
          <thead>
            <tr>
              <th scope="col">Metode</th>
              <th scope="col" class="num">
                Sisa
              </th>
              <th scope="col">Hasil</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr key={o.method.id} class={o.method.id === chosen.method.id ? 'highlight-row' : undefined}>
                <th scope="row">
                  <a href={`#metode-${o.method.id}`}>{o.method.short}</a>
                  {o.method.default ? <span class="jodoh-table__default"> (bawaan)</span> : null}
                </th>
                <td class="num">{o.counted}</td>
                <td>
                  <strong>{o.result.label}</strong>
                  <span class="facts__note">{o.result.summary}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="calc__fine">
        Primbon adalah warisan budaya, bukan ramalan pasti. Banyak keluarga memakainya sebagai bahan pertimbangan, bukan penentu.
      </p>
      <ResultActions tool="jodoh" labels={ACTION_LABELS_ID} shareTitle={`Weton jodoh ${nameA} dan ${nameB}`} summary={summary} />
    </div>
  );

  return (
    <CalculatorShell
      resultLabel={`Hasil ${chosen.method.short}`}
      headline={chosen.counted}
      headlineText={chosen.result.label}
      display={<span class="weton-name">{chosen.result.label}</span>}
      headlineNote={
        <>
          {nameA} + {nameB}: neptu {chosen.neptuA} + {chosen.neptuB} = {chosen.total}
        </>
      }
      empty={null}
      form={form}
      result={result}
      tool="jodoh"
      labels={SHELL_LABELS}
      anchor="jodoh-semua"
    />
  );
}
