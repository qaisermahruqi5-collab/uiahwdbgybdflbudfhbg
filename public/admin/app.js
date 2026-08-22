// ═══════════════════════════════════════════════════════════════════
// Genoa Academy editor.
//
// Deliberately dependency-free and build-free: it is served as static
// files from the site's own origin, so it satisfies the site's strict
// CSP (script-src 'self') with no bundler and no extra pipeline.
//
// The session cookie only lets you LOOK. Publishing always re-asks for
// the passcode — the server enforces that too, this is not just UI.
// ═══════════════════════════════════════════════════════════════════

const API = {
  login: '/api/admin/login',
  content: '/api/admin/content',
  telegram: '/api/admin/telegram',
  upload: '/api/admin/upload',
};

/* Last-resort reporting. Without this, a module-level throw leaves the page
   looking alive but with no event handlers attached — you press Sign in and
   absolutely nothing happens, with nothing in the UI to explain it. */
function showFatal(what) {
  const box = document.getElementById('login-error') || document.body;
  box.hidden = false;
  box.textContent = `Editor error: ${what}. Hard-refresh the page; if it repeats, send this message on.`;
}
addEventListener('error', (e) => showFatal(e.message || 'script failed to load'));
addEventListener('unhandledrejection', (e) => showFatal(String(e.reason?.message ?? e.reason ?? 'request failed')));

const $ = (sel) => document.querySelector(sel);

/* Proof-of-life. If the login screen shows no build stamp, this file did not
   execute — which is a different problem from any error message below it. */
const BUILD = 'editor build 6';
document.addEventListener('DOMContentLoaded', () => {
  const stamp = document.getElementById('build-stamp');
  if (stamp) stamp.textContent = BUILD;
});
if (document.readyState !== 'loading') {
  const stamp = document.getElementById('build-stamp');
  if (stamp) stamp.textContent = BUILD;
}

const el = (tag, props = {}, kids = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of [].concat(kids)) node.append(kid);
  return node;
};

let state = { news: null, schedule: null, dirty: false };

/* ── Chrome helpers ───────────────────────────────────────────── */

function banner(message, bad = false) {
  const node = $('#banner');
  node.textContent = message;
  node.classList.toggle('bad', bad);
  node.hidden = !message;
  if (message && !bad) setTimeout(() => { if (node.textContent === message) node.hidden = true; }, 6000);
}

function markDirty() {
  state.dirty = true;
  $('#dirty').hidden = false;
}

// Guard against closing the tab with unpublished edits.
addEventListener('beforeunload', (e) => {
  if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
});

/* ── Sign in ──────────────────────────────────────────────────── */

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-error');
  err.hidden = true;

  let res;
  try {
    res = await fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: $('#login-pass').value }),
    });
  } catch (netErr) {
    err.textContent = `Could not reach the sign-in service (${netErr.message}). Check the site finished deploying.`;
    err.hidden = false;
    return;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let detail;
    try {
      detail = JSON.parse(body).error;
    } catch {
      // Not JSON: usually a 404 HTML page, i.e. the function is not deployed.
      detail = res.status === 404
        ? 'The sign-in function is not deployed. Check Netlify > Deploys succeeded, and that netlify.toml has a [functions] directory.'
        : `Server returned ${res.status}.`;
    }
    err.textContent = detail ?? 'Sign in failed';
    err.hidden = false;
    return;
  }
  $('#login-pass').value = '';
  await start();
});

$('#signout').addEventListener('click', async () => {
  if (state.dirty && !confirm('You have unpublished changes. Sign out anyway?')) return;
  await fetch(API.login, { method: 'DELETE' });
  location.reload();
});

/** Show a failure on whichever screen is actually visible. The editor's
    banner lives inside #app, so during sign-in it would render invisibly. */
function fail(message) {
  if (!$('#login').hidden) {
    const err = $('#login-error');
    err.textContent = message;
    err.hidden = false;
  } else {
    banner(message, true);
  }
}

