// ═══════════════════════════════════════════════════════════════════
// SITE CONTENT — owner-editable marketing content for the whole site.
// Programme, schedule and pricing figures come from the academy's
// "Programme & Pricing Guide" (Genoa Football Academy, Muscat, Oman).
// Values still marked TODO(OWNER) are awaiting the client's answer and
// render as visibly-marked placeholders, never as invented facts.
// ═══════════════════════════════════════════════════════════════════
//
// WHERE THINGS LIVE — three files, no overlap:
//   src/data/pricing.ts     every PRICE, as numbers. Never restate an
//                           amount here; import it.
//   content/schedule.json   training days, time slots, durations, the
//                           per-week choice, and the term dates. Edited
//                           at runtime from Studio and the Telegram bot.
//   this file               the words around them.
//
// TERMINOLOGY — the review found "session" being used for two different
// things. It is now split and must stay split:
//   duration  = how long ONE training lasts   ("60 minutes")
//   frequency = training days per week        ("2 or 3 training days")
// Never write "2 sessions per week" or "session time" again.
// ═══════════════════════════════════════════════════════════════════

import scheduleData from '../../content/schedule.json';
import newsData from '../../content/news.json';
import {
  PRICING_BANDS,
  SEASON_DISCOUNT_PCT,
  SEASON_WEEKS,
  TERM_STRUCTURE,
  bandIdForProgram,
  termStructure,
  type BandId,
  type PricingRow,
} from './pricing';
import { COACHES, type Coach } from './coaches';

export { COACHES };
export type { Coach };

/** Look up one squad's editable schedule row; falls back to a blank row. */
function squad(id: string) {
  return (
    scheduleData.squads.find(s => s.id === id) ?? {
      id,
      days: '', daysAr: '',
      time: '', timeAr: '',
      duration: '', durationAr: '',
      frequency: '', frequencyAr: '',
    }
  );
}

/** The three payable terms' week counts, for prose like "13, 7 and 13 weeks". */
const [T1, T2, T3] = TERM_STRUCTURE;

/* ── Home hero ─────────────────────────────────────────────────── */
export const HERO_CHIPS: string[] = [
  'Official Genoa CFC Academy',
  'Ages 5–16',
  'Muscat, Oman',
];

/* ── Home "Why us" feature cards ───────────────────────────────── */
export interface Feature {
  icon: 'ShieldCheck' | 'Trophy' | 'Users' | 'HeartHandshake';
  title: string;
  text: string;
}

export const FEATURES: Feature[] = [
  {
    icon: 'ShieldCheck',
    title: 'Official Genoa Methodology',
    text: 'Training built on the same youth-development principles used at Genoa CFC in Italy — technical mastery first, always.',
  },
  {
    icon: 'Users',
    title: 'UEFA-Licensed Coaches',
    text: 'Every training is led by licensed coaches who develop the player and the person — discipline, respect, teamwork.',
  },
  {
    icon: 'Trophy',
    title: 'A Clear Pathway',
    text: 'From first touches at U6 to the competitive game at U16, every player knows exactly what their next step is.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Family First',
    text: 'Small groups, a written development assessment every term and direct communication with parents — you always know how your child is progressing.',
  },
];

/* ── The Academy page ──────────────────────────────────────────── */
export const ABOUT_TITLE = 'FORGED IN GENOA. BUILT IN MUSCAT.';

export const ABOUT_PARAGRAPHS: string[] = [
  'Genoa Academy Oman brings more than 130 years of Italian football heritage to the heart of Muscat. As the official academy of Genoa CFC — Italy’s oldest football club — we develop young players through the same methodology used in Genoa’s renowned youth sector.',
  'Our UEFA-licensed coaches build technical mastery, tactical intelligence and — above all — character. Every training is designed to challenge players at their own level and to grow them on and off the pitch.',
  'From a child’s very first touches at U6 to the competitive game at U16, we offer a clear pathway for every age group — training where ambition meets tradition.',
];

export const ABOUT_STATS = [
  { value: '1893', label: 'Genoa CFC founded' },
  { value: 'UEFA', label: 'Licensed coaching staff' },
  { value: '5–16', label: 'Age groups welcomed' },
];

