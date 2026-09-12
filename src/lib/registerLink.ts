// ═══════════════════════════════════════════════════════════════════
// REGISTER LINKS — every "Register" button that knows what the parent
// clicked builds its URL here, so the query string the form reads and
// the query string the buttons write can never disagree.
//
//   /register?age=U10&frequency=3&term=term1
//
// The form parses these with the parsers in src/data/pricing.ts and
// falls back to an empty form for anything it does not recognise, so a
// stale or hand-edited link degrades instead of breaking.
// ═══════════════════════════════════════════════════════════════════

import type { Frequency, PaymentOption, TermId } from '@/data/pricing';

export interface RegisterTarget {
  /** Age-group id, e.g. 'u10'. Written uppercase in the URL for readability. */
  age?: string;
  frequency?: Frequency;
  term?: TermId;
  payment?: PaymentOption;
}

/** The registration route. `/join` still works and redirects here. */
export const REGISTER_PATH = '/register';

export function registerLink(target: RegisterTarget = {}): string {
  const params = new URLSearchParams();
  if (target.age) params.set('age', target.age.toUpperCase());
  if (target.frequency) params.set('frequency', String(target.frequency));
  if (target.term) params.set('term', target.term);
  if (target.payment) params.set('payment', target.payment);
  const query = params.toString();
  return query ? `${REGISTER_PATH}?${query}` : REGISTER_PATH;
}
