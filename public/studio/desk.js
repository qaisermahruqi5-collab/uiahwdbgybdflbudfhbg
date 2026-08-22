// ═══════════════════════════════════════════════════════════════════
// GENOA STUDIO — the desk.
//
// Dependency-free and build-free, served from the site's own origin, so it
// satisfies the strict CSP (script-src 'self') with no bundler.
//
// Three rules carried over from what went wrong last time:
//
//   1. NO REQUEST MAY HANG. Every call goes through send(), which has a
//      hard timeout. A stalled fetch never settles and never throws, and
//      that is how a page ends up waiting forever with nothing on screen.
//
//   2. EVERY ROUTE HAS TWO SPELLINGS. Filter lists match on URL shape and
//      /api/admin/* is a common rule. Each call falls back to a neutral
//      path automatically, and remembers which one worked.
//
//   3. NOTHING FAILS QUIETLY. Every catch puts a sentence on the screen.
//
// The session cookie only lets you LOOK. Publishing re-asks for the
// passcode, and the server enforces that too — this is not just UI.
// ═══════════════════════════════════════════════════════════════════

const BUILD = 'studio 1';
const TIMEOUT_MS = 25000;

/* Neutral path first: it is the one least likely to be filtered. */
const ROUTES = {
  content: ['/studio-io/content', '/api/admin/content'],
  upload: ['/studio-io/upload', '/api/admin/upload'],
  bot: ['/studio-io/bot', '/api/admin/telegram'],
  session: ['/studio-io/session', '/api/admin/login'],
};

/* Once a spelling answers, keep using it. */
const working = {};

/* ── Session token ────────────────────────────────────────────────
   The cookie is the real credential. This token is the fallback for
   browsers that quietly refuse a Secure SameSite cookie — the sign-in
   redirect carries it in the URL fragment, which is never sent to a
   server and never appears in a referrer. Read it, keep it for this
   tab only, and strip it from the address bar immediately.          */

const TOKEN_KEY = 'studio.k';

(function captureToken() {
  const hash = location.hash ?? '';
  const found = hash.startsWith('#k=') ? hash.slice(3) : '';
  if (!found) return;
  try {
    sessionStorage.setItem(TOKEN_KEY, found);
  } catch {
    /* Private mode with storage disabled. The cookie may still carry us. */
  }
  history.replaceState(null, '', location.pathname + location.search);
})();

function token() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

/* ── Network ──────────────────────────────────────────────────────
   One way in and out. Capped, dual-path, and it always explains itself. */

