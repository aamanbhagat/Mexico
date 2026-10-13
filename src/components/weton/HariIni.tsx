/**
 * Weton hari ini. The HTML is rendered at build time; on load the island recomputes everything
 * for today's date in WIB (Asia/Jakarta) on the visitor's device, so the page is never stale
 * even between daily rebuilds. No network request is involved.
 */
import { useEffect, useState } from 'preact/hooks';
import { addDays } from '../../lib/engine/dates';
import { nextWetonDates, wetonSlug } from '../../lib/calendar/javanese';
import { keblatOf, wetonDay } from '../../lib/weton';
import { todayIn } from '../../lib/ui/format';
import Keblat from './Keblat';
import { BASIS_LABEL, hijriShort, jawaShort, tanggal, tanggalHari, wetonName } from './copy';

interface Props {
  buildDay: string;
  /** Short version for the /id/ home page. */
  compact?: boolean;
}

export default function HariIni({ buildDay, compact = false }: Props) {
  const [today, setToday] = useState(buildDay);
  useEffect(() => {
    const sync = () => setToday(todayIn('Asia/Jakarta'));
    sync();
    // Keep an open tab right after midnight WIB, and when the tab comes back to the foreground.
    const timer = setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const d = wetonDay(today);
  const tomorrow = wetonDay(addDays(today, 1));
  const name = wetonName(d.weton);
  const keblat = keblatOf(d.weton.pasaran);
  const slug = wetonSlug(d.weton.dina, d.weton.pasaran);

  if (compact) {
    return (
      <p class="today-compact" data-today={today}>
        <span class="today-compact__date">{tanggalHari(today)}</span>
        <a class="today-compact__weton" href={`/id/weton/${slug}/`}>
          {name}
        </a>
        <span class="today-compact__more">
          neptu {d.neptu.total}, {jawaShort(d.javanese)}
        </span>
      </p>
    );
  }

  const week = Array.from({ length: 7 }, (_, i) => wetonDay(addDays(today, i + 1)));
  const [jumatKliwon] = nextWetonDates(addDays(today, 1), { dina: 'Jumat', pasaran: 'Kliwon' }, 1);
  const [selasaKliwon] = nextWetonDates(addDays(today, 1), { dina: 'Selasa', pasaran: 'Kliwon' }, 1);

  return (
    <section class="today" aria-labelledby="hari-ini-judul" data-today={today}>
      <h2 class="today__date" id="hari-ini-judul">
        {tanggalHari(today)}
      </h2>
      <p class="today__weton">
        <a href={`/id/weton/${slug}/`}>{name}</a>
      </p>
      <p class="today__neptu">
        Neptu {d.neptu.total} = {d.weton.dina} {d.neptu.dina} + {d.weton.pasaran} {d.neptu.pasaran}
      </p>
      <dl class="facts today__facts">
        <div>
          <dt>Tanggal Jawa</dt>
          <dd>
            {jawaShort(d.javanese)}
            <span class="facts__note">
              tahun {d.javanese.tahun}, windu {d.javanese.windu}
            </span>
          </dd>
        </div>
        <div>
          <dt>Hijriah</dt>
          <dd>
            {hijriShort(d.hijri)}
            <span class="facts__note">{BASIS_LABEL[d.hijri.basis]}</span>
          </dd>
        </div>
        <div>
          <dt>Wuku</dt>
          <dd>{d.wuku.name}</dd>
        </div>
        <div>
          <dt>Pasaran</dt>
          <dd class="weton-facts__pasaran">
            <Keblat active={d.weton.pasaran} />
            <span>
              {d.weton.pasaran}
              {keblat ? (
                <span class="facts__note">
                  arah {keblat.arah}, warna {keblat.warna}
                </span>
              ) : null}
            </span>
          </dd>
        </div>
      </dl>
      <p class="today__tonight">
        Malam nanti, setelah matahari terbenam, sudah terhitung <strong>malam {wetonName(tomorrow.weton)}</strong>: dalam tradisi Jawa hari
        berganti saat magrib, bukan tengah malam.
      </p>
      <h3 class="today__subhead">Tujuh hari ke depan</h3>
      <ol class="today__week">
        {week.map((w) => (
          <li key={w.iso} data-pasaran={w.weton.pasaran}>
            <a href={`/id/weton/${wetonSlug(w.weton.dina, w.weton.pasaran)}/`}>
              <span class="today__week-date">{tanggal(w.iso).replace(/ \d{4}$/, '')}</span>
              <span class="today__week-weton">{wetonName(w.weton)}</span>
              <span class="today__week-neptu">neptu {w.neptu.total}</span>
            </a>
          </li>
        ))}
      </ol>
      <p class="today__next">
        Jumat Kliwon berikutnya: <a href="/id/weton/jumat-kliwon/">{tanggal(jumatKliwon as string)}</a> (malam Jumat Kliwon jatuh pada Kamis
        malam sebelumnya). Selasa Kliwon (Anggara Kasih) berikutnya:{' '}
        <a href="/id/weton/selasa-kliwon/">{tanggal(selasaKliwon as string)}</a>.
      </p>
    </section>
  );
}
