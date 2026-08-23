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
  health: ['/studio-io/health', '/api/admin/health'],
  pulse: ['/studio-io/pulse', '/api/admin/pulse'],
  status: ['/studio-io/status', '/api/admin/status'],
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
  // A pill cannot hold a paragraph. Anything long enough to wrap gets a block
  // instead — the GitHub permission explanation is several lines of steps.
  node.className = `flash ${kind}${String(message).length > 90 ? ' block' : ''}`;
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

/* ── News ───────────────────────────────────────────────────────────
   Eight fields per post, all shown at once, made a simple job look like
   paperwork. Writing a post really needs four things: a headline, a date,
   a summary and maybe a photo. Everything else is either optional or
   derivable, so it is folded away until asked for.

   Posts are a list of closed rows, and only the one being worked on is
   open. Adding a post opens it and puts the cursor in the headline.   */

/* Ids the editor generated, so they can keep following the headline.
   Once a person edits one by hand it is theirs and we stop touching it. */
const autoIds = new WeakSet();

/* The expanded post, held BY REFERENCE not by id: typing a headline rewrites
   the id, and an id-keyed accordion would snap shut mid-sentence. */
let openPost = null;

const slug = (text) =>
  String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Readable date for a closed row: "21 Aug 2026". */
function niceDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? '')) return 'No date';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'No date';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * A fold-away group.
 *
 * ALWAYS starts closed, even when it already has content. Opening it
 * automatically for every post that happens to have an Arabic headline would
 * put all nine fields back on screen for exactly the posts this site already
 * has — which is the clutter this was meant to remove. Instead the label says
 * whether there is anything inside, so nothing is hidden without a trace.
 */
function foldaway(label, filled, build) {
  const wrap = el("div", { className: "fold" });
  const body = el("div", { className: "fold-body", hidden: true });
  let open = false;
  let built = false;

  const caret = el("span", { className: "fold-caret", textContent: "▸" });
  const mark = el("span", {
    className: filled ? "fold-mark filled" : "fold-mark",
    textContent: filled ? "filled in" : "empty",
  });

  const toggle = el("button", {
    type: "button",
    className: "fold-top",
    onclick: () => {
      open = !open;
      if (open && !built) {
        build(body);
        built = true;
      }
      body.hidden = !open;
      caret.textContent = open ? "▾" : "▸";
      toggle.setAttribute("aria-expanded", String(open));
    },
  });

  toggle.setAttribute("aria-expanded", "false");
  toggle.append(caret, el("span", { textContent: label }), mark);

  wrap.append(toggle, body);
  return wrap;
}

function renderNews() {
  const host = $('#posts');
  host.replaceChildren();

  const items = data.news.items ?? [];
  $('#no-posts').hidden = items.length > 0;

  items.forEach((post, index) => {
    const isOpen = openPost === post;
    const card = el('div', { className: `card post${isOpen ? ' open' : ''}` });

    /* ── The closed row: what it is, when, and whether it has a photo ── */

    const summary = el('button', {
      type: 'button',
      className: 'post-top',
      onclick: () => {
        openPost = isOpen ? null : post;
        renderNews();
      },
    });

    summary.append(
      el('span', { className: 'post-caret', textContent: isOpen ? '▾' : '▸' }),
      post.image?.jpg
        ? el('img', { className: 'post-thumb', src: post.image.jpg, alt: '' })
        : el('span', { className: 'post-thumb empty', textContent: '—' }),
      el('span', { className: 'post-headline', textContent: post.title || 'Untitled post' }),
      el('span', { className: 'post-date', textContent: niceDate(post.date) })
    );

    const tools = el('div', { className: 'post-tools' }, [
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
          if (openPost === post) openPost = null;
          touched();
          renderNews();
        },
      }),
    ]);

    card.append(el('div', { className: 'post-row' }, [summary, tools]));

    if (!isOpen) {
      host.append(card);
      return;
    }

    /* ── Open: the four things that actually matter ── */

    const body = el('div', { className: 'card-body' });

    const headline = field('Headline', post.title, (v) => {
      post.title = v;
      // A new post's web address follows the headline until someone edits it.
      if (autoIds.has(post)) post.id = slug(v) || post.id;
      summary.querySelector('.post-headline').textContent = v || 'Untitled post';
    });

    const date = field('Date', post.date, (v) => {
      post.date = v;
      summary.querySelector('.post-date').textContent = niceDate(v);
    }, { type: 'date' });

    body.append(
      headline,
      date,
      field('Summary', post.excerpt, (v) => (post.excerpt = v), { area: true }),
      photoRow(post, summary)
    );

    /* ── Folded away: Arabic, then the technical bits ── */

    const hasArabic = Boolean(
      String(post.titleAr ?? '').trim() || String(post.excerptAr ?? '').trim()
    );

    body.append(
      foldaway('Arabic version (optional)', hasArabic, (into) => {
        into.append(
          el('p', {
            className: 'fold-note',
            textContent:
              'Leave these blank and Arabic visitors see the English text. Nothing breaks.',
          }),
          field('العنوان — headline', post.titleAr, (v) => (post.titleAr = v), { rtl: true }),
          field('الملخص — summary', post.excerptAr, (v) => (post.excerptAr = v), {
            area: true,
            rtl: true,
          }),
          field('التصنيف — category', post.categoryAr, (v) => (post.categoryAr = v), { rtl: true })
        );
      }),
      foldaway('Category and web address', Boolean(String(post.category ?? '').trim()), (into) => {
        into.append(
          field('Category', post.category, (v) => (post.category = v)),
          field('Web address id', post.id, (v) => {
            autoIds.delete(post); // Hand-edited from now on.
            post.id = v;
          })
        );
        into.append(
          el('p', {
            className: 'fold-note',
            textContent:
              'The web address is filled in from the headline automatically. Only change it if you need a specific link.',
          })
        );
      })
    );

    card.append(body);
    host.append(card);

    // Opening a post should put the cursor where the writing starts.
    if (post.title === '') headline.querySelector('input')?.focus();
  });
}