async function once(url, opts, timeoutMs) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  const headers = { ...(opts.headers ?? {}) };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  try {
    return await fetch(url, { ...opts, headers, signal: abort.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call a route, trying each spelling until one answers.
 * Resolves to a Response. Rejects with a sentence fit to show a person.
 */
async function send(route, opts = {}, timeoutMs = TIMEOUT_MS) {
  const paths = working[route] ? [working[route]] : ROUTES[route];
  const failures = [];

  for (const path of paths) {
    try {
      const res = await once(path, opts, timeoutMs);
      working[route] = path; // Remember the spelling that got through.
      return res;
    } catch (err) {
      failures.push(
        err.name === 'AbortError'
          ? `${path} did not answer within ${Math.round(timeoutMs / 1000)}s`
          : `${path} failed (${err.message})`
      );
    }
  }

  // Both spellings are gone: this is a connectivity or blocking problem.
  throw new Error(
    `Could not reach the server. ${failures.join('; ')}. ` +
      'Open /studio/check.html to see which requests this browser can make.'
  );
}

/** Pull an error sentence out of a response without ever throwing. */
async function reasonFrom(res, fallback) {
  const text = await res.text().catch(() => '');
  try {
    return JSON.parse(text).error ?? fallback;
  } catch {
    return res.status === 404
      ? 'That route is not deployed. Check Netlify > Deploys succeeded.'
      : `${fallback} (server returned ${res.status})`;
  }
}

/* ── Small helpers ───────────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);

const el = (tag, props = {}, kids = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of [].concat(kids)) if (kid) node.append(kid);
  return node;
};

let data = { news: null, schedule: null };
let dirty = false;

function touched() {
  dirty = true;
  $('#unsaved').hidden = false;
}

function flash(message, kind = 'good') {
  const node = $('#flash');
  node.textContent = message;
  node.className = `flash ${kind}`;
  node.hidden = !message;
  if (message && kind === 'good') {
    setTimeout(() => {
      if (node.textContent === message) node.hidden = true;
    }, 6000);
  }
}

/** A failure that stops the whole desk: say it where it cannot be missed. */
function halt(message) {
  $('#loading').hidden = false;
  $('#loading').className = 'gate-note';
  $('#loading').textContent = message;
  for (const p of document.querySelectorAll('.panel')) p.hidden = true;
}

addEventListener('error', (e) => flash(`Editor error: ${e.message}`, 'bad'));
addEventListener('unhandledrejection', (e) =>
  flash(`Editor error: ${e.reason?.message ?? e.reason}`, 'bad')
);

addEventListener('beforeunload', (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ── Fields ───────────────────────────────────────────────────────── */

function field(label, value, onInput, { area = false, rtl = false, type = 'text' } = {}) {
  // `type` must not be assigned to a textarea: the property is getter-only
  // and assigning it, even undefined, throws.
  const input = area
    ? el('textarea', { value: value ?? '' })
    : el('input', { value: value ?? '', type });

  if (rtl) {
    input.dir = 'rtl';
    input.lang = 'ar';
  }
  input.addEventListener('input', () => {
    onInput(input.value);
    touched();
  });
  return el('div', { className: 'field' }, [el('label', { textContent: label }), input]);
}

/* ── News ─────────────────────────────────────────────────────────── */

function renderNews() {
  const host = $('#posts');
  host.replaceChildren();

  const items = data.news.items ?? [];
  $('#no-posts').hidden = items.length > 0;

  items.forEach((post, index) => {
    const card = el('div', { className: 'card' });

    const tools = el('div', { className: 'card-tools' }, [
      el('button', {
        className: 'btn btn-sm btn-quiet',
        textContent: '↑',
        title: 'Move up',
        disabled: index === 0,
        onclick: () => {
          items.splice(index - 1, 0, items.splice(index, 1)[0]);
          touched();
          renderNews();
        },
      }),
      el('button', {
        className: 'btn btn-sm btn-quiet',
        textContent: '↓',
        title: 'Move down',
        disabled: index === items.length - 1,
        onclick: () => {
          items.splice(index + 1, 0, items.splice(index, 1)[0]);
          touched();
          renderNews();
        },
      }),
      el('button', {
        className: 'btn btn-sm btn-danger',
        textContent: 'Delete',
        onclick: () => {
          if (!confirm(`Delete "${post.title || 'this post'}"?`)) return;
          items.splice(index, 1);
          touched();
          renderNews();
        },
      }),
    ]);

    card.append(
      el('div', { className: 'card-top' }, [
        el('span', { className: 'card-name', textContent: post.title || 'Untitled post' }),
        el('span', { className: 'card-when', textContent: post.date || '—' }),
        tools,
      ])
    );

    const body = el('div', { className: 'card-body' });

    body.append(
      el('div', { className: 'pair' }, [
        field('Headline', post.title, (v) => {
          post.title = v;
          card.querySelector('.card-name').textContent = v || 'Untitled post';
        }),
        field('العنوان (Arabic)', post.titleAr, (v) => (post.titleAr = v), { rtl: true }),
      ]),
      el('div', { className: 'pair' }, [
        field('Date', post.date, (v) => {
          post.date = v;
          card.querySelector('.card-when').textContent = v || '—';
        }, { type: 'date' }),
        field('Category', post.category, (v) => (post.category = v)),
      ]),
      el('div', { className: 'pair' }, [
        field('Category (Arabic)', post.categoryAr, (v) => (post.categoryAr = v), { rtl: true }),
        field('Web address id', post.id, (v) => (post.id = v)),
      ]),
      el('div', { className: 'pair' }, [
        field('Summary', post.excerpt, (v) => (post.excerpt = v), { area: true }),
        field('الملخص (Arabic)', post.excerptAr, (v) => (post.excerptAr = v), {
          area: true,
          rtl: true,
        }),
      ]),
      photoRow(post)
    );

    card.append(body);
    host.append(card);
  });
}

function photoRow(post) {
  const wrap = el('div', { className: 'shot' });

  const draw = () => {
    wrap.replaceChildren();

    if (post.image?.jpg) {
      wrap.append(el('img', { src: post.image.jpg, alt: '' }));
    }

    const drop = el('div', {
      className: 'drop',
      textContent: post.image?.jpg
        ? 'Drop a new photo here, or click to replace'
        : 'Drop a photo here, or click to choose one',
    });

    const picker = el('input', { type: 'file', accept: 'image/*', hidden: true });
    picker.addEventListener('change', () => {
      if (picker.files?.[0]) take(picker.files[0]);
    });

    drop.addEventListener('click', () => picker.click());
    drop.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('hot');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('hot'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('hot');
      const file = e.dataTransfer?.files?.[0];
      if (file) take(file);
    });

    wrap.append(drop, picker);

    if (post.image?.jpg) {
      wrap.append(
        el('button', {
          className: 'btn btn-sm btn-danger',
          textContent: 'Remove photo',
          onclick: () => {
            post.image = null;
            touched();
            draw();
          },
        })
      );
    }
  };

  async function take(file) {
    const passcode = await askPasscode('Uploading a photo needs the admin passcode.');
    if (!passcode) return;

    flash('Resizing photo…');
    let shrunk;
    try {
      shrunk = await shrink(file);
    } catch (err) {
      flash(`Could not read that image: ${err.message}`, 'bad');
      return;
    }

    flash('Uploading…');
    let res;
    try {
      res = await send('upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, filename: file.name, ...shrunk }),
      });
    } catch (err) {
      flash(err.message, 'bad');
      return;
    }

    if (!res.ok) {
      flash(await reasonFrom(res, 'Upload failed'), 'bad');
      return;
    }

    const body = await res.json();
    post.image = { ...body.image, alt: post.image?.alt ?? '' };
    touched();
    draw();
    flash('Photo uploaded. Press Publish to put it on the site.');
  }

  draw();
  return wrap;
}

/**
 * Resize in the browser so a 12MP phone photo never travels at full size,
 * and produce both formats the site expects.
 */
function shrink(file, maxWidth = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('the file could not be read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('that file is not an image the browser can open'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = el('canvas', { width, height });
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        const strip = (url) => url.slice(url.indexOf(',') + 1);
        resolve({
          webpBase64: strip(canvas.toDataURL('image/webp', 0.82)),
          jpgBase64: strip(canvas.toDataURL('image/jpeg', 0.85)),
          width,
          height,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

$('#add').addEventListener('click', () => {
  const today = new Date().toISOString().slice(0, 10);
  (data.news.items ??= []).unshift({
    id: `post-${Date.now().toString(36)}`,
    date: today,
    category: '',
    categoryAr: '',
    title: '',
    titleAr: '',
    excerpt: '',
    excerptAr: '',
    image: null,
  });
  touched();
  renderNews();
});

/* ── Calendar ─────────────────────────────────────────────────────── */

function renderCalendar() {
  const squadHost = $('#squads');
  squadHost.replaceChildren();

  for (const squad of data.schedule.squads ?? []) {
    const card = el('div', { className: 'card' }, [
      el('div', { className: 'card-top' }, [
        el('span', { className: 'card-name', textContent: squad.id }),
      ]),
      el('div', { className: 'card-body' }, [
        el('div', { className: 'pair' }, [
          field('Days', squad.days, (v) => (squad.days = v)),
          field('الأيام (Arabic)', squad.daysAr, (v) => (squad.daysAr = v), { rtl: true }),
        ]),
        el('div', { className: 'pair' }, [
          field('Winter time', squad.winterTime, (v) => (squad.winterTime = v)),
          field('التوقيت الشتوي', squad.winterTimeAr, (v) => (squad.winterTimeAr = v), { rtl: true }),
        ]),
        el('div', { className: 'pair' }, [
          field('Summer time', squad.summerTime, (v) => (squad.summerTime = v)),
          field('التوقيت الصيفي', squad.summerTimeAr, (v) => (squad.summerTimeAr = v), { rtl: true }),
        ]),
        el('div', { className: 'pair' }, [
          field('Session length', squad.duration, (v) => (squad.duration = v)),
          field('المدة (Arabic)', squad.durationAr, (v) => (squad.durationAr = v), { rtl: true }),
        ]),
        el('div', { className: 'pair' }, [
          field('Sessions', squad.sessions, (v) => (squad.sessions = v)),
          field('الحصص (Arabic)', squad.sessionsAr, (v) => (squad.sessionsAr = v), { rtl: true }),
        ]),
      ]),
    ]);
    squadHost.append(card);
  }

  const termHost = $('#terms');
  termHost.replaceChildren();

  for (const term of data.schedule.terms ?? []) {
    termHost.append(
      el('div', { className: 'card' }, [
        el('div', { className: 'card-top' }, [
          el('span', { className: 'card-name', textContent: term.term || term.id }),
        ]),
        el('div', { className: 'card-body' }, [
          el('div', { className: 'pair' }, [
            field('Term', term.term, (v) => (term.term = v)),
            field('الفصل (Arabic)', term.termAr, (v) => (term.termAr = v), { rtl: true }),
          ]),
          el('div', { className: 'pair' }, [
            field('Duration', term.duration, (v) => (term.duration = v)),
            field('المدة (Arabic)', term.durationAr, (v) => (term.durationAr = v), { rtl: true }),
          ]),
        ]),
      ])
    );
  }
}

/* ── Bot ──────────────────────────────────────────────────────────── */

async function refreshBot() {
  const dot = $('#bot-dot');
  const say = $('#bot-say');
  dot.className = 'dot';
  say.textContent = 'Checking…';

  let res;
  try {
    res = await send('bot', {}, 15000);
  } catch (err) {
    dot.className = 'dot off';
    say.textContent = err.message;
    return;
  }

  if (!res.ok) {
    dot.className = 'dot off';
    say.textContent = await reasonFrom(res, 'Could not read the bot status');
    return;
  }

  const info = await res.json();
  dot.className = `dot ${info.connected ? 'on' : 'off'}`;
  const queued = info.info?.pendingUpdateCount;
  const lastError = info.info?.lastErrorMessage;
  say.textContent = info.connected
    ? `Connected${queued ? `, ${queued} message(s) queued` : ''}.${lastError ? ` Last error: ${lastError}` : ''}`
    : 'Not connected. Press Connect bot.';
}

$('#bot-again').addEventListener('click', refreshBot);

$('#bot-link').addEventListener('click', async () => {
  const passcode = await askPasscode('Connecting the bot needs the admin passcode.');
  if (!passcode) return;

  flash('Connecting…');
  let res;
  try {
    res = await send('bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
  } catch (err) {
    flash(err.message, 'bad');
    return;
  }

  if (!res.ok) {
    flash(await reasonFrom(res, 'Could not connect the bot'), 'bad');
    return;
  }
  flash('Bot connected.');
  refreshBot();
});

/* ── Passcode sheet ───────────────────────────────────────────────── */

/**
 * Resolves to the typed passcode, or the empty string if cancelled.
 *
 * Every exit resolves the promise from its own handler. Nothing here waits
 * on the element to announce that it closed, because that announcement is
 * exactly what cannot be relied on — a <dialog> here closes without ever
 * firing `close`, and an await on that event never returns.
 */
function askPasscode(why) {
  return new Promise((resolve) => {
    const box = $("#ask");
    const pass = $("#ask-pass");
    const yes = $("#ask-yes");
    const no = $("#ask-no");

    $("#ask-why").textContent = why;
    pass.value = "";
    box.hidden = false;
    pass.focus();

    let settled = false;

    const finish = (value) => {
      if (settled) return; // Belt and braces: resolve exactly once.
      settled = true;
      box.hidden = true;
      pass.value = "";
      yes.removeEventListener("click", onYes);
      no.removeEventListener("click", onNo);
      box.removeEventListener("mousedown", onBackdrop);
      document.removeEventListener("keydown", onKey, true);
      resolve(value);
    };

    const onYes = () => finish(pass.value);
    const onNo = () => finish("");
    const onBackdrop = (e) => { if (e.target === box) finish(""); };
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); finish(""); }
      if (e.key === "Enter" && document.activeElement === pass) { e.preventDefault(); finish(pass.value); }
    };

    yes.addEventListener("click", onYes);
    no.addEventListener("click", onNo);
    box.addEventListener("mousedown", onBackdrop);
    document.addEventListener("keydown", onKey, true);
  });
}

/* ── Publish ──────────────────────────────────────────────────────── */

function problems() {
  const found = [];
  for (const [i, post] of (data.news.items ?? []).entries()) {
    const name = post.title || `post ${i + 1}`;
    if (!post.title?.trim()) found.push(`"${name}" needs a headline.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date ?? '')) found.push(`"${name}" needs a valid date.`);
    if (!post.excerpt?.trim()) found.push(`"${name}" needs a summary.`);
  }
  return found;
}

$('#publish').addEventListener('click', async () => {
  const bad = problems();
  if (bad.length) {
    flash(bad[0], 'bad');
    return;
  }

  const passcode = await askPasscode('Re-enter the admin passcode. Nothing reaches the website without it.');
  if (!passcode) return;

  const button = $('#publish');
  button.disabled = true;
  button.textContent = 'Publishing…';
  flash('Publishing…');

  try {
    const res = await send('content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode,
        author: 'studio',
        news: data.news,
        schedule: data.schedule,
      }),
    });

    if (!res.ok) {
      flash(await reasonFrom(res, 'Publish failed'), 'bad');
      return;
    }

    dirty = false;
    $('#unsaved').hidden = true;
    flash('Published. The website rebuilds in a minute or two.');
  } catch (err) {
    flash(err.message, 'bad');
  } finally {
    button.disabled = false;
    button.textContent = 'Publish';
  }
});

/* ── Sign out ─────────────────────────────────────────────────────── */

$('#leave').addEventListener('click', async () => {
  if (dirty && !confirm('You have unpublished changes. Sign out anyway?')) return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
  await send('session', { method: 'DELETE' }, 8000).catch(() => undefined);
  location.href = '/studio/';
});

/* ── Tabs ─────────────────────────────────────────────────────────── */

for (const tab of document.querySelectorAll('.desk-tab')) {
  tab.addEventListener('click', () => {
    for (const other of document.querySelectorAll('.desk-tab')) {
      other.setAttribute('aria-selected', String(other === tab));
    }
    for (const name of ['news', 'calendar', 'bot']) {
      $(`#panel-${name}`).hidden = name !== tab.dataset.panel;
    }
    if (tab.dataset.panel === 'bot') refreshBot();
  });
}

/* ── Boot ─────────────────────────────────────────────────────────── */

async function boot() {
  let res;
  try {
    res = await send('content');
  } catch (err) {
    halt(err.message);
    return;
  }

  if (res.status === 401) {
    halt(
      'Your session was not accepted. This usually means the sign-in cookie did not ' +
        'stick — sign in again, and if it keeps happening open /studio/check.html.'
    );
    setTimeout(() => (location.href = '/studio/'), 4000);
    return;
  }

  if (!res.ok) {
    halt(await reasonFrom(res, 'Your content could not be loaded'));
    return;
  }

  const body = await res.json();
  data = {
    news: body.news ?? { items: [] },
    schedule: body.schedule ?? { squads: [], terms: [] },
  };

  try {
    renderNews();
    renderCalendar();
  } catch (err) {
    halt(`Loaded your content but could not draw it: ${err.message}`);
    return;
  }

  $('#loading').hidden = true;
  $('#panel-news').hidden = false;
  flash(`Signed in — ${BUILD}`);
}

boot();
