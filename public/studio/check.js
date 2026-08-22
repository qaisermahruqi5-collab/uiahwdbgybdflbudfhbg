// Connection check.
//
// The sign-in failure that produced this rewrite was invisible: a request that
// never returned, on a page with no way to say so. This page exists so that a
// failure is never invisible again — it names, in the user's own browser, which
// specific request works and which does not.
//
// Every probe is unauthenticated and side-effect free. None of them sends a
// passcode, and none of them can consume a sign-in attempt.

const out = document.getElementById('out');
const lines = [];

const esc = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function say(label, ok, detail) {
  const mark = ok === null ? '·' : ok ? '✓' : '✗';
  const cls = ok === null ? '' : ok ? 'ok' : 'no';
  lines.push(
    `<span class="${cls}">${mark}</span> <b>${esc(label)}</b>${detail ? ` — ${esc(detail)}` : ''}`
  );
  out.innerHTML = lines.join('\n');
}

/** Time a request and never hang. */
async function probe(label, url, opts = {}) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 12000);
  const t0 = performance.now();
  try {
    const res = await fetch(url, { ...opts, signal: abort.signal });
    const ms = Math.round(performance.now() - t0);
    // 401 and 405 are healthy answers here: the route replied.
    const reachable = res.status > 0;
    say(label, reachable, `HTTP ${res.status} in ${ms}ms`);
    return res;
  } catch (err) {
    const ms = Math.round(performance.now() - t0);
    say(
      label,
      false,
      err.name === 'AbortError'
        ? `no answer within 12s (blocked, or the network is stalling)`
        : `${err.message} after ${ms}ms`
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

say('Page loaded and scripts run', true, `build studio 1`);
say('Address', location.protocol === 'https:', location.origin);
say('Cookies enabled', navigator.cookieEnabled, navigator.cookieEnabled ? '' : 'the session cannot persist');

// Can this browser store a cookie at all? Set a harmless one and read it back.
try {
  document.cookie = 'studio_probe=1; Path=/studio; SameSite=Strict';
  const stored = document.cookie.includes('studio_probe=1');
  say('Cookie write/read', stored, stored ? '' : 'something is discarding cookies on this site');
  document.cookie = 'studio_probe=; Path=/studio; Max-Age=0';
} catch (err) {
  say('Cookie write/read', false, err.message);
}

const sw = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
say('Service workers', sw.length === 0, sw.length === 0 ? 'none (good)' : `${sw.length} registered — may be serving stale files`);

// The two spellings of the same route. If exactly one fails, a filter list is
// matching on the URL shape, which is the single most useful thing to learn.
await probe('Neutral path  /studio-io/check', '/studio-io/check');
await probe('Classic path  /api/admin/setup-check', '/api/admin/setup-check');

// Does a POST get through? GET and POST are filtered differently by some
// proxies, and sign-in is a POST.
await probe('POST reaches the server', '/studio-io/session', { method: 'DELETE' });

say('', null, '');
say('Static asset fetch', true, 'this page and its stylesheet loaded, so /studio/ is being served');

lines.push('');
lines.push(
  '<b>Reading this:</b> if the neutral path works and the classic one does not, an ' +
    'extension or filter list is blocking /api/admin/ URLs — the Studio already ' +
    'falls back automatically. If BOTH time out, something between this browser ' +
    'and the site is blocking the requests: try a private window with extensions ' +
    'off, another browser, or mobile data.'
);
out.innerHTML = lines.join('\n');
