// ═══════════════════════════════════════════════════════════════════
// SITE CONTENT — owner-editable marketing content for the whole site.
// Programme, schedule and pricing figures come from the academy's
// "Programme & Pricing Guide" (Genoa Football Academy, Muscat, Oman).
// Values still marked TODO(OWNER) are drafts awaiting real data.
// ═══════════════════════════════════════════════════════════════════
//
// EDITABLE AT RUNTIME: the training schedule, term weeks and news posts
// no longer live in this file — they come from content/schedule.json and
// content/news.json, which the admin dashboard and the Telegram bot
// rewrite. Everything else here is marketing copy, edited in code.
// ═══════════════════════════════════════════════════════════════════

import scheduleData from '../../content/schedule.json';
import newsData from '../../content/news.json';

/** Look up one squad's editable schedule row; falls back to a blank row. */
function squad(id: string) {
  return (
    scheduleData.squads.find(s => s.id === id) ?? {
      id,
      days: '', daysAr: '',
      winterTime: '', winterTimeAr: '',
      summerTime: '', summerTimeAr: '',
      duration: '', durationAr: '',
      sessions: '', sessionsAr: '',
    }
  );
}

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
    title: 'UEFA-Qualified Coaches',
    text: 'Every session is led by licensed coaches who develop the player and the person — discipline, respect, teamwork.',
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
  'Our UEFA-qualified coaches build technical mastery, tactical intelligence and — above all — character. Every session is designed to challenge players at their own level and to grow them on and off the pitch.',
  'From a child’s very first touches at U6 to the competitive game at U16, we offer a clear pathway for every age group — training where ambition meets tradition.',
];

export const ABOUT_STATS = [
  { value: '1893', label: 'Genoa CFC founded' },
  { value: 'UEFA', label: 'Qualified coaching staff' },
  { value: '5–16', label: 'Age groups welcomed' },
];

/* ── Programs ──────────────────────────────────────────────────────
   Age groups, training days, time slots and session durations are
   taken from the academy Programme & Pricing Guide. Every group
   trains on the same days; only the time slot changes.            */

/** Pricing is set per age BAND, not per age group. */
export type PriceBandId = 'u6u8' | 'u10u16';

export interface Program {
  id: string;
  name: string;
  /** Human-readable age line, e.g. 'Ages 5–6' (localized). */
  ages: string;
  /** Numeric bounds behind `ages` — used to validate the registration form. */
  minAge: number;
  maxAge: number;
  description: string;
  days: string;
  winterTime: string;
  summerTime: string;
  duration: string;
  sessions: string;
  priceBand: PriceBandId;
}

export const PROGRAMS: Program[] = [
  {
    id: 'u6',
    name: 'U6',
    ages: 'Ages 5–6',
    minAge: 5,
    maxAge: 6,
    description:
      'First steps with the ball — coordination, balance and confidence, built through short, high-energy games where every child is always involved.',
    days: squad('u6').days,
    winterTime: squad('u6').winterTime,
    summerTime: squad('u6').summerTime,
    duration: squad('u6').duration,
    sessions: squad('u6').sessions,
    priceBand: 'u6u8',
  },
  {
    id: 'u8',
    name: 'U8',
    ages: 'Ages 7–8',
    minAge: 7,
    maxAge: 8,
    description:
      'Ball mastery and a lifelong love of the game, through playful sessions where every player gets constant touches on the ball.',
    days: squad('u8').days,
    winterTime: squad('u8').winterTime,
    summerTime: squad('u8').summerTime,
    duration: squad('u8').duration,
    sessions: squad('u8').sessions,
    priceBand: 'u6u8',
  },
  {
    id: 'u10',
    name: 'U10',
    ages: 'Ages 9–10',
    minAge: 9,
    maxAge: 10,
    description:
      'Dribbling, passing and first-touch quality carried into small-sided games, where technique starts to meet decision-making.',
    days: squad('u10').days,
    winterTime: squad('u10').winterTime,
    summerTime: squad('u10').summerTime,
    duration: squad('u10').duration,
    sessions: squad('u10').sessions,
    priceBand: 'u10u16',
  },
  {
    id: 'u12',
    name: 'U12',
    ages: 'Ages 11–12',
    minAge: 11,
    maxAge: 12,
    description:
      'Positional play, scanning and game understanding — players learn to read the game rather than chase the ball.',
    days: squad('u12').days,
    winterTime: squad('u12').winterTime,
    summerTime: squad('u12').summerTime,
    duration: squad('u12').duration,
    sessions: squad('u12').sessions,
    priceBand: 'u10u16',
  },
  {
    id: 'u14',
    name: 'U14',
    ages: 'Ages 13–14',
    minAge: 13,
    maxAge: 14,
    description:
      'Team systems, pressing and transitions, with age-appropriate physical work as the game becomes genuinely competitive.',
    days: squad('u14').days,
    winterTime: squad('u14').winterTime,
    summerTime: squad('u14').summerTime,
    duration: squad('u14').duration,
    sessions: squad('u14').sessions,
    priceBand: 'u10u16',
  },
  {
    id: 'u16',
    name: 'U16',
    ages: 'Ages 15–16',
    minAge: 15,
    maxAge: 16,
    description:
      'Individual development plans, competitive fixtures and the standards expected of players chasing the next level of the game.',
    days: squad('u16').days,
    winterTime: squad('u16').winterTime,
    summerTime: squad('u16').summerTime,
    duration: squad('u16').duration,
    sessions: squad('u16').sessions,
    priceBand: 'u10u16',
  },
];

