// Sign-in page extras. STRICTLY OPTIONAL.
//
// The form posts on its own. Nothing here is required for signing in, and
// nothing here may prevent it — if this file fails to load, is blocked, or
// throws, the page must still work exactly as it does with JavaScript off.
// That is the whole design: the critical path has no JavaScript in it.

const BUILD = 'studio 1';

const stamp = document.getElementById('stamp');
if (stamp) stamp.textContent = BUILD;

/* Both spellings of the setup route. If a filter list blocks the /api/admin/
   shape — a very common rule — the neutral one still answers. */
const CHECK_PATHS = ['/studio-io/check', '/api/admin/setup-check'];

async function firstAnswer(paths, timeoutMs = 6000) {
  for (const path of paths) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const res = await fetch(path, { signal: abort.signal });
      if (res.ok) return await res.json();
    } catch {
      /* Try the next spelling. */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function warn(message) {
  const note = document.getElementById('setup-note');
  if (!note) return;
  note.textContent = message;
  note.hidden = false;
}

try {
  const info = await firstAnswer(CHECK_PATHS);

  if (info && !info.canSignIn) {
    const missing = info.missing?.signIn ?? [];
    const plural = missing.length > 1;
    warn(
      `This site is not finished being set up: ${missing.join(' and ')} ` +
        `${plural ? 'are' : 'is'} not set on the server, so no passcode can work yet. ` +
        `In Netlify open Site configuration > Environment variables, add ` +
        `${plural ? 'them' : 'it'} for all scopes, then redeploy.`
    );
  } else if (info) {
    const fmt = info.passcodeFormat ?? {};
    if (fmt.isWrappedInQuotes) {
      warn(
        'Heads up: ADMIN_PASSWORD in Netlify is wrapped in quote marks, and those ' +
          'quotes count as part of the passcode. Retype it without them and redeploy.'
      );
    } else if (fmt.hasSurroundingWhitespace) {
      warn(
        'Heads up: ADMIN_PASSWORD in Netlify starts or ends with a space, and that ' +
          'space counts as part of the passcode. Retype it and redeploy.'
      );
    }
  }
} catch {
  /* Never let a diagnostic break the door it is diagnosing. */
}