async function start() {
  let res;
  try {
    res = await fetch(API.content);
  } catch {
    fail('Could not reach the server. Check your connection and try again.');
    return;
  }

  if (!res.ok) {
    const detail = (await res.json().catch(() => ({}))).error;
    fail(
      res.status === 401
        ? 'Signed in, but the session was rejected. Check the site is on https:// and cookies are enabled.'
        : `Signed in, but content could not load (${res.status}). ${detail ?? 'See Netlify > Logs > Functions.'}`
    );
    return;
  }

  const data = await res.json();
  state = { news: data.news ?? { items: [] }, schedule: data.schedule ?? { squads: [], terms: [] }, dirty: false };

  try {
    renderNews();
    renderSchedule();
  } catch (renderErr) {
    fail(`Loaded your content but could not draw it: ${renderErr.message}`);
    return;
  }

  $('#login').hidden = true;
  $('#app').hidden = false;
}

/* ── Tabs ─────────────────────────────────────────────────────── */

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    $('#tab-news').hidden = tab.dataset.tab !== 'news';
    $('#tab-schedule').hidden = tab.dataset.tab !== 'schedule';
    $('#tab-bot').hidden = tab.dataset.tab !== 'bot';
    if (tab.dataset.tab === 'bot') refreshBot();
  });
}

/* ── News ─────────────────────────────────────────────────────── */

function field(label, value, onInput, { textarea = false, rtl = false, type = 'text' } = {}) {
  // `type` must not be assigned to a textarea — the property is getter-only
  // and assigning it (even undefined) throws.
  const input = el(textarea ? 'textarea' : 'input', textarea ? { value: value ?? '' } : { value: value ?? '', type });
  if (rtl) { input.dir = 'rtl'; input.lang = 'ar'; }
  input.addEventListener('input', () => { onInput(input.value); markDirty(); });
  return el('div', { className: 'field' }, [el('label', { textContent: label }), input]);
}

function renderNews() {
  const host = $('#posts');
  host.replaceChildren();

  const items = state.news.items ?? [];
  $('#posts-empty').hidden = items.length > 0;

  items.forEach((post, index) => {
    const card = el('div', { className: 'card' });

    card.append(
      el('div', { className: 'card-head' }, [
        el('span', { className: 'card-title', textContent: post.title || 'Untitled post' }),
        el('div', { className: 'row' }, [
          el('button', {
            className: 'btn ghost', textContent: '↑', title: 'Move up', disabled: index === 0,
            onclick: () => { const a = items; [a[index - 1], a[index]] = [a[index], a[index - 1]]; markDirty(); renderNews(); },
          }),
          el('button', {
            className: 'btn ghost', textContent: '↓', title: 'Move down', disabled: index === items.length - 1,
            onclick: () => { const a = items; [a[index + 1], a[index]] = [a[index], a[index + 1]]; markDirty(); renderNews(); },
          }),
          el('button', {
            className: 'btn danger', textContent: 'Delete',
            onclick: () => {
              if (!confirm(`Delete "${post.title || 'this post'}"? It disappears from the website when you publish.`)) return;
              items.splice(index, 1); markDirty(); renderNews();
            },
          }),
        ]),
      ])
    );

    card.append(
      el('div', { className: 'grid2' }, [
        field('Date', post.date, (v) => { post.date = v; }, { type: 'date' }),
        field('Category', post.category, (v) => { post.category = v; }),
      ]),
      field('Headline (English)', post.title, (v) => { post.title = v; }),
      field('Summary (English)', post.excerpt, (v) => { post.excerpt = v; }, { textarea: true }),
      field('العنوان بالعربية', post.titleAr, (v) => { post.titleAr = v; }, { rtl: true }),
      field('الملخص بالعربية', post.excerptAr, (v) => { post.excerptAr = v; }, { textarea: true, rtl: true }),
      photoField(post)
    );

    host.append(card);
  });
}

function photoField(post) {
  const wrap = el('div', { className: 'photo' });

  const redraw = () => {
    wrap.replaceChildren();
    if (post.image?.jpg) {
      wrap.append(
        el('img', { src: post.image.jpg, alt: '' }),
        el('div', { className: 'field', style: 'flex:1;min-width:220px' }, [
          field('Photo description (for screen readers)', post.image.alt, (v) => { post.image.alt = v; }),
          el('button', {
            className: 'btn danger', textContent: 'Remove photo', type: 'button',
            onclick: () => { post.image = null; markDirty(); redraw(); },
          }),
        ])
      );
      return;
    }

    const drop = el('div', { className: 'drop', textContent: 'Drop a photo here, or click to choose one' });
    const picker = el('input', { type: 'file', accept: 'image/*', hidden: true });

    const handle = async (file) => {
      if (!file) return;
      drop.textContent = 'Resizing…';
      try {
        const resized = await resizeImage(file);
        drop.textContent = 'Uploading…';
        const passcode = await askPasscode('Uploading a photo commits it to the website repository.');
        if (!passcode) { redraw(); return; }

        const res = await fetch(API.upload, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode, filename: file.name, ...resized }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) { banner(body.error ?? 'Upload failed', true); redraw(); return; }

        post.image = { ...body.image, alt: post.title ?? '' };
        markDirty();
        banner('Photo uploaded. It appears on the site when you publish.');
        redraw();
      } catch (err) {
        banner(String(err.message ?? err), true);
        redraw();
      }
    };

    drop.addEventListener('click', () => picker.click());
    picker.addEventListener('change', () => handle(picker.files[0]));
    ['dragenter', 'dragover'].forEach((t) =>
      drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((t) =>
      drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => handle(e.dataTransfer?.files?.[0]));

    wrap.append(drop, picker);
  };

  redraw();
  return wrap;
}

