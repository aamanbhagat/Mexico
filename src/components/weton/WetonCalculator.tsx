/**
 * Cek weton: a birth date in, the weton out — day, pasaran, neptu, wuku, Javanese and Hijri
 * dates — with the method visible (neptu table, which Hijri calendar, which kurup).
 */
import { useMemo } from 'preact/hooks';
import { checkDate, javaneseDate, wetonSlug } from '../../lib/calendar/javanese';
import { keblatOf, pangarasanOf, wetonDay } from '../../lib/weton';
import { defaultNeptuTable } from '../../lib/params/id';
import { formatInteger, todayIn } from '../../lib/ui/format';
import { isoDate, type Codec } from '../../lib/ui/url-state';
import { DatePartsField } from '../ui/fields';
import { AnimatedNumber, ResultActions } from '../ui/result';
import { CalculatorShell, useUrlState } from '../calc/shared';
import SelapanGrid from './SelapanGrid';
import Keblat from './Keblat';
import { BASIS_LABEL, BULAN_NAMES, DATE_PART_LABELS, daySummary, hijriShort, jawaShort, tanggalHari, wetonName } from './copy';

interface State {
  date: string;
}

const codec: Codec<State> = { date: { key: 't', ...isoDate } };
const makeDefaults = (): State => ({ date: '' });
const todayJakarta = () => todayIn('Asia/Jakarta');
const int = (n: number) => formatInteger(n, 'id-ID');

const FORM_LABEL = 'Data untuk menghitung weton';

export default function WetonCalculator({ buildDay }: { buildDay: string }) {
  const [st, set] = useUrlState(codec, makeDefaults, buildDay, todayJakarta);
  const error = st.date ? checkDate(st.date) : null;
  const day = useMemo(() => (st.date && !error ? wetonDay(st.date) : null), [st.date, error]);
  const table = defaultNeptuTable();

  const errorText =
    error === 'out-of-range'
      ? 'Kami menghitung tanggal 1 Januari 1900 sampai 31 Desember 2100.'
      : error
        ? 'Tanggal itu tidak ada di kalender. Periksa lagi.'
        : undefined;

  const form = (
    <>
      <DatePartsField
        legend="Tanggal lahir"
        name="lahir"
        value={st.date}
        onChange={(iso) => set({ date: iso ?? '' })}
        monthNames={BULAN_NAMES}
        labels={DATE_PART_LABELS}
        hint="Tanggal Masehi, seperti di akta kelahiran atau KTP."
        error={errorText}
      />
      <div class="quick-fill">
        <span>Coba:</span>
        <button type="button" class="btn btn--quiet" onClick={() => set({ date: todayJakarta() })}>
          Hari ini
        </button>
        <button type="button" class="btn btn--quiet" onClick={() => set({ date: '1945-08-17' })}>
          17 Agustus 1945
        </button>
      </div>
      <p class="calc__fine">Tanggal tidak dikirim ke mana pun: semua dihitung di perangkatmu.</p>
    </>
  );

  if (!day) {
    return (
      <CalculatorShell
        resultLabel="Weton"
        headline={null}
        empty="Masukkan tanggal lahir untuk melihat weton dan neptunya."
        form={form}
        result={null}
        tool="weton"
        locale="id"
        formLabel={FORM_LABEL}
        detailsHref="#weton-hasil"
      />
    );
  }

  const name = wetonName(day.weton);
  const keblat = keblatOf(day.weton.pasaran);
  const pangarasan = pangarasanOf(day.neptu.total);
  const aboge = javaneseDate(day.jdn, 'aboge');
  const slug = wetonSlug(day.weton.dina, day.weton.pasaran);
  const comboPath = `/id/weton/${slug}/`;

  const result = (
    <div class="weton-result" id="weton-hasil">
      <SelapanGrid table={table} active={day.weton} caption={`Letak ${name} di tabel neptu`} captionHidden />
      <dl class="facts weton-facts">
        <div>
          <dt>Tanggal Masehi</dt>
          <dd>{tanggalHari(day.iso)}</dd>
        </div>
        <div>
          <dt>Tanggal Jawa</dt>
          <dd>
            {jawaShort(day.javanese)}
            <span class="facts__note">
              tahun {day.javanese.tahun}, windu {day.javanese.windu}, kurup {day.javanese.kurup}
            </span>
          </dd>
        </div>
        <div>
          <dt>Hijriah</dt>
          <dd>
            {hijriShort(day.hijri)}
            <span class="facts__note">{BASIS_LABEL[day.hijri.basis]}</span>
          </dd>
        </div>
        <div>
          <dt>Wuku</dt>
          <dd>
            {day.wuku.name}
            <span class="facts__note">minggu ke-{day.wuku.index + 1} dari 30 dalam pawukon</span>
          </dd>
        </div>
        <div>
          <dt>Pasaran</dt>
          <dd class="weton-facts__pasaran">
            <Keblat active={day.weton.pasaran} />
            <span>
              {day.weton.pasaran}
              {keblat ? (
                <span class="facts__note">
                  arah {keblat.arah}, warna {keblat.warna}
                </span>
              ) : null}
            </span>
          </dd>
        </div>
        <div>
          <dt>Pangarasan</dt>
          <dd>
            {pangarasan.labels.length ? pangarasan.labels.map((l) => l.label).join(' / ') : '—'}
            <span class="facts__note">
              {pangarasan.labels.length > 1 ? 'istilah berbeda antarsumber; lihat bagian Sumber' : 'istilah watak menurut jumlah neptu'}
            </span>
          </dd>
        </div>
      </dl>
      {aboge.day !== day.javanese.day || aboge.monthName !== day.javanese.monthName ? (
        <p class="calc__fine">Komunitas Aboge, yang masih memakai kurup lama, menulis tanggal ini sebagai {jawaShort(aboge)}.</p>
      ) : null}
      <p class="weton-more">
        <a href={comboPath}>Tanggal {name} berikutnya dan kecocokan jodohnya</a>
      </p>
      <ResultActions
        tool="weton"
        locale="id"
        shareTitle={`Weton ${name}`}
        shareUrl={() => `${window.location.origin}${comboPath}`}
        summary={() => `${daySummary(day)}\n\nDihitung di ${window.location.href}`}
      />
    </div>
  );

  return (
    <CalculatorShell
      resultLabel="Weton"
      headline={day.neptu.total}
      headlineText={name}
      display={<span class="weton-name">{name}</span>}
      headlineNote={
        <span class="weton-formula">
          Neptu <AnimatedNumber value={day.neptu.total} format={int} class="weton-formula__n" /> = {day.weton.dina} {day.neptu.dina} +{' '}
          {day.weton.pasaran} {day.neptu.pasaran}
        </span>
      }
      empty={null}
      form={form}
      result={result}
      tool="weton"
      locale="id"
      formLabel={FORM_LABEL}
      detailsHref="#weton-hasil"
    />
  );
}