/* ── Pathway ── five progression stages, 01–05 ─────────────────────
   Deliberately NOT followed by the coaches block: Coaches is its own
   section with its own anchor, so the pathway reads as a player's
   journey and nothing else.                                        */
export interface PathwayStage {
  /** '01'–'05'. Latin digits in both languages. */
  index: string;
  title: string;
  text: string;
}

export const PATHWAY_STAGES: PathwayStage[] = [
  {
    index: '01',
    title: 'Discover',
    text: 'First trainings with the ball. New players find their feet, pick up the basics of control and passing, and get comfortable playing in a group.',
  },
  {
    index: '02',
    title: 'Academy training',
    text: 'Structured weekly training under UEFA-licensed coaches, following Genoa CFC’s official youth-development methods, adapted to each age group.',
  },
  {
    index: '03',
    title: 'Advanced development',
    text: 'Position-specific work, age-appropriate physical development and the mental side of the game, for players ready to push further.',
  },
  {
    index: '04',
    title: 'Competition',
    text: 'Tournaments, leagues and fixtures against other academies — learning what it takes to perform when the result matters.',
  },
  {
    index: '05',
    title: 'International opportunities',
    text: 'Selected players are put forward for trials, camps and visits to Genoa CFC in Italy, and enter the wider Genoa network.',
  },
];

export const PATHWAY_NOTE =
  'Progression through the pathway is based on assessment and commitment. Not every player will reach every stage.';

/* ── Location ── one venue, stated plainly ─────────────────────── */
export interface SiteLocation {
  venue: string;
  area: string;
  address: string;
  /** Google Plus Code — shown as selectable text, it is the shortest thing to paste. */
  plusCode: string;
  coordinates: string;
  mapsUrl: string;
  /** Keyless Google Maps embed. Needs frame-src in the CSP — see netlify.toml. */
  embedUrl: string;
  /** TODO(OWNER): the client's own words on arriving, parking and drop-off. */
  gettingHere: string;
  /** True while `gettingHere` is still a placeholder, so the UI can label it. */
  gettingHerePending: boolean;
}

export const LOCATION: SiteLocation = {
  venue: 'ABQ Azzan Bin Qais International School — MQ Campus',
  area: 'Madinat Sultan Qaboos',
  address: 'Madinat Sultan Qaboos, Muscat 115, Sultanate of Oman',
  plusCode: 'HCMW+QCM, Muscat 115',
  coordinates: '23.5843° N, 58.4469° E',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=HCMW%2BQCM%20Muscat',
  embedUrl: 'https://www.google.com/maps?q=HCMW%2BQCM%20Muscat&output=embed',
  gettingHere:
    'Directions, parking and the drop-off arrangement for training evenings are still to be confirmed by the academy.',
  gettingHerePending: true, // TODO(OWNER): replace with the real arrival note
};

/* ── Programs ──────────────────────────────────────────────────────
   Age groups, training days, time slots and durations come from
   content/schedule.json. Prices come from pricing.ts. This array adds
   only the age label and the description.                          */
export type PriceBandId = BandId;

export interface Program {
  id: string;
  name: string;
  /** Human-readable age line, e.g. 'Ages 5–6' (localized). */
  ages: string;
  /** Numeric bounds behind `ages` — used to validate the registration form. */
  minAge: number;
  maxAge: number;
  description: string;
  /** Which weekdays this squad trains, e.g. 'Sun / Tue / Wed'. */
  days: string;
  /** The daily slot, e.g. '6:00 – 7:30 pm'. */
  time: string;
  /** How long ONE training lasts, e.g. '90 minutes'. */
  duration: string;
  /** The per-week choice, e.g. '2 or 3 training days / week'. */
  frequency: string;
  priceBand: PriceBandId;
}

/** Every squad is priced by its band; a missing mapping is a programming error. */
function priceBandFor(id: string): PriceBandId {
  const band = bandIdForProgram(id);
  if (!band) throw new Error(`No price band maps age group '${id}' — see src/data/pricing.ts`);
  return band;
}

function program(
  id: string,
  name: string,
  ages: string,
  minAge: number,
  maxAge: number,
  description: string
): Program {
  const s = squad(id);
  return {
    id,
    name,
    ages,
    minAge,
    maxAge,
    description,
    days: s.days,
    time: s.time,
    duration: s.duration,
    frequency: s.frequency,
    priceBand: priceBandFor(id),
  };
}

