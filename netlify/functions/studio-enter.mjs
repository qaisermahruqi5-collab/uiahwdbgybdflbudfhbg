// POST /studio-io/enter — sign in via a real, ordinary HTML form.
//
// ═══════════════════════════════════════════════════════════════════
// WHY THIS EXISTS, AND WHY IT IS NOT fetch()
//
// The previous dashboard signed in with fetch(). When that request never
// completed the page had nothing to show, because a blocked or stalled
// fetch produces no response, no error and no event — the button simply
// sat there. Extensions, filter lists, captive portals and corporate
// proxies can all kill an XHR to an /api/admin/* URL without a trace.
//
// A browser form POST cannot be silently swallowed in that way. The
// browser owns the navigation: it either lands on a new page or it shows
// its own error. There is no state where it looks like nothing happened.
//
// So this route takes a normal form submission and answers with a normal
// redirect. It works with JavaScript disabled entirely.
// ═══════════════════════════════════════════════════════════════════

import {
  passcodeMatches,
  createSessionToken,
  sessionCookieHeader,
  authConfigError,
} from './lib/auth.mjs';
import { checkLockout, recordFailure, clearFailures } from './lib/store.mjs';

const DESK = '/studio/desk.html';
const LOGIN = '/studio/';

function clientKey(request) {
  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    'unknown';
  return `login:${ip}`;
}

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

/**
 * The failure page. Server-rendered on purpose: the whole point of this route
 * is that it needs no working JavaScript to tell you what went wrong.
 */
function problemPage(message, status = 401) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Genoa Studio — sign in</title>
<link rel="icon" href="/favicon-32x32.png">
<link rel="stylesheet" href="/studio/studio.css">
</head>
<body class="gate-body">
  <main class="gate">
    <form class="gate-card" method="POST" action="/studio-io/enter" autocomplete="off">
      <img class="gate-mark" src="/logo.png" alt="" width="385" height="522">
      <p class="gate-eyebrow">Genoa Academy</p>
      <h1 class="gate-title">Studio</h1>
      <p class="gate-note" role="alert">${escape(message)}</p>
      <label class="gate-label" for="passcode">Admin passcode</label>
      <input class="gate-input" id="passcode" name="passcode" type="password"
             autocomplete="current-password" required autofocus>
      <button class="gate-go" type="submit">Sign in</button>
      <p class="gate-foot">Server-rendered sign-in — works without JavaScript.</p>
    </form>
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function redirect(location, extraHeaders = {}) {
  // 303 forces the browser to follow with GET, so a refresh on the destination
  // never re-submits the passcode.
  return new Response(null, {
    status: 303,
    headers: { Location: location, 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') return redirect(LOGIN);

  const notConfigured = authConfigError();
  if (notConfigured) {
    const { error } = await notConfigured.json();
    return problemPage(error, 503);
  }

  // The cookie is Secure; browsers discard a Secure cookie on an insecure
  // origin, so sign-in would appear to work and then not stick.
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  if (proto && proto !== 'https' && !isLocal) {
    return problemPage(
      `This page was served over ${proto}://, and the sign-in cookie requires https. ` +
        'Open the https:// address instead.',
      400
    );
  }

  let passcode = '';
  try {
    const form = await request.formData();
    passcode = String(form.get('passcode') ?? '');
  } catch {
    return problemPage('That form could not be read. Please try again.', 400);
  }

  const key = clientKey(request);
  const lockout = await checkLockout(key);
  if (lockout.lockedOut) {
    return problemPage(
      `Too many incorrect attempts. Try again in ${lockout.minutes} minute(s).`,
      429
    );
  }

  if (!passcodeMatches(passcode)) {
    await new Promise((r) => setTimeout(r, 600));
    const after = await recordFailure(key);
    return problemPage(
      after.lockedOut
        ? 'Too many incorrect attempts. This address is locked for 1 hour.'
        : `Incorrect passcode. ${after.remaining} attempt(s) left.`
    );
  }

  await clearFailures(key);
  const token = createSessionToken();

  /*
   * The cookie is the primary credential. The same token also rides along in
   * the URL fragment as a fallback for browsers that refuse the cookie — a
   * fragment is never sent to a server and never appears in a referrer, and
   * the desk page strips it from the address bar the moment it has read it.
   */
  return redirect(`${DESK}#k=${token}`, { 'Set-Cookie': sessionCookieHeader(token) });
}

export const config = { path: '/studio-io/enter' };
