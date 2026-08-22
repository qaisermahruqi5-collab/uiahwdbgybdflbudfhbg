// GET /api/admin/setup-check — "is this site finished being set up?"
//
// Deliberately NOT behind the session, because it answers the one question
// you cannot otherwise ask: why sign-in is failing. /api/admin/health needs a
// session, so it is useless when the session is exactly what will not happen.
//
// It returns variable NAMES and booleans only — never a value, never a length,
// and never a hint about the passcode itself. This is the same fact the login
// endpoint already discloses in its 503, so it widens nothing: an attacker
// learns only "this site has no passcode set", which they would discover on
// their first request anyway. The owner, meanwhile, gets the answer without
// spending one of five attempts.

import { missingAuthConfig, json } from './lib/auth.mjs';

const CONTENT_ENV = ['GITHUB_REPO', 'GITHUB_TOKEN'];
const BOT_ENV = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET'];

const missingFrom = (names) => names.filter((name) => !process.env[name]);

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const signIn = missingAuthConfig();
  const content = missingFrom(CONTENT_ENV);
  const bot = missingFrom(BOT_ENV);

  return json({
    // Can anyone sign in at all? This is the one that blocks the front door.
    canSignIn: signIn.length === 0,
    missing: { signIn, content, bot },
    ready: signIn.length === 0 && content.length === 0,
  });
}

export const config = { path: '/api/admin/setup-check' };
