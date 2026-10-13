/**
 * Result display: animated headline amount, the per-concept breakdown with legal references,
 * and the copy / share / PDF actions.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { spring } from 'motion';
import { formatMoney } from '../../lib/ui/format';
import { track } from '../../lib/ui/analytics';
import { CALC_UI, type UiLocale } from '../../i18n/ui';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Number roll: the figure travels from its previous value to the new one on a critically
 * damped spring (Motion's spring generator, ~2 KB) over ~220 ms, so a change reads as
 * "this went up/down" instead of a flicker. No overshoot: money never shows a value it
 * will not end at. Instant when the person asked for reduced motion. Assistive tech always
 * gets the exact final value.
 */
const toCents = (n: number) => Math.round(n * 100) / 100;

export function AnimatedNumber({
  value,
  format = formatMoney,
  round = toCents,
  class: cls,
}: {
  value: number;
  format?: (n: number) => string;
  /** Applied to in-between frames only; the settled frame shows format(value). */
  round?: ((n: number) => number) | undefined;
  class?: string;
}) {
  const [shown, setShown] = useState(value);
  const current = useRef(value);
  const mounted = useRef(false);

  useEffect(() => {
    const settle = () => {
      current.current = value;
      setShown(value);
    };
    if (!mounted.current || prefersReducedMotion() || current.current === value) {
      mounted.current = true;
      settle();
      return;
    }
    const gen = spring({ keyframes: [current.current, value], visualDuration: 0.22, bounce: 0, restDelta: 0.005 });
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const state = gen.next(elapsed);
      if (state.done || elapsed > 700) {
        settle();
        return;
      }
      current.current = state.value;
      setShown(state.value);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span class={`money ${cls ?? ''}`}>
      <span aria-hidden="true">{format(shown === value ? value : round(shown))}</span>
      <span class="sr-only">{format(value)}</span>
    </span>
  );
}

/** Polite live region that announces the final figure once typing settles. */
export function useAnnouncement(message: string, delay = 700): string {
  const [said, setSaid] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSaid(message), delay);
    return () => clearTimeout(t);
  }, [message, delay]);
  return said;
}

/* ------------------------------------------------------------------------------------------ */

export interface BreakdownLine {
  key: string;
  label: string;
  /** e.g. "9.58 días × $500.00" */
  detail?: string | undefined;
  /** e.g. ["LFT art. 87"] */
  refs?: string[] | undefined;
  amount: number;
  tone?: 'income' | 'exempt' | 'deduction' | 'subtotal' | 'total' | undefined;
}

interface BreakdownProps {
  id: string;
  caption: string;
  lines: BreakdownLine[];
}

export function Breakdown({ id, caption, lines }: BreakdownProps) {
  return (
    <table class="breakdown" id={id}>
      <caption class="breakdown__caption">{caption}</caption>
      <thead class="sr-only">
        <tr>
          <th scope="col">Concepto</th>
          <th scope="col">Importe</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.key} class={`breakdown__row breakdown__row--${l.tone ?? 'income'}`}>
            <th scope="row" class="breakdown__concept">
              <span class="breakdown__label">{l.label}</span>
              {l.detail ? <span class="breakdown__detail">{l.detail}</span> : null}
              {l.refs?.length ? <span class="breakdown__refs">{l.refs.join(' · ')}</span> : null}
            </th>
            <td class="breakdown__amount">
              {l.tone === 'deduction' ? <span class="sr-only">menos </span> : null}
              <span aria-hidden={l.tone === 'deduction' ? 'true' : undefined}>{l.tone === 'deduction' ? '−' : ''}</span>
              {formatMoney(Math.abs(l.amount))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------------------------------------ */

interface ActionsProps {
  /** Tool name for analytics events (no input values are ever sent). */
  tool?: string;
  /** Plain-text summary for the clipboard. */
  summary: () => string;
  /** Builds and downloads the PDF (imported lazily). Omit to hide the button. */
  onPdf?: (() => Promise<void>) | undefined;
  /** Opens the browser's print dialog (printable table). Omit to hide the button. */
  onPrint?: (() => void) | undefined;
  shareTitle: string;
  disabled?: boolean;
  locale?: UiLocale;
}

type Feedback = '' | 'copied' | 'shared' | 'link' | 'pdf' | 'print' | 'error';

export function ResultActions({ summary, onPdf, onPrint, shareTitle, disabled, tool = '', locale = 'es-mx' }: ActionsProps) {
  const ui = CALC_UI[locale];
  const [feedback, setFeedback] = useState<Feedback>('');
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(''), 2600);
    return () => clearTimeout(t);
  }, [feedback]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary());
      setFeedback('copied');
      track('copiar', tool);
    } catch {
      setFeedback('error');
    }
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: shareTitle, url });
        setFeedback('shared');
        track('compartir', tool);
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback('link');
        track('compartir', tool);
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') setFeedback('error');
    }
  };
  const pdf = async () => {
    if (!onPdf) return;
    try {
      await onPdf();
      setFeedback('pdf');
      track('pdf', tool);
    } catch {
      setFeedback('error');
    }
  };
  const print = () => {
    if (!onPrint) return;
    setFeedback('print');
    track('imprimir', tool);
    onPrint();
  };

  return (
    <div class="actions">
      <div class="actions__row">
        <button type="button" class="btn btn--quiet" onClick={copy} disabled={disabled}>
          <Icon name="copy" />
          {ui.copy}
        </button>
        <button type="button" class="btn btn--quiet" onClick={share} disabled={disabled}>
          <Icon name="share" />
          {ui.share}
        </button>
        {onPdf ? (
          <button type="button" class="btn btn--quiet" onClick={pdf} disabled={disabled}>
            <Icon name="pdf" />
            {ui.pdf}
          </button>
        ) : null}
        {onPrint ? (
          <button type="button" class="btn btn--quiet" onClick={print} disabled={disabled}>
            <Icon name="print" />
            {ui.print}
          </button>
        ) : null}
      </div>
      <p class="actions__feedback" role="status" aria-live="polite">
        {feedback ? ui.feedback[feedback] : ''}
      </p>
    </div>
  );
}

export function Icon({ name }: { name: 'copy' | 'share' | 'pdf' | 'print' | 'info' | 'alert' | 'swap' }) {
  const paths: Record<typeof name, ComponentChildren> = {
    copy: (
      <>
        <rect x="8" y="8" width="11" height="12" rx="1.5" />
        <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
      </>
    ),
    share: (
      <>
        <path d="M12 15V4" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
      </>
    ),
    pdf: (
      <>
        <path d="M12 4v11" />
        <path d="m8 11 4 4 4-4" />
        <path d="M5 20h14" />
      </>
    ),
    print: (
      <>
        <path d="M7 9V4h10v5" />
        <rect x="4" y="9" width="16" height="7" rx="1.5" />
        <path d="M7 14h10v6H7z" />
      </>
    ),
    swap: (
      <>
        <path d="M8 4v16" />
        <path d="m4 8 4-4 4 4" />
        <path d="M16 20V4" />
        <path d="m12 16 4 4 4-4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
    alert: (
      <>
        <path d="M12 4 3 19h18L12 4Z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
      </>
    ),
  };
  return (
    <svg
      class="icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