function photoRow(post, summaryRow) {
  const wrap = el('div', { className: 'field' });
  wrap.append(el('label', { textContent: 'Photo (optional)' }));

  const shot = el('div', { className: 'shot' });
  wrap.append(shot);

  const draw = () => {
    shot.replaceChildren();

    if (post.image?.jpg) {
      shot.append(el('img', { src: post.image.jpg, alt: '' }));
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

    shot.append(drop, picker);

    if (post.image?.jpg) {
      shot.append(
        el('button', {
          className: 'btn btn-sm btn-danger',
          textContent: 'Remove',
          onclick: () => {
            post.image = null;
            touched();
            draw();
            refreshThumb();
          },
        })
      );
    }
  };

  /** Keep the closed row's thumbnail in step with the photo. */
  function refreshThumb() {
    if (!summaryRow) return;
    const old = summaryRow.querySelector('.post-thumb');
    if (!old) return;
    const next = post.image?.jpg
      ? el('img', { className: 'post-thumb', src: post.image.jpg, alt: '' })
      : el('span', { className: 'post-thumb empty', textContent: '—' });
    old.replaceWith(next);
  }

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
    refreshThumb();
    flash('Photo added. Press Publish to put it on the site.');
  }

  draw();
  return wrap;
}

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
  const post = {
    id: `post-${Date.now().toString(36)}`,
    date: today,
    category: '',
    categoryAr: '',
    title: '',
    titleAr: '',
    excerpt: '',
    excerptAr: '',
    image: null,
  };

  // Newly created, so its web address may follow the headline.
  autoIds.add(post);

  (data.news.items ??= []).unshift(post);
  openPost = post; // Open it straight away: nobody adds a post to leave it closed.
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

/* ── Status ───────────────────────────────────────────────────────
   Two different questions, deliberately kept apart:

     "Right now"   — who is here. Cheap, refreshed on a timer.
     "Site health" — what will stop working. Costs GitHub calls, so it
                     is fetched once per visit to the tab, not on a loop.

   Both fail quietly. A broken counter must never make the editor look
   broken, because the editor is the part that matters.               */

const STATS_EVERY_MS = 30_000;
let statsTimer = null;

const setDot = (id, state) => {
  const dot = $(id);
  if (dot) dot.className = `dot ${state}`;
};

async function refreshStats() {
  let res;
  try {
    res = await send('pulse', {}, 12000);
  } catch {
    return; // Offline or blocked: leave the last known figures on screen.
  }
  if (!res.ok) return;

  const info = await res.json().catch(() => null);
  if (!info) return;

  $('#n-site').textContent = info.now?.site ?? 0;
  $('#n-studio').textContent = info.now?.studio ?? 0;
  $('#n-today').textContent = info.forms?.today ?? 0;
  $('#n-week').textContent = `${info.forms?.week ?? 0} in the last 7 days`;

  drawSpark(info.forms?.byDay ?? []);
}

/** A seven-bar chart, drawn with divs. No library, no canvas, no CSP trouble. */
function drawSpark(byDay) {
  const host = $('#spark-bars');
  const card = $('#spark');
  if (!host || !card) return;

  if (!byDay.length || byDay.every((d) => !d.count)) {
    card.hidden = true;
    return;
  }
  card.hidden = false;

  const peak = Math.max(...byDay.map((d) => d.count), 1);
  host.replaceChildren();

  for (const day of byDay) {
    const height = Math.max(3, Math.round((day.count / peak) * 100));
    const label = new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-GB', {
      weekday: 'short',
      timeZone: 'UTC',
    });

    host.append(
      el('div', { className: 'spark-col', title: `${day.date}: ${day.count}` }, [
        el('span', { className: 'spark-count', textContent: day.count || '' }),
        el('span', { className: 'spark-bar', style: `height:${height}%` }),
        el('span', { className: 'spark-day', textContent: label }),
      ])
    );
  }
}