export const PROGRAMS: Program[] = [
  program(
    'u6', 'U6', 'Ages 5–6', 5, 6,
    'First steps with the ball — coordination, balance and confidence, built through short, high-energy games where every child is always involved.'
  ),
  program(
    'u8', 'U8', 'Ages 7–8', 7, 8,
    'Ball mastery and a lifelong love of the game, through enjoyable trainings where every player gets constant touches.'
  ),
  program(
    'u10', 'U10', 'Ages 9–10', 9, 10,
    'Dribbling, passing and first-touch quality move into small-sided matches, where skill starts meeting decision-making.'
  ),
  program(
    'u12', 'U12', 'Ages 11–12', 11, 12,
    'Positional play, scanning the pitch and reading the game — players learn to understand the match rather than chase the ball.'
  ),
  program(
    'u14', 'U14', 'Ages 13–14', 13, 14,
    'Team systems, pressing and transitions, with age-appropriate physical work as the game turns genuinely competitive.'
  ),
  program(
    'u16', 'U16', 'Ages 15–16', 15, 16,
    'Individual development plans, competitive fixtures and the standards expected of players aiming at the next level of the game.'
  ),
];

/* ── Notes that explain the structure ──────────────────────────── */

export const SCHEDULE_NOTE =
  'The academy trains on Sunday, Tuesday and Wednesday. Choosing 2 training days a week means picking two of those three days; 3 training days a week means all three. Each age group keeps the same time slot all term.';

export const FEES_NOTE =
  `Fees are set by age band and by how many training days a week you choose. Each term can be paid up front or in monthly instalments, and the Full Season price covers all three terms paid up front — ${SEASON_DISCOUNT_PCT}% less than paying term by term.`;

export const TERM_EXPLAINER =
  `A term is a block of weeks, not a calendar month. Term 1 and Term 3 run ${T1.weeks} weeks each; Term 2 is shorter at ${T2.weeks} weeks because of Ramadan.`;

export const MONTHLY_WARNING =
  'Paying by the term or by the season costs less than paying monthly.';

export const FULL_SEASON_EXPLAINER =
  `Full season (${SEASON_WEEKS} weeks) — paid in full up front. Saves ${SEASON_DISCOUNT_PCT}%.`;

/** The Programme & Pricing Guide's standing note. Belongs under the fees. */
export const GUIDE_NOTE =
  'This guide may be updated from time to time. Parents will be notified of any material changes to pricing or programme structure.';

/** Weekday column headings for the calendar grid — owned by schedule.json
 *  so changing training days never requires a code edit. */
export const TRAINING_DAYS: string[] = (scheduleData.trainingDays ?? []).map(d => d.en);

/* ── Term structure ────────────────────────────────────────────── */
export interface TermRow {
  /** 'term1' | 'term2' | 'term3' | 'total' — stable, never localized. */
  id: string;
  /** 'Term 1' — the label stays the same year to year. */
  term: string;
  /** '13 weeks'. */
  duration: string;
  /** '20 September – 18 December' — the only part that changes yearly. */
  dates: string;
  /** Monthly instalments for this term; 0 for the summary row. */
  instalments: number;
  /** Term 2 carries Ramadan; surfaced as a footnote rather than in the label. */
  note?: string;
}

export const TERMS: TermRow[] = scheduleData.terms.map(t => ({
  id: t.id,
  term: t.term,
  duration: t.duration,
  dates: t.dates,
  instalments: t.id === 'total' ? 0 : termStructure(t.id as 'term1').instalments,
  ...(t.id === 'term2' ? { note: 'Includes two weeks of Ramadan' } : {}),
}));

/** The three payable terms, in order — what the pricing tables column on. */
export const PAYABLE_TERMS: TermRow[] = TERMS.filter(t => t.id !== 'total');

/* ── Pricing ── amounts live in pricing.ts; only the LABELS are here ─ */
export interface PriceBand {
  id: PriceBandId;
  /** 'U6 – U8' — the band's display name. */
  title: string;
  rows: readonly PricingRow[];
}

/** Band display names. The ROWS are read straight from pricing.ts, so a
 *  price still exists in exactly one place — this only adds the label. */
