/**
 * Result display: animated headline amount, the per-concept breakdown with legal references,
 * and the copy / share / PDF actions.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { spring } from 'motion';
import { formatMoney } from '../../lib/ui/format';

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
export function AnimatedMoney({ value, class: cls }: { value: number; class?: string }) {
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
      <span aria-hidden="true">{formatMoney(Math.round(shown * 100) / 100)}</span>
      <span class="sr-only">{formatMoney(value)}</span>
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
  /** Plain-text summary for the clipboard. */
  summary: () => string;
  /** Builds and downloads the PDF (imported lazily). */
  onPdf: () => Promise<void>;
  shareTitle: string;
  disabled?: boolean;
}

type Feedback = '' | 'copied' | 'shared' | 'link' | 'pdf' | 'error';

const FEEDBACK: Record<Exclude<Feedback, ''>, string> = {
  copied: 'Resumen copiado',
  shared: 'Listo para compartir',
  link: 'Enlace copiado',
  pdf: 'PDF descargado',
  error: 'No se pudo completar. Intenta de nuevo.',
};

export function ResultActions({ summary, onPdf, shareTitle, disabled }: ActionsProps) {
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
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback('link');
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') setFeedback('error');
    }
  };
  const pdf = async () => {
    try {
      await onPdf();
      setFeedback('pdf');
    } catch {
      setFeedback('error');
    }
  };

  return (
    <div class="actions">
      <div class="actions__row">
        <button type="button" class="btn btn--quiet" onClick={copy} disabled={disabled}>
          <Icon name="copy" />
          Copiar
        </button>
        <button type="button" class="btn btn--quiet" onClick={share} disabled={disabled}>
          <Icon name="share" />
          Compartir
        </button>
        <button type="button" class="btn btn--quiet" onClick={pdf} disabled={disabled}>
          <Icon name="pdf" />
          Descargar PDF
        </button>
      </div>
      <p class="actions__feedback" role="status" aria-live="polite">
        {feedback ? FEEDBACK[feedback] : ''}
      </p>
    </div>
  );
}

export function Icon({ name }: { name: 'copy' | 'share' | 'pdf' | 'info' | 'alert' }) {
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
