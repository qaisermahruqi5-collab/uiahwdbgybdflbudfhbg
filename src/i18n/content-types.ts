// ═══════════════════════════════════════════════════════════════════
// SITE CONTENT TYPES + BUILDER — one localized content object for
// the whole site. Arabic overrides (src/data/content-ar.ts) are
// merged field-by-field over the English master (src/data/content.ts),
// so any missing Arabic value silently falls back to English.
//
// Array merging: PROGRAMS and PRICE_BANDS join on `id`; all other
// arrays merge by index. Keys, ids, icons, initials, photos and every
// NUMBER are never localized — see the Omit<> clauses below, which are
// what stops a translation from quietly changing a price.
// ═══════════════════════════════════════════════════════════════════

import {
  HERO_CHIPS,
  FEATURES,
  ABOUT_TITLE,
  ABOUT_PARAGRAPHS,
  ABOUT_STATS,
  PATHWAY_STAGES,
  PATHWAY_NOTE,
  LOCATION,
  PROGRAMS,
  SCHEDULE_NOTE,
  FEES_NOTE,
  TERM_EXPLAINER,
  MONTHLY_WARNING,
  FULL_SEASON_EXPLAINER,
  GUIDE_NOTE,
  TERMS,
  PAYABLE_TERMS,
  TRAINING_DAYS,
  PRICE_BANDS,
  INCLUDED,
  POLICIES,
  COACHES,
  OPEN_ITEMS,
  NEWS,
  FAQ_GROUPS,
  type Feature,
  type PathwayStage,
  type SiteLocation,
  type Program,
  type TermRow,
  type PriceBand,
  type PolicyItem,
  type Coach,
  type OpenItem,
  type NewsItem,
  type FaqItem,
  type FaqGroup,
} from '@/data/content';

export type Stat = { value: string; label: string };

export interface SiteContent {
  heroChips: string[];
  features: Feature[];
  aboutTitle: string;
  aboutParagraphs: string[];
  aboutStats: Stat[];
  pathwayStages: PathwayStage[];
  pathwayNote: string;
  location: SiteLocation;
  programs: Program[];
  scheduleNote: string;
  feesNote: string;
  termExplainer: string;
  monthlyWarning: string;
  fullSeasonExplainer: string;
  guideNote: string;
  trainingDays: string[];
  /** All four rows, including the 'total' summary. */
  terms: TermRow[];
  /** The three payable terms only — what the pricing tables column on. */
  payableTerms: TermRow[];
  priceBands: PriceBand[];
  included: string[];
  policies: PolicyItem[];
  coaches: Coach[];
  openItems: OpenItem[];
  news: NewsItem[];
  faqGroups: FaqGroup[];
  /** Every FAQ item flattened, for deep-link lookups. */
  faqs: FaqItem[];
}