const BAND_TITLES: Record<PriceBandId, string> = {
  u6u8: 'U6 – U8',
  u10u16: 'U10 – U16',
};

export const PRICE_BANDS: PriceBand[] = PRICING_BANDS.map(b => ({
  id: b.id,
  title: BAND_TITLES[b.id],
  rows: b.rows,
}));

/* ── What every registered player receives ─────────────────────────
   Client-approved copy — keep the substance if you reword it.      */
export const INCLUDED: string[] = [
  'Train the Genoa way — UEFA-licensed coaches using Genoa CFC’s official youth-development methods, adapted for every age group.',
  'Clear, structured progress — training designed to improve technique, fitness and understanding of the game.',
  'Confidence on and off the pitch — teamwork, discipline, communication and self-belief.',
  'Official Genoa training kit — every player feels part of the academy from day one.',
  'Nutrition and hydration guidance — simple, age-appropriate advice.',
  'Extra development opportunities — optional fitness sessions for players who want to push further.',
  'Termly player assessments — clear coach feedback on progress, strengths and areas to improve.',
  'Stay informed — schedules, announcements and updates via WhatsApp and email.',
  'Genoa Academy app — coming soon.',
];

/* ── Terms & policies ──────────────────────────────────────────── */
export interface PolicyItem {
  title: string;
  text: string;
}

export const POLICIES: PolicyItem[] = [
  {
    title: 'Terms & payment',
    text: `The academy year runs over three terms — ${T1.weeks}, ${T2.weeks} and ${T3.weeks} weeks, ${SEASON_WEEKS} weeks in total. Each term can be paid up front or split into monthly instalments; the Full Season price covers all three terms paid up front. Payment methods and due dates are covered in the Academy’s Payment Policy.`,
  },
  {
    title: 'Cancellations & missed trainings',
    text: 'Cancellations, missed trainings and refunds are covered in the Academy’s Refund & Missed Session Policy, shared with parents at registration. The written policy is still to be published here.',
  },
  {
    title: 'Changes to this guide',
    text: GUIDE_NOTE,
  },
];

/* ── Open items ── questions the client has not answered yet ───────
   Rendered as visibly-marked placeholders wherever they are relevant,
   and listed in the README so they do not get forgotten. Remove an
   entry once the real answer replaces it.                          */
export interface OpenItem {
  id: string;
  question: string;
  /** What the site says in the meantime. */
  placeholder: string;
}

export const OPEN_ITEMS: OpenItem[] = [
  {
    id: 'registration-fee',
    question: 'Is there a one-off registration fee?',
    placeholder: 'Whether a one-off registration fee applies — and whether it is included in or added to the first payment — is still to be confirmed by the academy. The Programme & Pricing Guide does not list one.',
  },
  {
    id: 'instalment-split',
    question: 'Are monthly instalments equal or front-loaded?',
    placeholder: 'The monthly figures shown are equal instalments. Whether the academy front-loads the first payment instead is still to be confirmed.',
  },
  {
    id: 'trial-session',
    question: 'Is there a trial training before committing?',
    placeholder: 'Whether a trial training is offered, and on what terms, is still to be confirmed by the academy.',
  },
  {
    id: 'refund-policy',
    question: 'What is the refund and cancellation policy?',
    placeholder: 'The written refund and cancellation policy is shared with parents at registration. The published summary is still to be confirmed.',
  },
  {
    id: 'getting-here',
    question: 'Where do parents park and drop off?',
    placeholder: LOCATION.gettingHere,
  },
];

export function openItem(id: string): OpenItem | undefined {
  return OPEN_ITEMS.find(i => i.id === id);
}

/* ── News ── edited via Studio / the Telegram bot ──────────────── */

/** Optional photo on a news post. Files live in public/uploads/. */
export interface NewsImage {
  /** Optional: Telegram uploads arrive as JPEG only, with no WebP twin. */
  webp?: string;
  jpg: string;
  width: number;
  height: number;
  alt: string;
  altAr?: string;
}

export interface NewsItem {
  id: string;
  /** ISO date (YYYY-MM-DD) — sorts the list and fills <time dateTime>. */
  date: string;
  category: string;
  title: string;
  excerpt: string;
  image?: NewsImage;
}

