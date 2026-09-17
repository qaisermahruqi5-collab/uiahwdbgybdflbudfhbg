// GET  -> current news, schedule, pricing and coaches (needs a session)
// PUT  -> save any of them (needs a session AND the passcode again)
//
// Re-asking for the passcode on every save is deliberate: a walked-away
// laptop with a live session still cannot publish to the website.

import { hasSession, passcodeMatches, json, authConfigError } from './lib/auth.mjs';

const GITHUB_ENV = ['GITHUB_REPO', 'GITHUB_TOKEN'];

/** Missing GitHub settings, named — the editor cannot load content without them. */
function missingGithubConfig() {
  return GITHUB_ENV.filter((name) => !process.env[name]);
}
import {
  readJson, writeJson, diagnoseAccess, explainWriteFailure,
  NEWS_PATH, SCHEDULE_PATH, PRICING_PATH, COACHES_PATH,
} from './lib/github.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXT = 4000;
const MAX_AMOUNT = 100000;
const TERM_IDS = ['term1', 'term2', 'term3'];
const FREQUENCIES = [2, 3];

function str(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

/** A list of non-empty strings, capped in both item length and count. */
function textList(value, max = MAX_TEXT, limit = 40) {
  if (!Array.isArray(value)) return [];
  return value.map(v => str(v, max).trim()).filter(Boolean).slice(0, limit);
}

/** A money or count figure: finite, not negative, and not absurd. */
function amount(value, where) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${where} must be a number, and cannot be negative`);
  if (n > MAX_AMOUNT) throw new Error(`${where} looks wrong — ${n} is above the ${MAX_AMOUNT} limit`);
  return Math.round(n * 1000) / 1000;
}

/** Reject anything that is not the exact shape the site expects. */
function sanitiseNews(payload) {
  if (!payload || !Array.isArray(payload.items)) throw new Error('news must have an items array');
  if (payload.items.length > 200) throw new Error('too many news items (max 200)');

  const seen = new Set();
  const items = payload.items.map((raw, i) => {
    const id = str(raw?.id, 80).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!id) throw new Error(`news item ${i + 1} has no id`);
    if (seen.has(id)) throw new Error(`duplicate news id "${id}"`);
    seen.add(id);

    const date = str(raw?.date, 10);
    if (!ISO_DATE.test(date)) throw new Error(`news item "${id}" needs a date as YYYY-MM-DD`);
    if (!str(raw?.title, 300).trim()) throw new Error(`news item "${id}" needs a title`);

    const img = raw?.image;
    const image = img && typeof img === 'object' && str(img.jpg, 300)
      ? {
          webp: str(img.webp, 300),
          jpg: str(img.jpg, 300),
          width: Number(img.width) || 1600,
          height: Number(img.height) || 900,
          alt: str(img.alt, 300),
          ...(str(img.altAr, 300) ? { altAr: str(img.altAr, 300) } : {}),
        }
      : null;

    return {
      id,
      date,
      category: str(raw?.category, 60),
      categoryAr: str(raw?.categoryAr, 60),
      title: str(raw?.title, 300),
      titleAr: str(raw?.titleAr, 300),
      excerpt: str(raw?.excerpt),
      excerptAr: str(raw?.excerptAr),
      image,
    };
  });

  return { _comment: payload._comment ?? undefined, items };
}

function sanitiseSchedule(payload, current) {
  if (!payload || !Array.isArray(payload.squads)) throw new Error('schedule must have a squads array');

  // Squad ids are fixed by the site; an editor may change times, never the set.
  // ═══════════════════════════════════════════════════════════════
  // THIS FUNCTION IS AN ALLOW-LIST, NOT A PASS-THROUGH. Each object is
  // rebuilt field by field, so a field missing from the lists below is
  // DELETED from content/schedule.json on the next save — silently, and
  // the site then renders a blank where it used to be. If you add a
  // field to the schedule file, add it here too.
  //
  // TERMINOLOGY (matches src/data/content.ts — do not reintroduce
  // "sessions", which used to mean both of these at once):
  //   time      the daily slot, e.g. '6:00 – 7:30 pm'
  //   duration  how long ONE training lasts, e.g. '90 minutes'
  //   frequency the per-week choice, e.g. '2 or 3 training days / week'
  // ═══════════════════════════════════════════════════════════════
  const allowed = new Set((current?.squads ?? []).map(s => s.id));
  const squads = payload.squads
    .filter(s => allowed.size === 0 || allowed.has(s?.id))
    .map(s => ({
      id: str(s.id, 20),
      days: str(s.days, 120), daysAr: str(s.daysAr, 120),
      time: str(s.time, 120), timeAr: str(s.timeAr, 120),
      duration: str(s.duration, 60), durationAr: str(s.durationAr, 60),
      frequency: str(s.frequency, 120), frequencyAr: str(s.frequencyAr, 120),
    }));

  if (squads.length !== (current?.squads ?? squads).length) {
    throw new Error('schedule must contain every squad — none may be added or removed here');
  }

  // `dates` is the only part of a term that changes year to year, which is
  // why the label ('Term 1') and the dates are separate fields.
  const terms = (Array.isArray(payload.terms) ? payload.terms : []).map(t => ({
    id: str(t.id, 20),
    term: str(t.term, 80), termAr: str(t.termAr, 80),
    duration: str(t.duration, 60), durationAr: str(t.durationAr, 60),
    dates: str(t.dates, 120), datesAr: str(t.datesAr, 120),
  }));

  // Preserve the weekly grid headings. Omitting them here would silently
  // delete them from the file on the next save.
  const trainingDays = (Array.isArray(payload.trainingDays) ? payload.trainingDays : current?.trainingDays ?? [])
    .map(d => ({ en: str(d?.en, 20), ar: str(d?.ar, 40) }));

  return { _comment: payload._comment ?? current?._comment, trainingDays, squads, terms };
}

/* ── Coaches ───────────────────────────────────────────────────────
   Mirrors the fail-safe in src/data/coaches.ts: any status that is not
   exactly 'confirmed' becomes 'placeholder', so a half-filled entry
   renders as a labelled open slot and never as a real person.      */
function sanitiseCoaches(payload) {
  if (!payload || !Array.isArray(payload.coaches)) throw new Error('coaches must have a coaches array');
  if (payload.coaches.length > 40) throw new Error('too many coaches (max 40)');

  const seen = new Set();
  const coaches = payload.coaches.map((raw, i) => {
    const id = str(raw?.id, 80).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!id) throw new Error(`coach ${i + 1} has no id`);
    if (seen.has(id)) throw new Error(`duplicate coach id "${id}"`);
    seen.add(id);
    if (!str(raw?.name, 160).trim()) throw new Error(`coach ${i + 1} needs a name`);

    const img = raw?.photo;
    const photo = img && typeof img === 'object' && str(img.jpg, 300)
      ? {
          ...(str(img.webp, 300) ? { webp: str(img.webp, 300) } : {}),
          jpg: str(img.jpg, 300),
          width: Number(img.width) || 720,
          height: Number(img.height) || 960,
        }
      : null;

    return {
      id,
      name: str(raw?.name, 160),
      role: str(raw?.role, 160),
      credentials: str(raw?.credentials, 300),
      languages: textList(raw?.languages, 60, 12),
      bio: str(raw?.bio),
      detail: textList(raw?.detail, MAX_TEXT, 40),
      initials: str(raw?.initials, 4) || '—',
      ...(photo ? { photo } : {}),
      status: raw?.status === 'confirmed' ? 'confirmed' : 'placeholder',
    };
  });

  return { _comment: payload._comment ?? undefined, coaches };
}

/* ── Pricing ───────────────────────────────────────────────────────
   The money, and the most dangerous thing this endpoint writes.

   Which age groups share a price list is STRUCTURAL and is taken from
   the file already on disk — Studio edits figures, never the mapping.

   The season/term invariant is enforced here as well as at build time.
   Both are needed: this one refuses the save with a sentence the editor
   can act on, while the build-time check in src/data/pricing.ts is the
   backstop for a file edited by hand.                              */
function sanitisePricing(payload, current) {
  if (!payload || !Array.isArray(payload.bands)) throw new Error('pricing must have a bands array');

  const seasonDiscountPct = amount(payload.seasonDiscountPct, 'the season discount');
  if (seasonDiscountPct > 100) throw new Error('the season discount cannot be more than 100%');

  const termStructure = TERM_IDS.map(id => {
    const raw = (Array.isArray(payload.termStructure) ? payload.termStructure : []).find(t => t?.id === id);
    if (!raw) throw new Error(`pricing is missing the structure for ${id}`);
    const weeks = amount(raw.weeks, `${id} weeks`);
    const instalments = amount(raw.instalments, `${id} instalments`);
    if (weeks < 1) throw new Error(`${id} must have at least one week`);
    if (instalments < 1) throw new Error(`${id} must have at least one instalment`);
    return { id, weeks, instalments };
  });

  const bandIds = (current?.bands ?? []).map(b => b.id);
  const ids = bandIds.length ? bandIds : payload.bands.map(b => str(b?.id, 40));

  const bands = ids.map(id => {
    const raw = payload.bands.find(b => b?.id === id);
    if (!raw) throw new Error(`pricing is missing the "${id}" band — bands cannot be added or removed here`);

    const programs = (current?.bands ?? []).find(b => b.id === id)?.programs
      ?? textList(raw.programs, 20, 20);

    const rows = FREQUENCIES.map(frequency => {
      const r = (Array.isArray(raw.rows) ? raw.rows : []).find(x => Number(x?.frequency) === frequency);
      if (!r) throw new Error(`the "${id}" band has no row for ${frequency} training days a week`);

      const row = { frequency };
      for (const term of TERM_IDS) {
        const t = r[term] ?? {};
        row[term] = {
          upfront: amount(t.upfront, `${id}, ${frequency} days, ${term} paid up front`),
          monthly: amount(t.monthly, `${id}, ${frequency} days, ${term} monthly`),
        };
      }
      row.fullSeason = amount(r.fullSeason, `${id}, ${frequency} days, full season`);

      const sum = row.term1.upfront + row.term2.upfront + row.term3.upfront;
      if (row.fullSeason > sum) {
        throw new Error(
          `${id}, ${frequency} days a week: the full season (${row.fullSeason}) costs more than the ` +
          `three terms added up (${sum}). The season price is the discounted one — it must be lower.`
        );
      }
      return row;
    });

    return { id, programs, rows };
  });

  return { _comment: payload._comment ?? current?._comment, seasonDiscountPct, termStructure, bands };
}

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);

  if (request.method === 'GET') {
    const missingGithub = missingGithubConfig();
    if (missingGithub.length > 0) {
      return json(
        {
          error:
            `Signed in, but ${missingGithub.join(' and ')} ` +
            `${missingGithub.length > 1 ? 'are' : 'is'} not set on the server, so the ` +
            'editor cannot read your news and schedule. Add them in Netlify under ' +
            'Site configuration > Environment variables, then redeploy.',
        },
        503
      );
    }

    // Without this the GitHub call rejects unhandled and Netlify returns a bare
    // 500, which tells the person signing in nothing at all.
    try {
      const [news, schedule, pricing, coaches] = await Promise.all([
        readJson(NEWS_PATH),
        readJson(SCHEDULE_PATH),
        readJson(PRICING_PATH),
        readJson(COACHES_PATH),
      ]);
      if (!news.data || !schedule.data) {
        // A 404 here is ambiguous: the file may be missing, or the token may
        // simply be unable to see a private repo. Ask GitHub which it is.
        const access = await diagnoseAccess();
        if (!access.repoVisible) return json({ error: access.reason }, 502);
        return json(
          {
            error:
              `Signed in and the repository is reachable, but content/news.json or ` +
              `content/schedule.json is missing on branch ${access.defaultBranch ?? 'main'}.`,
          },
          502
        );
      }
      // pricing and coaches are deliberately NOT required. They arrived
      // after news and schedule, so a dashboard pointed at a repository
      // that predates them must still load rather than refusing to open.
      return json({
        news: news.data, newsSha: news.sha,
        schedule: schedule.data, scheduleSha: schedule.sha,
        pricing: pricing.data ?? null, pricingSha: pricing.sha,
        coaches: coaches.data ?? null, coachesSha: coaches.sha,
      });
    } catch (err) {
      const detail = String(err.message ?? err);
      const hint = detail.includes(': 401') || detail.includes(': 403')
        ? 'GITHUB_TOKEN is missing, expired, or lacks Contents: read and write on this repo.'
        : detail.includes(': 404')
          ? 'GITHUB_REPO may be wrong, or the token cannot see that repository.'
          : detail;
      return json({ error: `Could not read content from GitHub. ${hint}` }, 502);
    }
  }

  if (request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  // The whole point of this endpoint's security: session is not enough.
  if (!passcodeMatches(body?.passcode)) {
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'Incorrect admin passcode — nothing was published' }, 401);
  }

  const who = str(body?.author, 80) || 'dashboard';
  const written = [];

  try {
    if (body.news) {
      const current = await readJson(NEWS_PATH);
      const clean = sanitiseNews(body.news);
      await writeJson({
        path: NEWS_PATH,
        data: clean,
        sha: current.sha,
        message: `Update news (${clean.items.length} posts) via ${who}`,
      });
      written.push('news');
    }

    if (body.schedule) {
      const current = await readJson(SCHEDULE_PATH);
      const clean = sanitiseSchedule(body.schedule, current.data);
      await writeJson({
        path: SCHEDULE_PATH,
        data: clean,
        sha: current.sha,
        message: `Update training schedule via ${who}`,
      });
      written.push('schedule');
    }

    if (body.pricing) {
      const current = await readJson(PRICING_PATH);
      const clean = sanitisePricing(body.pricing, current.data);
      await writeJson({
        path: PRICING_PATH,
        data: clean,
        sha: current.sha,
        message: `Update pricing via ${who}`,
      });
      written.push('pricing');
    }

    if (body.coaches) {
      const current = await readJson(COACHES_PATH);
      const clean = sanitiseCoaches(body.coaches);
      await writeJson({
        path: COACHES_PATH,
        data: clean,
        sha: current.sha,
        message: `Update coaches (${clean.coaches.length}) via ${who}`,
      });
      written.push('coaches');
    }
  } catch (err) {
    // A rejected GitHub write and a rejected field both land here. The first
    // needs the token explained; the second is already a plain sentence, and
    // explainWriteFailure passes those through untouched.
    const message = await explainWriteFailure(err);
    const isPermission = /cannot write|invalid or has expired/.test(message);
    return json({ error: message }, isPermission ? 502 : 400);
  }

  if (written.length === 0) return json({ error: 'Nothing to save' }, 400);
  return json({ ok: true, written });
}

export const config = { path: ['/api/admin/content', '/studio-io/content'] };