export type SiteContentOverrides = {
  heroChips?: string[];
  features?: Array<Partial<Pick<Feature, 'title' | 'text'>>>;
  aboutTitle?: string;
  aboutParagraphs?: string[];
  aboutStats?: Array<Partial<Stat>>;
  /* `index` is a latin numeral in both languages. */
  pathwayStages?: Array<Partial<Pick<PathwayStage, 'title' | 'text'>>>;
  pathwayNote?: string;
  /* Plus code, coordinates and URLs are addresses, not prose. */
  location?: Partial<Pick<SiteLocation, 'venue' | 'area' | 'address' | 'gettingHere'>>;
  /* minAge/maxAge are numeric logic, never translated. */
  programs?: Array<Partial<Omit<Program, 'id' | 'priceBand' | 'minAge' | 'maxAge'>> & { id: string }>;
  scheduleNote?: string;
  feesNote?: string;
  termExplainer?: string;
  monthlyWarning?: string;
  fullSeasonExplainer?: string;
  guideNote?: string;
  trainingDays?: string[];
  /* `instalments` is a count and `id` a stable key — neither is localized. */
  terms?: Array<Partial<Omit<TermRow, 'id' | 'instalments'>>>;
  /**
   * ONLY the band's display name. `rows` are numbers owned by
   * src/data/pricing.ts, so no translation can change a price.
   */
  priceBands?: Array<{ id: string; title?: string }>;
  included?: string[];
  policies?: Array<Partial<PolicyItem>>;
  /* Photo, initials, id and status are shared across languages. */
  coaches?: Array<Partial<Omit<Coach, 'id' | 'initials' | 'photo' | 'status'>>>;
  openItems?: Array<Partial<Omit<OpenItem, 'id'>>>;
  /* `image` is shared across languages — never localized. */
  news?: Array<Partial<Omit<NewsItem, 'id' | 'date' | 'image'>>>;
  /* Group and item ids are URL fragments — stable, never localized. */
  faqGroups?: Array<{
    title?: string;
    items?: Array<Partial<Pick<FaqItem, 'q' | 'a'>>>;
  }>;
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

/** Band titles merge on `id`; rows are never touched. */
function mergePriceBands(overrides?: SiteContentOverrides['priceBands']): PriceBand[] {
  if (!overrides) return PRICE_BANDS;
  return PRICE_BANDS.map(band => {
    const o = overrides.find(b => b.id === band.id);
    return o?.title ? { ...band, title: o.title } : band;
  });
}

/** FAQ groups merge by index, and their items by index within the group. */
function mergeFaqGroups(overrides?: SiteContentOverrides['faqGroups']): FaqGroup[] {
  if (!overrides) return FAQ_GROUPS;
  return FAQ_GROUPS.map((group, i) => {
    const o = overrides[i];
    if (!o) return group;
    return {
      ...group,
      title: o.title ?? group.title,
      items: mergeByIndex<FaqItem>(group.items, o.items),
    };
  });
}

export function buildSiteContent(overrides?: SiteContentOverrides): SiteContent {
  const faqGroups = mergeFaqGroups(overrides?.faqGroups);

  if (!overrides) {
    return {
      heroChips: HERO_CHIPS,
      features: FEATURES,
      aboutTitle: ABOUT_TITLE,
      aboutParagraphs: ABOUT_PARAGRAPHS,
      aboutStats: ABOUT_STATS,
      pathwayStages: PATHWAY_STAGES,
      pathwayNote: PATHWAY_NOTE,
      location: LOCATION,
      programs: PROGRAMS,
      scheduleNote: SCHEDULE_NOTE,
      feesNote: FEES_NOTE,
      termExplainer: TERM_EXPLAINER,
      monthlyWarning: MONTHLY_WARNING,
      fullSeasonExplainer: FULL_SEASON_EXPLAINER,
      guideNote: GUIDE_NOTE,
      trainingDays: TRAINING_DAYS,
      terms: TERMS,
      payableTerms: PAYABLE_TERMS,
      priceBands: PRICE_BANDS,
      included: INCLUDED,
      policies: POLICIES,
      coaches: COACHES,
      openItems: OPEN_ITEMS,
      news: NEWS,
      faqGroups,
      faqs: faqGroups.flatMap(g => g.items),
    };
  }

  const terms = mergeByIndex<TermRow>(TERMS, overrides.terms);

  return {
    heroChips: mergeStrings(HERO_CHIPS, overrides.heroChips),
    features: mergeByIndex<Feature>(FEATURES, overrides.features),
    aboutTitle: overrides.aboutTitle ?? ABOUT_TITLE,
    aboutParagraphs: mergeStrings(ABOUT_PARAGRAPHS, overrides.aboutParagraphs),
    aboutStats: mergeByIndex<Stat>(ABOUT_STATS, overrides.aboutStats),
    pathwayStages: mergeByIndex<PathwayStage>(PATHWAY_STAGES, overrides.pathwayStages),
    pathwayNote: overrides.pathwayNote ?? PATHWAY_NOTE,
    location: { ...LOCATION, ...(overrides.location ?? {}) },
    programs: PROGRAMS.map(program => {
      const o = overrides.programs?.find(p => p.id === program.id);
      if (!o) return program;
      const { id: _id, ...rest } = o; // id is a stable key — never localized
      void _id;
      return { ...program, ...rest };
    }),
    scheduleNote: overrides.scheduleNote ?? SCHEDULE_NOTE,
    feesNote: overrides.feesNote ?? FEES_NOTE,
    termExplainer: overrides.termExplainer ?? TERM_EXPLAINER,
    monthlyWarning: overrides.monthlyWarning ?? MONTHLY_WARNING,
    fullSeasonExplainer: overrides.fullSeasonExplainer ?? FULL_SEASON_EXPLAINER,
    guideNote: overrides.guideNote ?? GUIDE_NOTE,
    trainingDays: mergeStrings(TRAINING_DAYS, overrides.trainingDays),
    terms,
    payableTerms: terms.filter(t => t.id !== 'total'),
    priceBands: mergePriceBands(overrides.priceBands),
    included: mergeStrings(INCLUDED, overrides.included),
    policies: mergeByIndex<PolicyItem>(POLICIES, overrides.policies),
    coaches: mergeByIndex<Coach>(COACHES, overrides.coaches),
    openItems: mergeByIndex<OpenItem>(OPEN_ITEMS, overrides.openItems),
    news: mergeByIndex<NewsItem>(NEWS, overrides.news),
    faqGroups,
    faqs: faqGroups.flatMap(g => g.items),
  };
}
