/**
 * Javanese calendar pages, progressive enhancement:
 *   - marks today's cell (WIB) and reveals the "Hari ini" shortcut,
 *   - opens a detail dialog for any day (computed on the device by the same engine as the pages),
 *   - prints the calendar.
 * The pages are complete without it: every value is already in the static HTML.
 */
import { wetonDay } from '../lib/weton';
import { keblatOf, pangarasanOf } from '../lib/weton';
import { holidaysOf } from '../lib/params/id';
import { wetonSlug } from '../lib/calendar/javanese';
import { BASIS_LABEL, hijriShort, jawaShort, tanggalHari, wetonName } from '../components/weton/copy';

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
  new Date(),
);

function markToday() {
  const cell = document.querySelector<HTMLTableCellElement>(`td.kal-day[data-iso="${today}"]`);
  if (!cell) return;
  cell.classList.add('kal-day--today');
  cell.querySelector('button')?.setAttribute('aria-current', 'date');
  const month = cell.closest<HTMLElement>('.kal-month');
  document.querySelectorAll<HTMLAnchorElement>('[data-today-link]').forEach((a) => {
    if (month?.id) a.href = `#${month.id}`;
    a.hidden = false;
  });
}

function row(dl: HTMLElement, term: string, value: string, note?: string) {
  const div = document.createElement('div');
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = value;
  if (note) {
    const span = document.createElement('span');
    span.className = 'facts__note';
    span.textContent = note;
    dd.append(span);
  }
  div.append(dt, dd);
  dl.append(div);
}

function openDay(iso: string, dialog: HTMLDialogElement) {
  const d = wetonDay(iso);
  const holidays = holidaysOf(Number(iso.slice(0, 4))).filter((h) => h.date === iso);
  const slug = wetonSlug(d.weton.dina, d.weton.pasaran);
  const keblat = keblatOf(d.weton.pasaran);
  const pangarasan = pangarasanOf(d.neptu.total);
  const q = (sel: string) => dialog.querySelector<HTMLElement>(sel);
  const title = q('[data-k="title"]');
  const weton = q('[data-k="weton"]');
  const facts = q('[data-k="facts"]');
  if (!title || !weton || !facts) return;
  title.textContent = tanggalHari(iso);
  weton.textContent = `${wetonName(d.weton)}, neptu ${d.neptu.total}`;
  facts.replaceChildren();
  row(facts, 'Tanggal Jawa', jawaShort(d.javanese), `tahun ${d.javanese.tahun}, windu ${d.javanese.windu}`);
  row(facts, 'Hijriah', hijriShort(d.hijri), BASIS_LABEL[d.hijri.basis]);
  row(facts, 'Wuku', d.wuku.name);
  row(facts, 'Pasaran', d.weton.pasaran, keblat ? `arah ${keblat.arah}, warna ${keblat.warna}` : undefined);
  if (pangarasan.labels.length) row(facts, 'Pangarasan', pangarasan.labels.map((l) => l.label).join(' / '));
  for (const h of holidays) row(facts, h.kind === 'libur' ? 'Libur nasional' : 'Cuti bersama', h.name);
  const wetonLink = q('[data-k="weton-link"]') as HTMLAnchorElement | null;
  if (wetonLink) {
    wetonLink.href = `/id/weton/${slug}/`;
    wetonLink.textContent = `Tentang weton ${wetonName(d.weton)}`;
  }
  const jodohLink = q('[data-k="jodoh-link"]') as HTMLAnchorElement | null;
  if (jodohLink) jodohLink.href = `/id/weton/jodoh/?ma=weton&wa=${slug}`;
  dialog.showModal();
}

function init() {
  markToday();
  const dialog = document.querySelector<HTMLDialogElement>('#kal-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    document.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.kal-day__btn');
      if (btn?.dataset['iso']) openDay(btn.dataset['iso'], dialog);
    });
    // A click on the backdrop (outside the panel) closes the dialog.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
  document.querySelectorAll<HTMLButtonElement>('[data-print]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => window.print());
  });
}

init();
