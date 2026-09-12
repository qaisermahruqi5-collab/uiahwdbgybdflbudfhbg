// ═══════════════════════════════════════════════════════════════════
// SHARED LABELS — phrases that are assembled from data rather than
// looked up whole, so that every place showing them says exactly the
// same thing.
// ═══════════════════════════════════════════════════════════════════

import type { TParams } from './context';

type Translate = (key: string, params?: TParams) => string;

/**
 * "2 training days / week".
 *
 * WHY THIS IS NOT A PLAIN t() CALL: Arabic has a dual form. "2 أيام" is
 * what a naive {count} substitution produces and it reads as a mistake to
 * an Arabic speaker — the correct word for two is "يومان". So two is its
 * own key, and three (or any other number) goes through the plural one.
 * English is unaffected either way.
 *
 * Used by the pricing tables, the registration form's training-days
 * select, its summary line and the WhatsApp handover text.
 */
export function trainingDaysLabel(t: Translate, count: number | string): string {
  const n = Number(count);
  return n === 2
    ? t('pricing.trainingDaysDual')
    : t('pricing.trainingDaysPerWeek', { count: n });
}