export const SCHEDULE_NOTE =
  'Training runs on Monday, Wednesday and Thursday. Families choose either 2 or 3 sessions per week, and each age group keeps a fixed time slot — winter and summer slots differ. Exact days, times and session durations per age group are confirmed at registration.';

export const FEES_NOTE =
  'Fees are set by age band and by the number of weekly sessions you choose. Every term can be paid upfront or split into monthly instalments, and the Full Season price covers all three terms paid upfront.';

/* ── Term structure ────────────────────────────────────────────── */
export interface TermRow {
  term: string;
  duration: string;
}

export const TERMS: TermRow[] = scheduleData.terms.map(t => ({
  term: t.term,
  duration: t.duration,
}));

/* ── Pricing ── figures in OMR, from the Programme & Pricing Guide ─ */
export interface PriceRow {
  /** '2 Sessions / Week' | '3 Sessions / Week' */
  sessions: string;
  term1: string;
  term1Monthly: string;
  term2: string;
  term2Monthly: string;
  term3: string;
  term3Monthly: string;
  fullSeason: string;
}

export interface PriceBand {
  id: PriceBandId;
  title: string;
  rows: PriceRow[];
}

export const PRICE_BANDS: PriceBand[] = [
  {
    id: 'u6u8',
    title: 'U6 – U8',
    rows: [
      {
        sessions: '2 Sessions / Week',
        term1: 'OMR 195',
        term1Monthly: 'or OMR 65.217 / month',
        term2: 'OMR 95',
        term2Monthly: 'or OMR 59.375 / month',
        term3: 'OMR 195',
        term3Monthly: 'or OMR 65.217 / month',
        fullSeason: 'OMR 485',
      },
      {
        sessions: '3 Sessions / Week',
        term1: 'OMR 275',
        term1Monthly: 'or OMR 91.973 / month',
        term2: 'OMR 120',
        term2Monthly: 'or OMR 75.000 / month',
        term3: 'OMR 275',
        term3Monthly: 'or OMR 91.973 / month',
        fullSeason: 'OMR 670',
      },
    ],
  },
  {
    id: 'u10u16',
    title: 'U10 – U16',
    rows: [
      {
        sessions: '2 Sessions / Week',
        term1: 'OMR 200',
        term1Monthly: 'or OMR 66.890 / month',
        term2: 'OMR 100',
        term2Monthly: 'or OMR 62.500 / month',
        term3: 'OMR 200',
        term3Monthly: 'or OMR 66.890 / month',
        fullSeason: 'OMR 500',
      },
      {
        sessions: '3 Sessions / Week',
        term1: 'OMR 280',
        term1Monthly: 'or OMR 93.645 / month',
        term2: 'OMR 125',
        term2Monthly: 'or OMR 78.125 / month',
        term3: 'OMR 280',
        term3Monthly: 'or OMR 93.645 / month',
        fullSeason: 'OMR 685',
      },
    ],
  },
];