/**
 * Shrink and re-encode in the browser. Doing it here rather than server-side
 * keeps the functions free of native image dependencies, and means a 12MP
 * phone photo never leaves the device at full size.
 */
async function resizeImage(file, maxEdge = 1600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const encode = (type, quality) =>
    new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error(`Could not encode ${type}`))),
        type,
        quality
      )
    );

  const [webp, jpg] = await Promise.all([encode('image/webp', 0.82), encode('image/jpeg', 0.85)]);
  const toBase64 = async (blob) => {
    const buf = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < buf.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };

  return { webpBase64: await toBase64(webp), jpgBase64: await toBase64(jpg), width, height };
}

$('#add-post').addEventListener('click', () => {
  state.news.items ??= [];
  state.news.items.unshift({
    id: `post-${Date.now().toString(36)}`,
    date: new Date().toISOString().slice(0, 10),
    category: 'Academy',
    categoryAr: '',
    title: '',
    titleAr: '',
    excerpt: '',
    excerptAr: '',
    image: null,
  });
  markDirty();
  renderNews();
});

/* ── Schedule ─────────────────────────────────────────────────── */

function renderSchedule() {
  const host = $('#squads');
  host.replaceChildren();

  for (const squad of state.schedule.squads ?? []) {
    host.append(
      el('div', { className: 'card' }, [
        el('div', { className: 'card-head' }, [el('span', { className: 'card-title', textContent: squad.id })]),
        el('div', { className: 'grid2' }, [
          field('Training days', squad.days, (v) => { squad.days = v; }),
          field('أيام التدريب', squad.daysAr, (v) => { squad.daysAr = v; }, { rtl: true }),
          field('Winter slot', squad.winterTime, (v) => { squad.winterTime = v; }),
          field('موعد الشتاء', squad.winterTimeAr, (v) => { squad.winterTimeAr = v; }, { rtl: true }),
          field('Summer slot', squad.summerTime, (v) => { squad.summerTime = v; }),
          field('موعد الصيف', squad.summerTimeAr, (v) => { squad.summerTimeAr = v; }, { rtl: true }),
          field('Session length', squad.duration, (v) => { squad.duration = v; }),
          field('مدة الحصة', squad.durationAr, (v) => { squad.durationAr = v; }, { rtl: true }),
          field('Sessions per week', squad.sessions, (v) => { squad.sessions = v; }),
          field('الحصص الأسبوعية', squad.sessionsAr, (v) => { squad.sessionsAr = v; }, { rtl: true }),
        ]),
      ])
    );
  }

  const terms = $('#terms');
  terms.replaceChildren();
  for (const term of state.schedule.terms ?? []) {
    terms.append(
      el('div', { className: 'card' }, [
        el('div', { className: 'grid2' }, [
          field('Term name', term.term, (v) => { term.term = v; }),
          field('اسم الفصل', term.termAr, (v) => { term.termAr = v; }, { rtl: true }),
          field('Length', term.duration, (v) => { term.duration = v; }),
          field('المدة', term.durationAr, (v) => { term.durationAr = v; }, { rtl: true }),
        ]),
      ])
    );
  }
}

/* ── Telegram ─────────────────────────────────────────────────── */

