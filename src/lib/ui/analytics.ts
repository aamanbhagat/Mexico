/**
 * Cookieless analytics events (Umami or Plausible), only when the owner enables a self-hosted,
 * same-origin script (see BaseLayout and docs/LAUNCH_CHECKLIST.md). Events carry a name and the
 * tool, never anything a person typed: inputs stay on the device (AGENTS.md §5).
 */
type Umami = { track: (name: string, data?: Record<string, string>) => void };
type Plausible = (name: string, opts?: { props?: Record<string, string> }) => void;

export type AnalyticsEvent = 'calculo' | 'copiar' | 'compartir' | 'pdf' | 'imprimir';

export function track(event: AnalyticsEvent, tool: string): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { umami?: Umami; plausible?: Plausible };
  try {
    if (w.umami) w.umami.track(event, { tool });
    else if (w.plausible) w.plausible(event, { props: { tool } });
  } catch {
    /* analytics must never break a calculation */
  }
}
