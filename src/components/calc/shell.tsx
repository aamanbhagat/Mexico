/**
 * The calculator shell shared by every island in every locale: URL-state hook, layout
 * (form + result panel + sticky mobile result bar), notices and disclosures.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { formatMoney, todayInMexico } from '../../lib/ui/format';
import { buildSearch, readState, writeState, type Codec } from '../../lib/ui/url-state';
import { AnimatedNumber, Icon, useAnnouncement } from '../ui/result';
import { track } from '../../lib/ui/analytics';
import { CALC_UI, type UiLocale } from '../../i18n/ui';

/* URL state ----------------------------------------------------------------------------------- */

/**
 * Calculator state mirrored in the query string. Defaults may depend on "today", which is only
 * known on the client (the HTML is built ahead of time), so they are rebuilt on mount.
 * Query parameters the calculator does not own (utm_*, …) are left untouched.
 * Returns [state, patch, today].
 */
export function useUrlState<T extends object>(
  codec: Codec<T>,
  makeDefaults: (today: string) => T,
  buildDay: string,
  clock: () => string = todayInMexico,
): [T, (patch: Partial<T>) => void, string] {
  const [today, setToday] = useState(buildDay);
  const defaults = useRef<T>(makeDefaults(buildDay));
  const [state, setState] = useState<T>(defaults.current);
  const ready = useRef(false);

  useEffect(() => {
    const now = clock();
    defaults.current = makeDefaults(now);
    setToday(now);
    const initial = makeDefaults(buildDay);
    setState((prev) => {
      const next = readState(codec, defaults.current, window.location.search);
      // Keep anything the person changed before hydration (fields report it on mount).
      for (const key of Object.keys(prev) as (keyof T)[]) {
        if (!Object.is(prev[key], initial[key])) next[key] = prev[key];
      }
      return next;
    });
    ready.current = true;
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready.current) writeState(buildSearch(codec, state, defaults.current, window.location.search));
  }, [state, codec]);

  return [state, (patch) => setState((prev) => ({ ...prev, ...patch })), today];
}

/* Layout shell ---------------------------------------------------------------------------------- */

interface ShellProps {
  /** Short name for headings: "Tu aguinaldo". */
  resultLabel: string;
  headline: number | null;
  /** Shown under the headline: "Bruto $7,500.00 · ISR −$769.99". */
  headlineNote?: ComponentChildren;
  empty: string | null;
  form: ComponentChildren;
  result: ComponentChildren;
  tool: string;
  /** How the headline figure is written (money by default). */
  format?: (n: number) => string;
  /** Rounding applied to animation frames before formatting (cents by default). */
  round?: (n: number) => number;
  locale?: UiLocale;
  /** Where the sticky bar's "details" link points (default: the breakdown table). */
  detailsHref?: string;
}

export function CalculatorShell({
  resultLabel,
  headline,
  headlineNote,
  empty,
  form,
  result,
  tool,
  format = formatMoney,
  round,
  locale = 'es-mx',
  detailsHref,
}: ShellProps) {
  const ui = CALC_UI[locale];
  const announcement = useAnnouncement(headline === null ? '' : `${resultLabel}: ${format(headline)}`);
  // One "calculo" event per page view, the first time a result appears (completion-rate KPI).
  const counted = useRef(false);
  useEffect(() => {
    if (headline !== null && !counted.current && announcement) {
      counted.current = true;
      track('calculo', tool);
    }
  }, [headline, announcement, tool]);
  return (
    <div class="calc" data-tool={tool}>
      <form class="calc__form" onSubmit={(e) => e.preventDefault()} aria-label={ui.formLabel} noValidate>
        {form}
      </form>
      <section class="calc__result" aria-labelledby={`${tool}-result-title`}>
        <div class="result-head">
          <h2 class="result-head__label" id={`${tool}-result-title`}>
            {resultLabel}
          </h2>
          {headline === null ? (
            <p class="result-head__empty">{empty}</p>
          ) : (
            <>
              <p class="result-head__amount">
                <AnimatedNumber value={headline} format={format} round={round} />
              </p>
              {headlineNote ? <p class="result-head__note">{headlineNote}</p> : null}
            </>
          )}
        </div>
        {headline === null ? null : result}
        <p class="sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>
      <div class="result-bar" aria-hidden={headline === null ? 'true' : undefined}>
        <span class="result-bar__label">{resultLabel}</span>
        <span class="result-bar__amount">{headline === null ? '—' : format(headline)}</span>
        <a class="result-bar__link" href={detailsHref ?? `#${tool}-desglose`} tabIndex={headline === null ? -1 : undefined}>
          {ui.seeDetails}
        </a>
      </div>
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: ComponentChildren }) {
  return (
    <p class={`notice notice--${tone}`}>
      <Icon name={tone === 'warning' ? 'alert' : 'info'} />
      <span>{children}</span>
    </p>
  );
}

export function Disclosure({ summary, children }: { summary: string; children: ComponentChildren }) {
  return (
    <details class="disclosure">
      <summary class="disclosure__summary">{summary}</summary>
      <div class="disclosure__body">{children}</div>
    </details>
  );
}
