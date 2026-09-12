// ═══════════════════════════════════════════════════════════════════
// COACHES — the coaching staff, as DATA. Adding a coach is an edit to
// this file and nothing else; the Coaches section renders whatever is
// here, in this order.
//
// HOW TO ADD OR FILL IN A COACH
//   1. Drop the portrait in public/ (e.g. public/coach-potepan.jpg,
//      plus a .webp twin for speed — see README → images).
//   2. Fill in `photo`. Portraits are rendered at a fixed 3:4 ratio and
//      cropped to the top, so any portrait-ish crop works.
//   3. Set `status: 'confirmed'` once the name, role and photo are the
//      client's final wording. Entries left as 'placeholder' render
//      visibly as an open slot — never as a real person.
//
// Called "Coaches" throughout, never "Staff" or "The team".
// ═══════════════════════════════════════════════════════════════════

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

export const COACHES: Coach[] = [
  {
    id: 'ivan-potepan',
    name: 'Ivan Marcelo Potepan',
    role: 'Head Coach',
    credentials: 'UEFA B (Italy) · AFA/CONMEBOL Pro (Argentina)',
    languages: ['Italian', 'Spanish', 'English'],
    bio: 'Ten years inside the youth sector at Club Atlético Rosario Central in Argentina, coaching Under-16 through to Primavera. Players he developed there went on to PSG, Tottenham, Ajax, River Plate and the Argentina national side. Most recently a first-team coach in Italy, with Imolese Calcio in Serie D.',
    detail: [
      'Under-16, Under-18, Under-20 and Primavera coach, Club Atlético Rosario Central (Argentina, Serie A), 2011–2021.',
      'First-team coach, Club Coronel Aguirre.',
      'First-team coach and league winner, A.C. Dozzese (2022–23).',
      'First-team coach, Valsanterno Calcio (2023–24) — runners-up, play-off finalists, and the division’s top attack with 74 goals.',
      'First-team coach, Imolese Calcio, Serie D (2025/26).',
      'Coach at Milan Camp in Italy and abroad, including St. Moritz, Switzerland.',
      'Manchester United Nike Cup, England (2014).',
      'Players developed and promoted to first-team professional football include Giovanni Lo Celso (Rosario Central → PSG, Real Betis, Tottenham, Argentina), Gastón Ávila (→ Boca Juniors, Ajax, Argentina), Rodrigo Villagra (→ River Plate, CSKA Moscow, Argentina), Maxi Lovera (→ Olympiacos), Joaquín Pereyra, Facundo Almada and Alan Marinelli.',
    ],
    initials: 'IP',
    photo: { webp: '/coach-potepan.webp', jpg: '/coach-potepan.jpg', width: 720, height: 960 },
    status: 'confirmed',
  },
  {
    id: 'yaqoob-al-sawafi',
    name: 'Yaqoob Al Sawafi',
    role: 'Assistant Coach',
    credentials: 'Academy coaching staff',
    languages: ['Arabic', 'English'],
    bio: 'Supports every age group on the pitch — session delivery, individual feedback and tracking each player’s development through the term.',
    detail: [],
    initials: 'YA',
    status: 'confirmed',
  },
  /* ── Open slots ────────────────────────────────────────────────────
     Awaiting names, photos and credentials from the client. These render
     as labelled placeholders, not as people. Fill them in above the line
     or replace them — see the header comment.                        */
  {
    id: 'coach-slot-2',
    name: 'Coach name to be confirmed',
    role: 'Age-group coach',
    credentials: 'Credentials to be confirmed',
    languages: [],
    bio: 'This coach’s name, photograph and credentials are still to be supplied by the academy.',
    detail: [],
    initials: '—',
    status: 'placeholder',
  },
  {
    id: 'coach-slot-3',
    name: 'Coach name to be confirmed',
    role: 'Goalkeeping coach',
    credentials: 'Credentials to be confirmed',
    languages: [],
    bio: 'This coach’s name, photograph and credentials are still to be supplied by the academy.',
    detail: [],
    initials: '—',
    status: 'placeholder',
  },
];
