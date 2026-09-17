// ═══════════════════════════════════════════════════════════════════
// PRICING — THE SINGLE SOURCE OF TRUTH FOR EVERY PRICE ON THE SITE.
//
// Figures come from the academy's official Programme & Pricing Guide.
// Nothing here is a display string: amounts are NUMBERS and every
// component renders them through formatOMR(), so a price can never be
// written twice and drift. If a number is wrong, it is wrong here and
// only here.
//
// RULES THIS FILE ENCODES
//   • A term is a block of weeks, not a calendar month.
//   • The Full Season price is all three terms paid up front, 10% off.
//   • The sum of the three terms (485 / 600's 670 / 500 / 685) is NOT a
//     price. It exists only to work out the saving, and must never be
//     rendered as an amount a parent could pay — showing it next to the
//     real prices is what confused the stakeholder review. Hence
//     termSum() is exported for seasonSaving() and nothing else.
//   • Monthly instalments cost more than paying by term or by season.
//     The instalment COUNT per term is part of the data, so "OMR 65 a
//     month" is never ambiguous about how many months.
//
// TERMINOLOGY (do not reintroduce the word "session" for either):
//   duration  = how long ONE training lasts        (60 / 90 minutes)
//   frequency = how many training days a week      (2 or 3)
// ═══════════════════════════════════════════════════════════════════

import pricingData from '../../content/pricing.json';

/** Age bands share a price list; ages do not have individual prices. */
export type BandId = 'u6u8' | 'u10u16';

/** Training days per week a family chooses. Sun/Tue/Wed: pick 2 of 3, or all 3. */
export type Frequency = 2 | 3;

/** The three payable terms. 'total' is a summary row, never payable. */
export type TermId = 'term1' | 'term2' | 'term3';

export const TERM_IDS: readonly TermId[] = ['term1', 'term2', 'term3'] as const;

export const FREQUENCIES: readonly Frequency[] = [2, 3] as const;

export type PaymentOption = 'term' | 'monthly' | 'season';

export const PAYMENT_OPTIONS: readonly PaymentOption[] = ['term', 'monthly', 'season'] as const;

/* ── Reading content/pricing.json ──────────────────────────────────
   The JSON is edited by Studio, so it is untrusted input even though it
   lives in the repo. It is resolved at BUILD time, which is deliberate:
   a malformed price list fails the build loudly and the previous deploy
   stays live, rather than reaching a parent as "OMR 0". Studio's own
   validator rejects bad figures first; this is the backstop.        */

function money(value: unknown, where: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`content/pricing.json: ${where} must be a positive number, got ${JSON.stringify(value)}`);
  }
  return value;
}

/** Discount applied to the Full Season price, in percent. */
export const SEASON_DISCOUNT_PCT = money(pricingData.seasonDiscountPct, 'seasonDiscountPct');

/** Weeks and instalment count per term — the structure, not the money. */
export interface TermStructure {
  id: TermId;
  weeks: number;
  /** How many monthly instalments that term's monthly figure is paid over. */
  instalments: number;
}

export const TERM_STRUCTURE: readonly TermStructure[] = TERM_IDS.map(id => {
  const raw = pricingData.termStructure.find(t => t.id === id);
  if (!raw) throw new Error(`content/pricing.json: termStructure is missing "${id}"`);
  return {
    id,
    weeks: money(raw.weeks, `${id}.weeks`),
    instalments: money(raw.instalments, `${id}.instalments`),
  };
});

/** Weeks of training in the full academic year — the terms, added up. */
export const SEASON_WEEKS = TERM_STRUCTURE.reduce((total, t) => total + t.weeks, 0);

export function termStructure(id: TermId): TermStructure {
  return TERM_STRUCTURE.find(t => t.id === id) ?? TERM_STRUCTURE[0];
}

/** One term's two ways to pay it. Both in OMR. */
export interface TermPrice {
  /** Paid up front for the whole term. */
  upfront: number;
  /** One monthly instalment. Multiply by termStructure().instalments for the total. */
  monthly: number;
}

export interface PricingRow {
  frequency: Frequency;
  term1: TermPrice;
  term2: TermPrice;
  term3: TermPrice;
  /** All three terms paid up front, 10% off. */
  fullSeason: number;
}

export interface PricingBand {
  id: BandId;
  /** Age-group ids this band prices — the only place the mapping lives. */
  programs: readonly string[];
  rows: readonly PricingRow[];
}

const BAND_IDS: readonly BandId[] = ['u6u8', 'u10u16'] as const;

function termPriceOf(raw: unknown, where: string): TermPrice {
  const t = (raw ?? {}) as Record<string, unknown>;
  return { upfront: money(t.upfront, `${where}.upfront`), monthly: money(t.monthly, `${where}.monthly`) };
}

