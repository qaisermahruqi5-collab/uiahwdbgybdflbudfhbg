// ═══════════════════════════════════════════════════════════════════
// SITE CONTENT TYPES + BUILDER — one localized content object for
// the whole site. Arabic overrides (src/data/content-ar.ts) are
// merged field-by-field over the English master (src/data/content.ts),
// so any missing Arabic value silently falls back to English.
// Array merging: PROGRAMS and PRICE_BANDS join on `id`; all other
// arrays merge by index. Keys/ids/icons/initials are never localized.
// ═══════════════════════════════════════════════════════════════════

import {
  HERO_CHIPS,
  FEATURES,
  ABOUT_TITLE,
  ABOUT_PARAGRAPHS,
  ABOUT_STATS,
  PROGRAMS,
  SCHEDULE_NOTE,
  FEES_NOTE,
  TERMS,
  PRICE_BANDS,
  INCLUDED,
  POLICIES,
  COACHES,
  NEWS,
  FAQS,
  type Feature,
  type Program,
  type TermRow,
  type PriceBand,
  type PriceRow,
  type PolicyItem,
  type Coach,
  type NewsItem,
  type FaqItem,
} from '@/data/content';

export type Stat = { value: string; label: string };

export interface SiteContent {
  heroChips: string[];
  features: Feature[];
  aboutTitle: string;
  aboutParagraphs: string[];
  aboutStats: Stat[];
  programs: Program[];
  scheduleNote: string;
  feesNote: string;
  terms: TermRow[];
  priceBands: PriceBand[];
  included: string[];
  policies: PolicyItem[];
  coaches: Coach[];
  news: NewsItem[];
  faqs: FaqItem[];
}

export type SiteContentOverrides = {
  heroChips?: string[];
  features?: Array<Partial<Pick<Feature, 'title' | 'text'>>>;
  aboutTitle?: string;
  aboutParagraphs?: string[];
  aboutStats?: Array<Partial<Stat>>;
  /* minAge/maxAge are numeric logic, never translated. */
  programs?: Array<Partial<Omit<Program, 'id' | 'priceBand' | 'minAge' | 'maxAge'>> & { id: string }>;
  scheduleNote?: string;
  feesNote?: string;
  terms?: Array<Partial<TermRow>>;
  priceBands?: Array<Partial<Omit<PriceBand, 'id' | 'rows'>> & {
    id: string;
    rows?: Array<Partial<PriceRow>>;
  }>;
  included?: string[];
  policies?: Array<Partial<PolicyItem>>;
  coaches?: Array<Partial<Omit<Coach, 'initials'>>>;
  /* `image` is shared across languages — never localized. */
  news?: Array<Partial<Omit<NewsItem, 'id' | 'date' | 'image'>>>;
  faqs?: Array<Partial<FaqItem>>;
};

/** Merge a string array by index, falling back to the English value. */
function mergeStrings(master: string[], overrides?: string[]): string[] {
  if (!overrides) return master;
  return master.map((value, i) => overrides[i] ?? value);
}

/** Merge an object array by index, picking only overridden fields. */
function mergeByIndex<T extends object>(master: T[], overrides?: Array<Partial<T>>): T[] {
  if (!overrides) return master;
  return master.map((item, i) => ({ ...item, ...(overrides[i] ?? {}) }));
}

function mergePriceBands(overrides?: SiteContentOverrides['priceBands']): PriceBand[] {
  if (!overrides) return PRICE_BANDS;
  return PRICE_BANDS.map(band => {
    const o = overrides.find(b => b.id === band.id);
    if (!o) return band;
    const { id: _id, rows, ...rest } = o; // id is a stable key — never localized
    void _id;
    return { ...band, ...rest, rows: mergeByIndex<PriceRow>(band.rows, rows) };
  });
}

export function buildSiteContent(overrides?: SiteContentOverrides): SiteContent {
  if (!overrides) {
    return {
      heroChips: HERO_CHIPS,
      features: FEATURES,
      aboutTitle: ABOUT_TITLE,
      aboutParagraphs: ABOUT_PARAGRAPHS,
      aboutStats: ABOUT_STATS,
      programs: PROGRAMS,
      scheduleNote: SCHEDULE_NOTE,
      feesNote: FEES_NOTE,
      terms: TERMS,
      priceBands: PRICE_BANDS,
      included: INCLUDED,
      policies: POLICIES,
      coaches: COACHES,
      news: NEWS,
      faqs: FAQS,
    };
  }

  return {
    heroChips: mergeStrings(HERO_CHIPS, overrides.heroChips),
    features: mergeByIndex<Feature>(FEATURES, overrides.features),
    aboutTitle: overrides.aboutTitle ?? ABOUT_TITLE,
    aboutParagraphs: mergeStrings(ABOUT_PARAGRAPHS, overrides.aboutParagraphs),
    aboutStats: mergeByIndex<Stat>(ABOUT_STATS, overrides.aboutStats),
    programs: PROGRAMS.map(program => {
      const o = overrides.programs?.find(p => p.id === program.id);
      if (!o) return program;
      const { id: _id, ...rest } = o; // id is a stable key — never localized
      void _id;
      return { ...program, ...rest };
    }),
    scheduleNote: overrides.scheduleNote ?? SCHEDULE_NOTE,
    feesNote: overrides.feesNote ?? FEES_NOTE,
    terms: mergeByIndex<TermRow>(TERMS, overrides.terms),
    priceBands: mergePriceBands(overrides.priceBands),
    included: mergeStrings(INCLUDED, overrides.included),
    policies: mergeByIndex<PolicyItem>(POLICIES, overrides.policies),
    coaches: mergeByIndex<Coach>(COACHES, overrides.coaches),
    news: mergeByIndex<NewsItem>(NEWS, overrides.news),
    faqs: mergeByIndex<FaqItem>(FAQS, overrides.faqs),
  };
}
