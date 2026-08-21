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

  /*
   * The session cookie carries `Secure`, and browsers silently DISCARD a
   * Secure cookie on an insecure origin. Over plain http the sign-in would
   * appear to succeed and then immediately not stick, with nothing to
   * explain why. Refuse up front and say so.
   */
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  if (proto && proto !== 'https' && !isLocal) {
    return json(
      {
        error:
          `This site is being served over ${proto}://, and the sign-in cookie requires https. ` +
          'In Netlify go to Domain management > HTTPS, provision the certificate, and turn on ' +
          '"Force HTTPS". Until then you can use the https://<your-site>.netlify.app address.',
      },
      400
    );
  }

  if (!passcodeMatches(body?.passcode)) {
    // Deliberately slow + vague: no hint about whether the passcode was close.
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'Incorrect passcode' }, 401);
  }

  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookieHeader(createSessionToken()) });
}

export const config = { path: '/api/admin/login' };