export const PRICING_BANDS: readonly PricingBand[] = BAND_IDS.map(id => {
  const raw = pricingData.bands.find(b => b.id === id);
  if (!raw) throw new Error(`content/pricing.json: bands is missing "${id}"`);

  const rows: PricingRow[] = FREQUENCIES.map(frequency => {
    const r = raw.rows.find(x => x.frequency === frequency);
    if (!r) throw new Error(`content/pricing.json: ${id} has no row for ${frequency} training days`);

    const row: PricingRow = {
      frequency,
      term1: termPriceOf(r.term1, `${id}/${frequency}.term1`),
      term2: termPriceOf(r.term2, `${id}/${frequency}.term2`),
      term3: termPriceOf(r.term3, `${id}/${frequency}.term3`),
      fullSeason: money(r.fullSeason, `${id}/${frequency}.fullSeason`),
    };

    // The season price is the discounted one. If it ever exceeds the three
    // terms added up, the discount has been inverted and every "save OMR x"
    // line on the site would read as a negative.
    const sum = row.term1.upfront + row.term2.upfront + row.term3.upfront;
    if (row.fullSeason > sum) {
      throw new Error(
        `content/pricing.json: ${id}/${frequency} fullSeason (${row.fullSeason}) ` +
        `is more than the three terms added up (${sum}) — the season must never cost more`
      );
    }
    return row;
  });

  return { id, programs: raw.programs, rows };
});

/* ── Formatting ────────────────────────────────────────────────────
   Currency code BEFORE the number, no decimals unless the source
   figure actually has them. Identical in English and Arabic: the
   printed guide uses OMR, and one format cannot drift out of sync
   with a second one.                                              */
export function formatOMR(amount: number): string {
  const rounded = Math.round(amount * 1000) / 1000;
  const body = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(3).replace(/0+$/, '');
  return `OMR ${body}`;
}

/* ── Lookups ─────────────────────────────────────────────────────── */

export function band(id: BandId): PricingBand | undefined {
  return PRICING_BANDS.find(b => b.id === id);
}

/** The band that prices a given age group id ('u10' → u10u16 band). */
export function bandForProgram(programId: string): PricingBand | undefined {
  return PRICING_BANDS.find(b => b.programs.includes(programId));
}

export function bandIdForProgram(programId: string): BandId | undefined {
  return bandForProgram(programId)?.id;
}

export function pricingRow(bandId: BandId, frequency: Frequency): PricingRow | undefined {
  return band(bandId)?.rows.find(r => r.frequency === frequency);
}

export function termPrice(row: PricingRow, termId: TermId): TermPrice {
  return row[termId];
}

/* ── Derived money ───────────────────────────────────────────────── */

/**
 * The three terms added up BEFORE the Full Season discount.
 *
 * NOT A PRICE. Only ever feed this into seasonSaving() — rendering it
 * beside the real figures is exactly what made the review think there
 * was a second, higher price list.
 */
export function termSum(row: PricingRow): number {
  return row.term1.upfront + row.term2.upfront + row.term3.upfront;
}

/** What paying for the full season up front saves, in OMR. */
export function seasonSaving(row: PricingRow): number {
  return termSum(row) - row.fullSeason;
}

/** Total cost of one term if it is paid in monthly instalments. */
export function monthlyTotal(row: PricingRow, termId: TermId): number {
  return termPrice(row, termId).monthly * termStructure(termId).instalments;
}

/** What a chosen payment option costs, for the live total in the form. */
export function optionTotal(
  row: PricingRow,
  termId: TermId,
  option: PaymentOption
): number {
  switch (option) {
    case 'term':
      return termPrice(row, termId).upfront;
    case 'monthly':
      return monthlyTotal(row, termId);
    case 'season':
      return row.fullSeason;
  }
}

/* ── URL parameter parsing (Register deep links) ───────────────────
   Every parser returns undefined for anything it does not recognise,
   so a hand-edited or stale link falls back to the empty form rather
   than erroring or pre-selecting something wrong.                  */

/** 'U10' | 'u10' → 'u10'. Returns undefined unless the id really exists. */
export function parseProgramId(raw: string | null, knownIds: readonly string[]): string | undefined {
  if (!raw) return undefined;
  const id = raw.trim().toLowerCase();
  return knownIds.includes(id) ? id : undefined;
}

export function parseFrequency(raw: string | null): Frequency | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw.trim(), 10);
  return FREQUENCIES.find(f => f === n);
}

export function parseTermId(raw: string | null): TermId | undefined {
  if (!raw) return undefined;
  const id = raw.trim().toLowerCase();
  return TERM_IDS.find(t => t === id);
}

export function parsePaymentOption(raw: string | null): PaymentOption | undefined {
  if (!raw) return undefined;
  const id = raw.trim().toLowerCase();
  return PAYMENT_OPTIONS.find(p => p === id);
}
