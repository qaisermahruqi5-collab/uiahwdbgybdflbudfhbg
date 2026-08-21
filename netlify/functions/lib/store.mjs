// ═══════════════════════════════════════════════════════════════════
// STORE — short-lived state that must NOT become a git commit:
// Telegram conversation drafts, unlocked chats, brute-force counters.
// Backed by Netlify Blobs.
// ═══════════════════════════════════════════════════════════════════

import { getStore } from '@netlify/blobs';

const STORE_NAME = 'genoa-admin';

function store() {
  return getStore(STORE_NAME);
}

async function readJson(key, fallback) {
  try {
    const value = await store().get(key, { type: 'json' });
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await store().setJSON(key, value);
  } catch {
    /* Storage unavailable. Callers treat this as "no record kept" rather than
       failing the request — a blob outage must not lock the owner out. */
  }
}

/* ── Telegram: who is currently unlocked ──────────────────────────
   Auto-added on first correct passcode, expires after 12h. This is a
   cache of "has proven they know the passcode", NOT a pre-shared list. */

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export async function isUnlocked(chatId) {
  const sessions = await readJson('tg-sessions', {});
  const entry = sessions[String(chatId)];
  return Boolean(entry && entry.exp > Date.now());
}

export async function unlock(chatId, name) {
  const sessions = await readJson('tg-sessions', {});
  sessions[String(chatId)] = { exp: Date.now() + SESSION_TTL_MS, name: name ?? '', since: Date.now() };
  await writeJson('tg-sessions', sessions);
}

export async function lock(chatId) {
  const sessions = await readJson('tg-sessions', {});
  delete sessions[String(chatId)];
  await writeJson('tg-sessions', sessions);
}

export async function listUnlocked() {
  const sessions = await readJson('tg-sessions', {});
  const now = Date.now();
  return Object.entries(sessions)
    .filter(([, v]) => v.exp > now)
    .map(([id, v]) => ({ id, name: v.name, expiresInMinutes: Math.round((v.exp - now) / 60000) }));
}

/* ── Brute-force guard ────────────────────────────────────────────
   Shared by the Telegram bot (keyed by chat id) and the dashboard
   login (keyed by client IP). Both are publicly reachable, so both
   need it: 5 wrong tries, then a one-hour cooldown.                 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 60 * 60 * 1000;

export async function checkLockout(chatId) {
  const all = await readJson('auth-attempts', {});
  const entry = all[String(chatId)];
  if (!entry) return { lockedOut: false, remaining: MAX_ATTEMPTS };
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    return { lockedOut: true, minutes: Math.ceil((entry.lockedUntil - Date.now()) / 60000) };
  }
  const fresh = entry.first && Date.now() - entry.first < WINDOW_MS ? entry.count : 0;
  return { lockedOut: false, remaining: Math.max(0, MAX_ATTEMPTS - fresh) };
}

export async function recordFailure(chatId) {
  const all = await readJson('auth-attempts', {});
  const key = String(chatId);
  const entry = all[key] ?? {};
  const withinWindow = entry.first && Date.now() - entry.first < WINDOW_MS;

  const count = withinWindow ? (entry.count ?? 0) + 1 : 1;
  const first = withinWindow ? entry.first : Date.now();
  all[key] = { count, first, ...(count >= MAX_ATTEMPTS ? { lockedUntil: Date.now() + LOCKOUT_MS } : {}) };

  await writeJson('auth-attempts', all);
  return { lockedOut: count >= MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - count) };
}

export async function clearFailures(chatId) {
  const all = await readJson('auth-attempts', {});
  delete all[String(chatId)];
  await writeJson('auth-attempts', all);
}

/* ── Telegram: in-progress draft for one chat ─────────────────── */

export async function getDraft(chatId) {
  const drafts = await readJson('tg-drafts', {});
  return drafts[String(chatId)];
}

export async function setDraft(chatId, draft) {
  const drafts = await readJson('tg-drafts', {});
  if (draft === undefined) delete drafts[String(chatId)];
  else drafts[String(chatId)] = draft;
  await writeJson('tg-drafts', drafts);
}
