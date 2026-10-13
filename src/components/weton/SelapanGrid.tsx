/**
 * The 35 weton as a 7 × 5 table: days (dina) in rows, pasaran in columns, neptu in each cell.
 * The selected weton is drawn the Línea way: its row and its column become two lines that cross
 * at one station holding the neptu. Rendered on the server for static pages and inside islands.
 */
import { DINA, PASARAN, type NeptuTable, type Weton } from '../../lib/calendar/javanese';

interface Props {
  table: NeptuTable;
  active?: Weton | null | undefined;
  caption: string;
  /** Hide the caption visually (still read by screen readers). */
  captionHidden?: boolean;
  /** Link each cell to its weton page. */
  hrefFor?: ((w: Weton) => string) | undefined;
}

export default function SelapanGrid({ table, active, caption, captionHidden, hrefFor }: Props) {
  return (
    <table class="selapan" data-has-active={active ? '' : undefined}>
      <caption class={captionHidden ? 'sr-only' : 'selapan__caption'}>{caption}</caption>
      <thead>
        <tr>
          <td class="selapan__corner" />
          {PASARAN.map((p) => (
            <th scope="col" key={p} class={active?.pasaran === p ? 'is-col' : undefined}>
              <span class="selapan__name">{p}</span>
              <span class="selapan__value">{table.pasaran[p]}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {DINA.map((d) => {
          const rowActive = active?.dina === d;
          return (
            <tr key={d} class={rowActive ? 'is-row' : undefined}>
              <th scope="row" class={rowActive ? 'is-row' : undefined}>
                <span class="selapan__name">{d}</span>
                <span class="selapan__value">{table.dina[d]}</span>
              </th>
              {PASARAN.map((p) => {
                const on = rowActive && active?.pasaran === p;
                const col = active?.pasaran === p;
                const n = table.dina[d] + table.pasaran[p];
                const label = `${d} ${p}`;
                return (
                  <td
                    key={p}
                    class={[on ? 'is-on' : '', col ? 'is-col' : '', rowActive ? 'is-row' : ''].filter(Boolean).join(' ') || undefined}
                    aria-current={on ? 'true' : undefined}
                  >
                    {hrefFor ? (
                      <a href={hrefFor({ dina: d, pasaran: p })} aria-label={`${label}, neptu ${n}`}>
                        <span class="selapan__n">{n}</span>
                      </a>
                    ) : (
                      <span class="selapan__n" title={label}>
                        {n}
                        {on ? <span class="sr-only"> ({label})</span> : null}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