/* ── What every registered player receives ─────────────────────── */
export const INCLUDED: string[] = [
  'Structured, age-appropriate coaching from our coaching team, using training principles aligned with Genoa CFC’s youth-development approach.',
  'Sessions focused on technical skills, tactical understanding, physical development, confidence and teamwork.',
  'Full Genoa Football Academy training kit, as selected at registration.',
  'A player development assessment during the term, shared with parents.',
  'A safe, professional and encouraging training environment.',
  'Official Genoa CFC partnership branding and training identity.',
  'Regular updates and communication via WhatsApp, email or phone, as agreed at registration.',
  'Access to the Genoa Football Academy app for schedules, attendance and development tracking, once launched.',
];

/* ── Terms & policies ──────────────────────────────────────────── */
export interface PolicyItem {
  title: string;
  text: string;
}

export const POLICIES: PolicyItem[] = [
  {
    title: 'Terms & payment',
    text: 'The academy year runs over three terms — 13, 7 and 13 weeks, 33 weeks in total. Each term can be paid upfront or split into monthly instalments; the Full Season price covers all three terms paid upfront. Payment methods, due dates and late-payment handling are covered in the Academy’s Payment Policy.',
  },
  {
    title: 'Cancellations & missed sessions',
    text: 'Cancellations, missed sessions and refunds are covered in the Academy’s Refund & Missed Session Policy, shared with parents at registration.',
  },
  {
    title: 'Changes to this guide',
    text: 'Programme structure and pricing may be updated from time to time. Parents are notified of any material change before it takes effect.',
  },
];

/* ── Coaches ── head coach + assistant coach ───────────────────── */
export interface Coach {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export const COACHES: Coach[] = [
  {
    name: 'Augusto Podestà',
    role: 'Head Coach',
    bio: 'UEFA A Licence coach (Italian Football Federation, licence 52345) leading the academy’s technical programme, methodology and coach development.',
    initials: 'AP',
  },
  {
    name: 'Yaqoob Al Sawafi',
    role: 'Assistant Coach',
    bio: 'Supports every age group on the pitch — session delivery, individual feedback and player development tracking through the term.',
    initials: 'YA',
  },
];

/* ── News ── edited via the dashboard / Telegram bot ───────────── */

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

/* ── FAQ ───────────────────────────────────────────────────────── */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'What ages do you accept?',
    a: 'We welcome boys and girls from age 5 to 16, grouped by age (U6, U8, U10, U12, U14 and U16) so every player trains at the right level.',
  },
  {
    q: 'Which days and times do you train?',
    a: 'All age groups train on Monday, Wednesday and Thursday, and each group keeps a fixed time slot. U6 and U8 train 4:30–5:30 PM in winter and 5:00–6:00 PM in summer (60 minutes). U10 and U12 train 5:30–7:00 PM in winter and 6:00–7:30 PM in summer (90 minutes). U14 and U16 train 7:00–8:30 PM in winter and 7:30–9:00 PM in summer (90 minutes).',
  },
  {
    q: 'How many sessions a week are there?',
    a: 'You choose either 2 or 3 sessions per week when you register, and the fee follows your choice. Both options run on the same Monday, Wednesday and Thursday schedule.',
  },
  {
    q: 'Where does training take place?',
    a: 'All sessions take place in Muscat, Oman. The exact venue and directions are shared with parents when registration is confirmed.', // TODO(OWNER): add venue name
  },
  {
    q: 'What language is coaching delivered in?',
    a: 'Sessions are delivered in English, Arabic and Italian, so every player feels at home on the pitch.',
  },
  {
    q: 'What should my child bring?',
    a: 'Football boots (astro turf or firm ground), shin pads, a water bottle and plenty of energy. Every registered player also receives the full Genoa Football Academy training kit, as selected at registration.',
  },
  {
    q: 'How much does it cost?',
    a: 'Fees depend on the age band and the number of weekly sessions. For U6–U8 a term costs from OMR 195 (2 sessions/week) or OMR 275 (3 sessions/week); for U10–U16, from OMR 200 or OMR 280. Full Season prices run from OMR 485 to OMR 685. The full table is on the Programs page.',
  },
  {
    q: 'How do we register?',
    a: 'Fill in the application form on the Join page — our team will contact you on WhatsApp within 24 hours to arrange a first trial session.',
  },
];
