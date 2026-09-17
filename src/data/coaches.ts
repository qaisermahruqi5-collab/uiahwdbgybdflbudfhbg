// ═══════════════════════════════════════════════════════════════════
// COACHES — the coaching staff, as DATA.
//
// The staff themselves live in content/coaches.json, which Studio edits
// and publishes. This file owns the TYPES and the normalisation, so the
// dashboard can never hand the site a shape the components do not
// expect. The Coaches section renders whatever is here, in this order.
//
// HOW TO ADD OR FILL IN A COACH
//   In Studio: Coaches tab. Add, reorder, fill in, publish.
//   By hand:   edit content/coaches.json directly.
//
//   1. Drop the portrait in public/ (e.g. public/coach-potepan.jpg,
//      plus a .webp twin for speed — see README → images), or upload it
//      in Studio, which puts it in public/uploads/ and fills in the path.
//   2. Portraits are rendered at a fixed 3:4 ratio and cropped to the
//      top, so any portrait-ish crop works.
//   3. Set status to 'confirmed' once the name, role and photo are the
//      client's final wording.
//
// FAIL-SAFE: any status that is not exactly 'confirmed' normalises to
// 'placeholder'. A half-filled or mistyped entry therefore renders as a
// visibly open slot rather than as a real person — the one mistake this
// data must never make.
//
// Called "Coaches" throughout, never "Staff" or "The team".
// ═══════════════════════════════════════════════════════════════════

import coachesData from '../../content/coaches.json';

export interface CoachPhoto {
  /** Preferred, smaller file. Optional — jpg alone is fine. */
  webp?: string;
  jpg: string;
  width: number;
  height: number;
}

export interface Coach {
  /** Stable key — also the anchor id, so a coach can be deep-linked. */
  id: string;
  name: string;
  role: string;
  /** Licence / credential line, e.g. 'UEFA B (Italy)'. Shown under the role. */
  credentials: string;
  /** Languages coaching is delivered in. Empty array hides the row. */
  languages: string[];
  /** Card bio — two or three sentences. Keep it readable, not a CV dump. */
  bio: string;
  /**
   * The longer story, revealed by "Read more". One string per paragraph
   * or bullet; rendered as a list. Empty array hides the control.
   */
  detail: string[];
  /** Monogram shown until a portrait is supplied. Latin, never localized. */
  initials: string;
  photo?: CoachPhoto;
  /**
   * 'placeholder' = an open slot awaiting the client's name and photo. It
   * renders as an obvious, labelled placeholder so it can never be mistaken
   * for a real coach. Set to 'confirmed' when the details are final.
   */
  status: 'confirmed' | 'placeholder';
}

/** The raw JSON shape, before normalisation. Every field is untrusted. */
interface RawCoach {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  credentials?: unknown;
  languages?: unknown;
  bio?: unknown;
  detail?: unknown;
  initials?: unknown;
  photo?: unknown;
  status?: unknown;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');

const textList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];

/** A photo is only usable with a jpg and real dimensions; otherwise none. */
function photoOf(v: unknown): CoachPhoto | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const p = v as Record<string, unknown>;
  const jpg = text(p.jpg);
  const width = typeof p.width === 'number' ? p.width : 0;
  const height = typeof p.height === 'number' ? p.height : 0;
  if (!jpg || width <= 0 || height <= 0) return undefined;
  const webp = text(p.webp);
  return { jpg, width, height, ...(webp ? { webp } : {}) };
}

function normalise(raw: RawCoach, index: number): Coach {
  return {
    id: text(raw.id) || `coach-${index + 1}`,
    name: text(raw.name),
    role: text(raw.role),
    credentials: text(raw.credentials),
    languages: textList(raw.languages),
    bio: text(raw.bio),
    detail: textList(raw.detail),
    initials: text(raw.initials) || '—',
    photo: photoOf(raw.photo),
    // Anything but an exact 'confirmed' is an open slot. See FAIL-SAFE above.
    status: raw.status === 'confirmed' ? 'confirmed' : 'placeholder',
  };
}

export const COACHES: Coach[] = (coachesData.coaches as RawCoach[]).map(normalise);
