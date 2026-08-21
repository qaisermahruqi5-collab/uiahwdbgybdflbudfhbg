// GET  -> current news + schedule (needs a session)
// PUT  -> save news and/or schedule (needs a session AND the passcode again)
//
// Re-asking for the passcode on every save is deliberate: a walked-away
// laptop with a live session still cannot publish to the website.

import { hasSession, passcodeMatches, json } from './lib/auth.mjs';
import { readJson, writeJson, NEWS_PATH, SCHEDULE_PATH } from './lib/github.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXT = 4000;

function str(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.slice(0, max) : '';
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
  const allowed = new Set((current?.squads ?? []).map(s => s.id));
  const squads = payload.squads
    .filter(s => allowed.size === 0 || allowed.has(s?.id))
    .map(s => ({
      id: str(s.id, 20),
      days: str(s.days, 120), daysAr: str(s.daysAr, 120),
      winterTime: str(s.winterTime, 120), winterTimeAr: str(s.winterTimeAr, 120),
      summerTime: str(s.summerTime, 120), summerTimeAr: str(s.summerTimeAr, 120),
      duration: str(s.duration, 60), durationAr: str(s.durationAr, 60),
      sessions: str(s.sessions, 120), sessionsAr: str(s.sessionsAr, 120),
    }));

  if (squads.length !== (current?.squads ?? squads).length) {
    throw new Error('schedule must contain every squad — none may be added or removed here');
  }

  const terms = (Array.isArray(payload.terms) ? payload.terms : []).map(t => ({
    id: str(t.id, 20),
    term: str(t.term, 80), termAr: str(t.termAr, 80),
    duration: str(t.duration, 60), durationAr: str(t.durationAr, 60),
  }));

  return { _comment: payload._comment ?? current?._comment, squads, terms };
}

export default async function handler(request) {
  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);

  if (request.method === 'GET') {
    // Without this the GitHub call rejects unhandled and Netlify returns a bare
    // 500, which tells the person signing in nothing at all.
    try {
      const [news, schedule] = await Promise.all([readJson(NEWS_PATH), readJson(SCHEDULE_PATH)]);
      if (!news.data || !schedule.data) {
        return json(
          { error: `content/*.json not found in ${process.env.GITHUB_REPO ?? 'the configured repo'} on branch main.` },
          502
        );
      }
      return json({ news: news.data, newsSha: news.sha, schedule: schedule.data, scheduleSha: schedule.sha });
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
  } catch (err) {
    return json({ error: String(err.message ?? err) }, 400);
  }

  if (written.length === 0) return json({ error: 'Nothing to save' }, 400);
  return json({ ok: true, written });
}

export const config = { path: '/api/admin/content' };
