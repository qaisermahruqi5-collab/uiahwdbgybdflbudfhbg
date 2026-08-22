// ═══════════════════════════════════════════════════════════════════
// AUTH — one shared admin passcode, used by BOTH the dashboard and the
// Telegram bot. Nothing here ever logs or returns the passcode.
// ═══════════════════════════════════════════════════════════════════

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Read a required env var, failing loudly rather than silently misbehaving. */
export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/* ── Configuration guard ──────────────────────────────────
   These two variables are what make any sign-in possible at all. When
   one is missing the old behaviour was actively misleading: an unset
   ADMIN_PASSWORD made every correct passcode come back as "Incorrect
   passcode", burning the five attempts and then locking the owner out
   for an hour — over a passcode that was never the problem. An unset
   ADMIN_SESSION_SECRET threw, and Netlify turned that into a bare 500.

   Check up front instead, and name the missing variable. The NAMES are
   not secrets; the values are never read out.                        */

const AUTH_ENV = ['ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];

export function missingAuthConfig() {
  return AUTH_ENV.filter((name) => !process.env[name]);
}

/**
 * A ready-to-return 503 when sign-in cannot work at all, or undefined when
 * the configuration is complete. Call this FIRST in every handler that
 * touches a session or a passcode.
 */
export function authConfigError() {
  const missing = missingAuthConfig();
  if (missing.length === 0) return undefined;

  const plural = missing.length > 1;
  return json(
    {
      error:
        `This site is not finished being set up: ${missing.join(' and ')} ` +
        `${plural ? 'are' : 'is'} not set on the server. In Netlify open ` +
        'Site configuration > Environment variables, add ' +
        `${plural ? 'them' : 'it'} with the scope set to "All scopes", then ` +
        'redeploy the site. This is NOT a wrong passcode — no passcode can ' +
        'work until this is done, so retrying will not help.',
    },
    503
  );
}

/**
 * Constant-time passcode comparison. A plain `===` leaks the length of the
 * matching prefix through timing, which is exactly what a brute-forcer
 * measures.
 */
export function passcodeMatches(candidate) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) return false;

  // Hash both sides first so the buffers are always equal length — timingSafeEqual
  // throws on length mismatch, which would itself leak the length.
  const key = requireEnv('ADMIN_SESSION_SECRET');
  const a = createHmac('sha256', key).update(candidate).digest();
  const b = createHmac('sha256', key).update(expected).digest();
  return timingSafeEqual(a, b);
}

/* ── Dashboard session cookie ─────────────────────────────────────
   Signed, not encrypted — it carries no secret, only an expiry. The
   signature is what makes it unforgeable.                          */

export const SESSION_COOKIE = 'ga_admin';

export function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, n: randomBytes(8).toString('hex') });
  const body = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', requireEnv('ADMIN_SESSION_SECRET')).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function sessionIsValid(token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  const expected = createHmac('sha256', requireEnv('ADMIN_SESSION_SECRET')).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export function sessionCookieHeader(token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearedCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function readCookie(request, name) {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return undefined;
}

/** True when the caller holds a valid dashboard session.
 *  Never throws: handlers report a missing secret through authConfigError(),
 *  so this must not turn one into an unexplained 500. */
export function hasSession(request) {
  try {
    return sessionIsValid(readCookie(request, SESSION_COOKIE));
  } catch {
    return false;
  }
}

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}
