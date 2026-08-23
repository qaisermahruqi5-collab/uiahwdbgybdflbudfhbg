// ═══════════════════════════════════════════════════════════════════
// PULSE — who is here now, and what has happened today.
//
// POST is public, because the public website has to be able to report
// that someone is reading it. GET requires a session, so only the owner
// ever sees the numbers.
//
// WHAT IS STORED, AND WHAT IS NOT
//
// Stored: a random id the browser invents for its own tab, which side it
// is on (website or studio), and a timestamp. Entries expire after three
// minutes and are deleted on the next read.
//
// NOT stored: no IP address, no cookie, no user agent, no page, no
// referrer, nothing that survives closing the tab, and nothing that can
// be joined up across visits. The id lives in sessionStorage, so it is
// gone when the tab closes and is never the same twice.
//
// This is a presence light, not analytics. It answers "is anyone here
// right now", and deliberately cannot answer anything else.
// ═══════════════════════════════════════════════════════════════════

import { hasSession, json, authConfigError } from './lib/auth.mjs';
import { recordPresence, countPresence, recordEvent, countEvents } from './lib/store.mjs';

/** How long a ping counts as "still here". Clients ping well inside this. */
const WINDOW_MS = 3 * 60 * 1000;

const WHERE = new Set(['site', 'studio']);

/** Ids come from a browser, so treat them as hostile: length- and charset-capped. */
function cleanId(value) {
  return String(value ?? '')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 40);
}

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  /* ── Reporting in: public, tiny, and impossible to read back ── */
  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: true }); // A malformed beacon is not worth an error.
    }

    if (body?.event === 'form') {
      await recordEvent('form');
      return json({ ok: true });
    }

    const where = WHERE.has(body?.where) ? body.where : null;
    const id = cleanId(body?.id);
    if (!where || !id) return json({ ok: true });

    await recordPresence(where, id);
    return json({ ok: true });
  }

  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  /* ── Reading the numbers: owner only ── */
  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);

  const [site, studio, forms] = await Promise.all([
    countPresence('site', WINDOW_MS),
    countPresence('studio', WINDOW_MS),
    countEvents('form'),
  ]);

  return json({
    now: { site, studio },
    forms,
    windowMinutes: Math.round(WINDOW_MS / 60000),
  });
}

export const config = { path: ['/studio-io/pulse', '/api/admin/pulse'] };