async function refreshHealth() {
  $('#pub-say').textContent = 'Checking…';

  let res;
  try {
    res = await send('status', {}, 20000);
  } catch (err) {
    setDot('#pub-dot', 'off');
    $('#pub-say').textContent = err.message;
    return;
  }

  if (!res.ok) {
    setDot('#pub-dot', 'off');
    $('#pub-say').textContent = await reasonFrom(res, 'Could not read the site status');
    return;
  }

  const s = await res.json();

  /* Can we publish at all? */
  setDot('#pub-dot', s.canPublish ? 'on' : 'off');
  $('#pub-say').textContent = s.canPublish
    ? `Publishing works — ${s.repo}`
    : s.access?.reason ?? `Publishing is refused for ${s.repo}.`;

  /* When does the token lapse? This is the one that ambushes people. */
  const token = s.token;
  if (!token) {
    setDot('#tok-dot', '');
    $('#tok-say').textContent = 'Token expiry unknown (classic tokens do not report one).';
  } else if (token.expired) {
    setDot('#tok-dot', 'off');
    $('#tok-say').textContent = `GitHub token EXPIRED on ${token.raw}. Publishing will fail until it is replaced.`;
  } else if (token.soon) {
    setDot('#tok-dot', 'off');
    $('#tok-say').textContent =
      `GitHub token expires in ${token.daysLeft} day(s), on ${token.raw}. ` +
      'Renew it before then, or publishing stops.';
  } else {
    setDot('#tok-dot', 'on');
    $('#tok-say').textContent = `GitHub token valid for ${token.daysLeft} more day(s).`;
  }

  /* When did anything last reach the website? */
  if (s.lastPublish?.when) {
    const when = new Date(s.lastPublish.when);
    const hours = Math.round((Date.now() - when.getTime()) / 3600000);
    const ago =
      hours < 1 ? 'less than an hour ago' : hours < 48 ? `${hours} hours ago` : `${Math.round(hours / 24)} days ago`;
    setDot('#last-dot', 'on');
    $('#last-say').textContent = `Last published ${ago} — ${s.lastPublish.message}`;
  } else {
    setDot('#last-dot', '');
    $('#last-say').textContent = 'No publish history found yet.';
  }

  /* What is actually on the site. */
  const c = s.content ?? {};
  const lines = $('#content-lines');
  lines.replaceChildren();
  for (const [label, value] of [
    ['News posts', c.posts],
    ['With a photo', c.withPhotos],
    ['Missing an Arabic headline', c.missingArabic],
    ['Squads', c.squads],
    ['Season terms', c.terms],
    ['Newest post', c.newestPost ?? '—'],
  ]) {
    if (value === null || value === undefined) continue;
    lines.append(
      el('div', { className: 'state-row' }, [
        el('span', { className: 'state-key', textContent: label }),
        el('span', { className: 'state-val', textContent: String(value) }),
      ])
    );
  }
}

$('#stats-again').addEventListener('click', refreshStats);
$('#health-again').addEventListener('click', refreshHealth);

/** Called when the Status tab is opened. */
function startStatus() {
  refreshStats();
  refreshHealth();
  if (statsTimer) clearInterval(statsTimer);
  statsTimer = setInterval(refreshStats, STATS_EVERY_MS);
}

function stopStatus() {
  if (statsTimer) clearInterval(statsTimer);
  statsTimer = null;
}

/* ── Being counted ourselves ──────────────────────────────────────
   The desk reports its own presence, so "in Studio" includes whoever
   is reading it. Same anonymous shape as the public site: a random id
   for this tab, nothing else.                                       */

function studioTabId() {
  try {
    const existing = sessionStorage.getItem('studio.tab');
    if (existing) return existing;
    const fresh = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('studio.tab', fresh);
    return fresh;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function reportPresence() {
  if (document.visibilityState !== 'visible') return;
  send('pulse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ where: 'studio', id: studioTabId() }),
  }, 8000).catch(() => undefined);
}

reportPresence();
setInterval(reportPresence, 45_000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') reportPresence();
});

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
    if (tab.dataset.panel === 'bot') {
      refreshBot();
      startStatus();
    } else {
      stopStatus(); // Do not keep polling a tab nobody is looking at.
    }
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

  checkCanPublish();
}

/*
 * Reading this repository needs no permission, because it is public. Writing
 * does. So a token without write access loads the editor perfectly and only
 * fails at Publish — after the work is typed. Ask up front instead.
 */
async function checkCanPublish() {
  let res;
  try {
    res = await send('health', {}, 15000);
  } catch {
    return; // Not worth reporting: the editor itself is working.
  }
  if (!res.ok) return;

  const health = await res.json().catch(() => null);
  const access = health?.access;
  if (!access || access.canWrite !== false) return;

  flash(
    'Heads up before you start: this site can READ your content but cannot ' +
      'PUBLISH it. The GitHub token has no write access to ' +
      `${health.repo}, so Publish will be refused. ` +
      (access.reason ?? '') +
      ' Fix that on GitHub first — Settings > Developer settings > Personal ' +
      'access tokens > Fine-grained tokens > Contents: Read and write.',
    'bad'
  );
}

boot();
