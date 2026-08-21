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

/** True when the caller holds a valid dashboard session. */
export function hasSession(request) {
  return sessionIsValid(readCookie(request, SESSION_COOKIE));
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