/** Shape of one raw entry in content/news.json. */
type RawNews = {
  id: string;
  date: string;
  category: string;
  categoryAr?: string | null;
  title: string;
  titleAr?: string | null;
  excerpt: string;
  excerptAr?: string | null;
  image?: NewsImage | null;
};

/** Newest first, whatever order the file happens to be saved in. */
const byNewest = (a: RawNews, b: RawNews) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/**
 * The raw posts in DISPLAY order. Arabic overrides are merged by index, so
 * content-ar.ts MUST map over this exact array — mapping the unsorted file
 * order would pair Arabic text with the wrong post.
 */
export const RAW_NEWS: RawNews[] = [...(newsData.items as RawNews[])].sort(byNewest);

export const NEWS: NewsItem[] = RAW_NEWS.map(item => ({
  id: item.id,
  date: item.date,
  category: item.category,
  title: item.title,
  excerpt: item.excerpt,
  ...(item.image ? { image: item.image } : {}),
}));

/* ── FAQ ── grouped, and every question deep-linkable ──────────────
   `id` becomes the URL fragment (/#/faq#faq-ages), so ids must stay
   stable: changing one breaks links people have already shared.
   `pending` marks an answer that is waiting on the client — the page
   labels it rather than pretending it is final.                    */
export interface FaqItem {
  id: string;
  q: string;
  a: string;
  pending?: boolean;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'training',
    title: 'Programs & training',
    items: [
      {
        id: 'faq-ages',
        q: 'What ages do you take?',
        a: 'Boys and girls from age 5 to 16, grouped as U6, U8, U10, U12, U14 and U16 so every player trains at the right level.',
      },
      {
        id: 'faq-days',
        q: 'Which days do you train?',
        a: 'The academy trains on Sunday, Tuesday and Wednesday. Every age group trains on those days.',
      },
      {
        id: 'faq-times',
        q: 'What time does my child’s age group train?',
        a: 'U6 and U8 train 5:00 – 6:00 pm. U10 and U12 train 6:00 – 7:30 pm. U14 and U16 train 7:30 – 9:00 pm. Each age group keeps the same slot all term — the Programs page lists it beside every age group.',
      },
      {
        id: 'faq-duration',
        q: 'How long is one training?',
        a: '60 minutes for U6 and U8; 90 minutes for U10 through U16. That is the duration of a single training, not how often your child trains.',
      },
      {
        id: 'faq-frequency',
        q: 'What is the difference between 2 and 3 training days per week?',
        a: 'It is how often your child trains. 2 training days a week means picking two of Sunday, Tuesday and Wednesday; 3 training days a week means all three. The fee follows that choice — 3 days costs more than 2.',
      },
      {
        id: 'faq-change-frequency',
        q: 'Can we change from 2 days to 3 days mid-term?',
        a: 'Ask the coaching team. Moving up depends on space in the age group, and the difference in fee for the remainder of the term is worked out with you before anything changes.',
      },
    ],
  },
  {
    id: 'terms',
    title: 'Terms & dates',
    items: [
      {
        id: 'faq-term-length',
        q: 'How long is a term?',
        a: `Term 1 and Term 3 are ${T1.weeks} weeks each. Term 2 is ${T2.weeks} weeks. That is ${SEASON_WEEKS} weeks of training across the academic year.`,
      },
      {
        id: 'faq-term-dates',
        q: 'When does each term start and finish?',
        a: `Term 1 runs ${TERMS[0]?.dates ?? ''}. Term 2 runs ${TERMS[1]?.dates ?? ''}. Term 3 runs ${TERMS[2]?.dates ?? ''}. The dates sit under every term heading on the Programs page too.`,
      },
      {
        id: 'faq-term2-short',
        q: 'Why is Term 2 shorter?',
        a: `Term 2 is ${T2.weeks} weeks rather than ${T1.weeks} because it includes two weeks of Ramadan. Its fee is lower to match, and it is paid over ${T2.instalments} monthly instalments instead of ${T1.instalments}.`,
      },
      {
        id: 'faq-holidays',
        q: 'What happens during school holidays?',
        a: 'Training follows the three terms, so the breaks between them are not charged. Term dates are published above, and parents are told in advance of any change within a term.',
      },
    ],
  },
  {
    id: 'fees',
    title: 'Fees & payment',
    items: [
      {
        id: 'faq-cost',
        q: 'How much does it cost?',
        a: 'Fees are set by age band — U6–U8 and U10–U16 — and by whether you choose 2 or 3 training days a week. Every figure, per term and for the full season side by side, is in the table on the Programs page.',
      },
      {
        id: 'faq-payment-options',
        q: 'What is the difference between paying per term, monthly and for the full season?',
        a: `Per term: one payment covering that block of weeks. Monthly: the same term spread over instalments, which costs more in total. Full season: all three terms paid up front, for ${SEASON_DISCOUNT_PCT}% less than paying term by term. ${MONTHLY_WARNING}`,
      },
      {
        id: 'faq-season-saving',
        q: 'How much do I save by paying for the full season?',
        a: `${SEASON_DISCOUNT_PCT}%. The saving in Omani Rial is printed under the Full season price for your age band and choice of training days, on the Programs page.`,
      },
      {
        id: 'faq-instalments',
        q: 'How many monthly instalments are there per term?',
        a: `Term 1: ${T1.instalments} instalments. Term 2: ${T2.instalments}. Term 3: ${T3.instalments}. ${TERM_EXPLAINER}`,
      },
      {
        id: 'faq-registration-fee',
        q: 'Is there a registration fee?',
        a: openItem('registration-fee')?.placeholder ?? '',
        pending: true,
      },
      {
        id: 'faq-kit-included',
        q: 'Is the kit included?',
        a: 'Every registered player receives the official Genoa training kit. Whether its cost sits inside the term fee or is invoiced separately is still to be confirmed by the academy.',
        pending: true,
      },
      {
        id: 'faq-refunds',
        q: 'What is your refund / cancellation policy?',
        a: openItem('refund-policy')?.placeholder ?? '',
        pending: true,
      },
    ],
  },
  {
    id: 'joining',
    title: 'Joining',
    items: [
      {
        id: 'faq-register',
        q: 'How do I register?',
        a: 'Use the Register button in the header, or the Register button beside your child’s age group on the Programs page — that one arrives with the age group, training days and term already filled in. The team then contacts you on WhatsApp to confirm.',
      },
      {
        id: 'faq-trial',
        q: 'Is there a trial session?',
        a: openItem('trial-session')?.placeholder ?? '',
        pending: true,
      },
      {
        id: 'faq-bring',
        q: 'What should my child bring?',
        a: 'Football boots (astro turf or firm ground), shin pads and a full water bottle. The training kit is provided by the academy.',
      },
      {
        id: 'faq-kit-provided',
        q: 'Do you provide the kit?',
        a: 'Yes — every registered player receives the official Genoa training kit, so they look part of the academy from their first training.',
      },
    ],
  },
  {
    id: 'coaching',
    title: 'Coaching & development',
    items: [
      {
        id: 'faq-who-coaches',
        q: 'Who coaches the trainings?',
        a: 'UEFA-licensed coaches, working to Genoa CFC’s youth-development methodology. The Coaches section on the Academy page introduces the staff.',
      },
      {
        id: 'faq-pathway',
        q: 'What is the pathway?',
        a: 'Five stages, from first trainings through academy training, advanced development and competition to international opportunities with Genoa CFC. The Pathway section sets out what each stage involves.',
      },
      {
        id: 'faq-assessments',
        q: 'Are there player assessments?',
        a: 'Yes. Every player gets a written assessment each term with the coach’s feedback on progress, strengths and what to work on next.',
      },
      {
        id: 'faq-parent-updates',
        q: 'How are parents kept informed?',
        a: 'Schedules, announcements and updates go out by WhatsApp and email. A Genoa Academy app is coming soon.',
      },
    ],
  },
  {
    id: 'location',
    title: 'Location',
    items: [
      {
        id: 'faq-where',
        q: 'Where do you train?',
        a: `${LOCATION.venue}, ${LOCATION.area}. The Location section has the map, the full address and the plus code.`,
      },
      {
        id: 'faq-parking',
        q: 'Where do I park / drop off?',
        a: openItem('getting-here')?.placeholder ?? '',
        pending: true,
      },
    ],
  },
];

/** Every FAQ item, flattened — for search, counts and deep-link lookups. */
export const FAQS: FaqItem[] = FAQ_GROUPS.flatMap(g => g.items);
