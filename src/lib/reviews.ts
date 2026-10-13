import reviews from '../data/reviews.json';
import type { PageKey } from '../i18n/routes';

export interface ReviewStatus {
  status: 'pending' | 'reviewed';
  reviewer: string | null;
  credentials: string | null;
  reviewed_on: string | null;
}

/** Legal review state for a page, from src/data/reviews.json (never faked in templates). */
export function reviewFor(key: PageKey): ReviewStatus {
  const entry = (reviews as unknown as Record<string, ReviewStatus | undefined>)[key];
  if (!entry) return { status: 'pending', reviewer: null, credentials: null, reviewed_on: null };
  // A "reviewed" entry without a named reviewer and date is treated as pending.
  if (entry.status === 'reviewed' && (!entry.reviewer || !entry.reviewed_on)) return { ...entry, status: 'pending' };
  return entry;
}
