// POST { passcode } -> sets a signed, HttpOnly session cookie.
// The session only grants VIEWING. Every write re-checks the passcode.

import { passcodeMatches, createSessionToken, sessionCookieHeader, clearedCookieHeader, json } from './lib/auth.mjs';

export default async function handler(request) {
  if (request.method === 'DELETE') {
    return json({ ok: true }, 200, { 'Set-Cookie': clearedCookieHeader() });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  if (!passcodeMatches(body?.passcode)) {
    // Deliberately slow + vague: no hint about whether the passcode was close.
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'Incorrect passcode' }, 401);
  }

  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookieHeader(createSessionToken()) });
}

export const config = { path: '/api/admin/login' };
