/**
 * Keblat papat lima pancer: the five pasaran on the four compass points and the centre, each in
 * its traditional colour. Decorative (aria-hidden): the pasaran, direction and colour are always
 * written next to it in text. Positions come from CSS classes (no inline styles: strict CSP).
 */
import { PASARAN, type Pasaran } from '../../lib/calendar/javanese';

export default function Keblat({ active }: { active: Pasaran }) {
  return (
    <span class="keblat" aria-hidden="true">
      {PASARAN.map((p) => (
        <i key={p} class={`keblat__cell keblat__cell--${p.toLowerCase()}${p === active ? ' is-on' : ''}`} />
      ))}
    </span>
  );
}