async function refreshBot() {
  const out = $('#bot-status');
  out.textContent = 'Checking…';
  try {
    const res = await fetch(API.telegram);
    const body = await res.json();
    if (!res.ok) { out.textContent = body.error ?? 'Could not check the bot.'; return; }

    const lines = [body.connected ? '✅ Connected.' : '⚠️ Not connected yet.'];
    lines.push(`Messages should be delivered to ${body.expectedUrl}`);
    if (body.info?.url && body.info.url !== body.expectedUrl && body.info.url !== '') {
      lines.push(`Telegram currently points at: ${body.info.url}`);
    }
    if (body.info?.lastErrorMessage) {
      lines.push(`Last error from Telegram: ${body.info.lastErrorMessage}`);
    }
    if (body.info?.pendingUpdateCount) {
      lines.push(`${body.info.pendingUpdateCount} message(s) waiting.`);
    }
    out.textContent = lines.join('  ');
  } catch (err) {
    out.textContent = `Could not check the bot: ${err.message}`;
  }
}

$('#bot-refresh').addEventListener('click', refreshBot);

$('#bot-connect').addEventListener('click', async () => {
  const passcode = await askPasscode('This points your Telegram bot at this website.');
  if (!passcode) return;

  $('#bot-connect').disabled = true;
  banner('Connecting the bot…');
  try {
    const res = await fetch(API.telegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const body = await res.json();
    if (!res.ok) banner(body.error ?? 'Could not connect the bot.', true);
    else banner('Bot connected. Send it a message — it should ask for the passcode.');
    await refreshBot();
  } catch (err) {
    banner(`Could not connect the bot: ${err.message}`, true);
  } finally {
    $('#bot-connect').disabled = false;
  }
});

/* ── Publish ──────────────────────────────────────────────────── */

/**
 * Ask for the passcode and resolve with it, or null if cancelled.
 *
 * This drives the buttons directly rather than relying on <form method="dialog">
 * and the dialog 'close' event. That pattern is subtly inconsistent — the
 * dialog can end up closed without ever emitting 'close', which leaves the
 * caller awaiting a promise that never settles and makes Publish, photo upload
 * and bot setup all appear to do nothing at all.
 */
function askPasscode(reason) {
  return new Promise((resolve) => {
    const dialog = $('#confirm');
    const input = $('#confirm-pass');
    const error = $('#confirm-error');
    const go = $('#confirm-go');
    const cancel = $('#confirm-cancel');

    error.hidden = true;
    input.value = '';
    dialog.querySelector('.muted').textContent =
      `${reason} Re-enter the admin passcode — nothing reaches the website without it.`;

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      go.removeEventListener('click', onGo);
      cancel.removeEventListener('click', onCancel);
      dialog.removeEventListener('cancel', onCancel);
      input.removeEventListener('keydown', onKey);
      if (dialog.open) dialog.close();
      resolve(value);
    };

    function onGo(e) { e.preventDefault(); finish(input.value); }
    function onCancel(e) { e.preventDefault(); finish(null); }
    function onKey(e) { if (e.key === 'Enter') { e.preventDefault(); finish(input.value); } }

    go.addEventListener('click', onGo);
    cancel.addEventListener('click', onCancel);
    dialog.addEventListener('cancel', onCancel); // Esc key
    input.addEventListener('keydown', onKey);

    dialog.showModal();
    input.focus();
  });
}

$('#publish').addEventListener('click', async () => {
  const problems = validate();
  if (problems.length) { banner(problems[0], true); return; }

  const passcode = await askPasscode('This publishes to the live website.');
  if (!passcode) return;

  $('#publish').disabled = true;
  banner('Publishing…');

  const res = await fetch(API.content, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode, news: state.news, schedule: state.schedule, author: 'dashboard' }),
  });
  const body = await res.json().catch(() => ({}));
  $('#publish').disabled = false;

  if (!res.ok) { banner(body.error ?? 'Publish failed', true); return; }

  state.dirty = false;
  $('#dirty').hidden = true;
  banner('Published. The website rebuilds in a minute or two.');
});

/** Catch the mistakes the server would reject, before a round trip. */
function validate() {
  const problems = [];
  for (const [i, post] of (state.news.items ?? []).entries()) {
    const label = post.title || `post ${i + 1}`;
    if (!post.title?.trim()) problems.push(`"${label}" needs a headline.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date ?? '')) problems.push(`"${label}" needs a valid date.`);
    if (!post.excerpt?.trim()) problems.push(`"${label}" needs a summary.`);
  }
  return problems;
}

/* Already signed in from a previous visit? Skip the login screen. */
fetch(API.content)
  .then((res) => { if (res.ok) start(); })
  .catch(() => undefined);
