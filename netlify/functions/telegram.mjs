// ═══════════════════════════════════════════════════════════════════
// TELEGRAM BOT — publish academy news and change training times from a
// phone.
//
// SECURITY MODEL: the bot is publicly reachable (bot usernames are
// searchable), so there is NO pre-shared allowlist. Anyone may open a
// chat, but nothing happens until they send the admin passcode. A
// correct passcode unlocks that chat for 12h; wrong ones are rate
// limited into a lockout, and the passcode message is deleted at once.
//
// ── DESIGN NOTES, FROM WHAT WENT WRONG BEFORE ──────────────────────
//
// 1. YOU TAP, YOU DO NOT MEMORISE. The old bot was a set of typed
//    commands with no menu, so using it meant remembering /news,
//    /schedule, /skip, /publish and an opaque post id for /delete.
//    Everything is now buttons; typing still works but is never
//    required.
//
// 2. A COMMAND MUST NOT EAT YOUR WORK. The old handler wiped the
//    in-progress draft on ANY command — so /list, /help, or a typo
//    like /nesw silently destroyed a half-written post. Commands now
//    refuse to run mid-draft and say so.
//
// 3. /skip WAS BEING STORED AS TEXT. It was excluded from command
//    routing, so at the headline step it became the headline. Skipping
//    is a button now, and the words are rejected where they make no
//    sense.
//
// 4. BEING LOCKED OUT FOR TYPING /help. Any text sent before unlocking
//    counted as a wrong passcode attempt, so pressing the menu button
//    five times locked you out for an hour. Commands are no longer
//    treated as passcode guesses.
//
// 5. DRAFTS ARE NOT IMMORTAL. A draft left overnight used to swallow
//    the next thing you typed. They now expire.
//
// Buttons require `callback_query` in the webhook's allowed_updates —
// see admin-telegram.mjs. Without it Telegram delivers taps nowhere.
// ═══════════════════════════════════════════════════════════════════

import { passcodeMatches, requireEnv, missingAuthConfig } from './lib/auth.mjs';
import {
  readJson, writeJson, writeFile, explainWriteFailure,
  NEWS_PATH, SCHEDULE_PATH, UPLOAD_DIR,
} from './lib/github.mjs';
import {
  isUnlocked, unlock, lock, listUnlocked,
  checkLockout, recordFailure, clearFailures,
  getDraft, setDraft,
} from './lib/store.mjs';
import { randomBytes } from 'node:crypto';

const SQUADS = ['u6', 'u8', 'u10', 'u12', 'u14', 'u16'];

/** A draft older than this is stale; it must not swallow the next message. */
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

/* ── Telegram API ─────────────────────────────────────────────── */

async function tg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${requireEnv('TELEGRAM_BOT_TOKEN')}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({}));
}

const send = (chatId, text, extra = {}) =>
  tg('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  });

const deleteMessage = (chatId, messageId) =>
  tg('deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);

/** Replace a message in place, so tapping a button does not spam the chat. */
const editMessage = (chatId, messageId, text, extra = {}) =>
  tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  }).catch(() => undefined);

/** Telegram shows a spinner on the button until this is answered. */
const answerTap = (id, text) =>
  tg('answerCallbackQuery', { callback_query_id: id, ...(text ? { text } : {}) }).catch(() => undefined);

/** Escape text before it goes back out under parse_mode HTML. */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline keyboard from rows of [label, data] pairs. */
const keys = (rows) => ({
  reply_markup: {
    inline_keyboard: rows.map((row) => row.map(([text, data]) => ({ text, callback_data: data }))),
  },
});

/* ── Arabic helpers ───────────────────────────────────────────────
   Times and durations are formulaic, so they are mirrored automatically.
   Free prose is never machine-translated: the bot asks, and blank Arabic
   falls back to English on the website. */

const arTime = (s) => String(s ?? '').replace(/\bPM\b/gi, 'مساءً').replace(/\bAM\b/gi, 'صباحًا');
const arDuration = (s) => String(s ?? '').replace(/\bminutes?\b/gi, 'دقيقة');

/* ── Content operations ───────────────────────────────────────── */

const slugify = (title) =>
  String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'post';

async function publishDraft(draft, who) {
  const { sha, data } = await readJson(NEWS_PATH);
  const items = Array.isArray(data?.items) ? data.items : [];

  const id = `${slugify(draft.title)}-${randomBytes(3).toString('hex')}`;
  items.unshift({
    id,
    date: new Date().toISOString().slice(0, 10),
    category: draft.category || 'Academy',
    categoryAr: draft.categoryAr || '',
    title: draft.title,
    titleAr: draft.titleAr || '',
    excerpt: draft.excerpt,
    excerptAr: draft.excerptAr || '',
    image: draft.image ?? null,
  });

  await writeJson({
    path: NEWS_PATH,
    data: { ...data, items },
    sha,
    message: `Add news post "${draft.title}" via Telegram (${who})`,
  });
  return id;
}

/** Pull the largest available photo off a Telegram message into the repo. */
async function saveTelegramPhoto(photoSizes) {
  const largest = [...photoSizes].sort((a, b) => a.width * a.height - b.width * b.height).pop();
  if (!largest) return null;

  const info = await tg('getFile', { file_id: largest.file_id });
  const filePath = info?.result?.file_path;
  if (!filePath) return null;

  const url = `https://api.telegram.org/file/bot${requireEnv('TELEGRAM_BOT_TOKEN')}/${filePath}`;
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  if (bytes.length > 4 * 1024 * 1024) return null;

  const stem = `tg-${randomBytes(5).toString('hex')}`;
  await writeFile({
    path: `${UPLOAD_DIR}/${stem}.jpg`,
    contentBase64: bytes.toString('base64'),
    message: `Add news photo ${stem}.jpg via Telegram`,
  });

  // No WebP twin: converting needs a native image library. The site treats
  // WebP as optional and serves this JPEG.
  return { jpg: `/uploads/${stem}.jpg`, width: largest.width, height: largest.height, alt: '' };
}

/* ── Screens ──────────────────────────────────────────────────── */

const MENU_TEXT = [
  '<b>Genoa Academy</b>',
  '',
  'What would you like to do?',
].join('\n');

const MENU_KEYS = keys([
  [['📝 Write a news post', 'go:news']],
  [['🗓 Change training times', 'go:sched']],
  [['📰 Recent posts', 'go:list']],
  [['❓ How this works', 'go:help'], ['🔒 Sign out', 'go:lock']],
]);

const menu = (chatId) => send(chatId, MENU_TEXT, MENU_KEYS);

const HELP_TEXT = [
  '<b>How this works</b>',
  '',
  'Everything is a button — you never have to remember a command.',
  '',
  '<b>Writing a post</b> takes four short answers: headline, summary,',
  'a photo (optional), and Arabic (optional). You see the finished post',
  'before anything goes live, and nothing is published until you tap',
  '<b>Publish</b>.',
  '',
  '<b>Training times</b> lets you pick a squad and change its winter slot,',
  'summer slot and session length. Arabic times are filled in for you.',
  '',
  'Leave Arabic blank and Arabic visitors simply see the English — nothing',
  'breaks.',
  '',
  'Changes appear on the website about a minute after publishing.',
  '',
  'Tap <b>Cancel</b> at any point to throw a draft away. Your work is never',
  'lost by opening the menu.',
].join('\n');

/* ── Draft helpers ────────────────────────────────────────────── */

const stamp = (draft) => ({ ...draft, at: Date.now() });

/** A draft, unless it has gone stale. */
async function liveDraft(chatId) {
  const draft = await getDraft(chatId);
  if (!draft) return null;
  if (draft.at && Date.now() - draft.at > DRAFT_TTL_MS) {
    await setDraft(chatId, undefined);
    return null;
  }
  return draft;
}

const CANCEL = [['✖️ Cancel', 'go:cancel']];
const SKIP_CANCEL = (skipData) => [[['⏭ Skip', skipData]], CANCEL];

/* ── News flow ────────────────────────────────────────────────── */

const NEWS_STEPS = 4;

function newsPreview(draft) {
  return [
    '<b>Ready to publish</b>',
    '',
    `<b>${esc(draft.title)}</b>`,
    esc(draft.excerpt),
    '',
    draft.image ? '📷 Photo attached' : '📷 No photo',
    draft.titleAr ? '🇴🇲 Arabic included' : '🇬🇧 English only (Arabic visitors see the English)',
    '',
    'Nothing is live yet.',
  ].join('\n');
}

const PREVIEW_KEYS = keys([
  [['🚀 Publish', 'pub:news']],
  [['✖️ Cancel', 'go:cancel']],
]);

async function startNews(chatId) {
  await setDraft(chatId, stamp({ kind: 'news', step: 'title' }));
  return send(
    chatId,
    [
      `📝 <b>New post</b>  ·  step 1 of ${NEWS_STEPS}`,
      '',
      'Send me the <b>headline</b>, in English.',
      '',
      '<i>For example: U14 squad win the opening fixture</i>',
    ].join('\n'),
    keys([CANCEL])
  );
}

async function handleNewsStep(chatId, message, draft) {
  const text = (message.text ?? message.caption ?? '').trim();

  switch (draft.step) {
    case 'title': {
      if (!text) return send(chatId, 'That needs to be text. Send the headline.', keys([CANCEL]));
      if (text.startsWith('/')) {
        return send(chatId, 'That looks like a command. Send the headline as ordinary text.', keys([CANCEL]));
      }
      await setDraft(chatId, stamp({ ...draft, title: text, step: 'excerpt' }));
      return send(
        chatId,
        [
          `📝 <b>${esc(text)}</b>  ·  step 2 of ${NEWS_STEPS}`,
          '',
          'Now the <b>summary</b> — a sentence or two that appears under the headline.',
        ].join('\n'),
        keys([CANCEL])
      );
    }

    case 'excerpt': {
      if (!text) return send(chatId, 'That needs to be text. Send the summary.', keys([CANCEL]));
      if (text.startsWith('/')) {
        return send(chatId, 'That looks like a command. Send the summary as ordinary text.', keys([CANCEL]));
      }
      await setDraft(chatId, stamp({ ...draft, excerpt: text, step: 'photo' }));
      return send(
        chatId,
        [
          `📷 <b>Photo</b>  ·  step 3 of ${NEWS_STEPS}`,
          '',
          'Send a photo for this post, or skip it.',
        ].join('\n'),
        keys(SKIP_CANCEL('skip:photo'))
      );
    }

    case 'photo': {
      if (message.photo?.length) {
        await send(chatId, 'Saving the photo…');
        const image = await saveTelegramPhoto(message.photo);
        if (!image) {
          return send(
            chatId,
            'That photo would not save — it may be too large. Try another, or skip.',
            keys(SKIP_CANCEL('skip:photo'))
          );
        }
        image.alt = draft.title;
        await setDraft(chatId, stamp({ ...draft, image, step: 'titleAr' }));
        return askArabic(chatId, '✅ Photo saved.');
      }
      return send(
        chatId,
        'That was not a photo. Send one as a photo, or skip.',
        keys(SKIP_CANCEL('skip:photo'))
      );
    }

    case 'titleAr': {
      if (!text) return send(chatId, 'Send the Arabic headline, or skip.', keys(SKIP_CANCEL('skip:arabic')));
      await setDraft(chatId, stamp({ ...draft, titleAr: text, step: 'excerptAr' }));
      return send(
        chatId,
        'Now the <b>Arabic summary</b>, or skip it and only the headline is translated.',
        keys(SKIP_CANCEL('skip:excerptAr'))
      );
    }

    case 'excerptAr': {
      const next = stamp({ ...draft, excerptAr: text, step: 'confirm' });
      await setDraft(chatId, next);
      return send(chatId, newsPreview(next), PREVIEW_KEYS);
    }

    case 'confirm':
      return send(
        chatId,
        'Tap <b>Publish</b> to put this live, or <b>Cancel</b> to throw it away.',
        PREVIEW_KEYS
      );

    default:
      await setDraft(chatId, undefined);
      return send(chatId, 'I lost track of that draft. Start again from the menu.', MENU_KEYS);
  }
}

const askArabic = (chatId, prefix) =>
  send(
    chatId,
    [
      prefix,
      '',
      `🇴🇲 <b>Arabic</b>  ·  step ${NEWS_STEPS} of ${NEWS_STEPS}`,
      '',
      'Send the <b>Arabic headline</b>, or skip — Arabic visitors will simply',
      'see the English, and nothing breaks.',
    ].join('\n'),
    keys([[['⏭ Skip Arabic', 'skip:arabic']], CANCEL])
  );

/* ── Schedule flow ────────────────────────────────────────────── */

const squadKeys = () =>
  keys([
    SQUADS.slice(0, 3).map((s) => [s.toUpperCase(), `sq:${s}`]),
    SQUADS.slice(3).map((s) => [s.toUpperCase(), `sq:${s}`]),
    ...[CANCEL],
  ]);

async function startSchedule(chatId) {
  await setDraft(chatId, stamp({ kind: 'schedule', step: 'squad' }));
  return send(
    chatId,
    ['🗓 <b>Training times</b>', '', 'Which squad?'].join('\n'),
    squadKeys()
  );
}

function schedulePreview(draft) {
  return [
    `🗓 <b>${String(draft.squad).toUpperCase()}</b>`,
    '',
    draft.winter ? `Winter → <b>${esc(draft.winter)}</b>` : 'Winter → unchanged',
    draft.summer ? `Summer → <b>${esc(draft.summer)}</b>` : 'Summer → unchanged',
    draft.duration ? `Session length → <b>${esc(draft.duration)}</b>` : 'Session length → unchanged',
    '',
    'Arabic times are filled in automatically.',
    '',
    'Nothing is live yet.',
  ].join('\n');
}

const SCHED_KEYS = keys([
  [['🚀 Apply', 'pub:sched']],
  [['✖️ Cancel', 'go:cancel']],
]);

async function handleScheduleStep(chatId, message, draft) {
  const text = (message.text ?? '').trim();
  if (text.startsWith('/')) {
    return send(chatId, 'Send the time as ordinary text, for example <code>4:00 PM – 5:30 PM</code>.', keys([CANCEL]));
  }

  const { data } = await readJson(SCHEDULE_PATH);
  const current = (data?.squads ?? []).find((s) => s.id === draft.squad);

  switch (draft.step) {
    case 'squad':
      return send(chatId, 'Pick a squad using the buttons.', squadKeys());

    case 'winter':
      if (!text) return send(chatId, 'Send the new winter time, or skip.', keys(SKIP_CANCEL('skip:winter')));
      await setDraft(chatId, stamp({ ...draft, winter: text, step: 'summer' }));
      return askSummer(chatId, current);

    case 'summer':
      if (!text) return send(chatId, 'Send the new summer time, or skip.', keys(SKIP_CANCEL('skip:summer')));
      await setDraft(chatId, stamp({ ...draft, summer: text, step: 'duration' }));
      return askDuration(chatId, current);

    case 'duration': {
      if (!text) return send(chatId, 'Send the session length, or skip.', keys(SKIP_CANCEL('skip:duration')));
      const next = stamp({ ...draft, duration: text, step: 'confirm' });
      await setDraft(chatId, next);
      return send(chatId, schedulePreview(next), SCHED_KEYS);
    }

    case 'confirm':
      return send(chatId, 'Tap <b>Apply</b> to save, or <b>Cancel</b>.', SCHED_KEYS);

    default:
      await setDraft(chatId, undefined);
      return send(chatId, 'I lost track of that. Start again from the menu.', MENU_KEYS);
  }
}

const askWinter = (chatId, current) =>
  send(
    chatId,
    [
      `<b>${esc(current?.id?.toUpperCase() ?? '')}</b>  ·  winter slot`,
      '',
      `Currently: <code>${esc(current?.winterTime) || 'not set'}</code>`,
      '',
      'Send the new winter time, or skip to leave it.',
    ].join('\n'),
    keys(SKIP_CANCEL('skip:winter'))
  );

const askSummer = (chatId, current) =>
  send(
    chatId,
    [
      '<b>Summer slot</b>',
      '',
      `Currently: <code>${esc(current?.summerTime) || 'not set'}</code>`,
      '',
      'Send the new summer time, or skip.',
    ].join('\n'),
    keys(SKIP_CANCEL('skip:summer'))
  );

const askDuration = (chatId, current) =>
  send(
    chatId,
    [
      '<b>Session length</b>',
      '',
      `Currently: <code>${esc(current?.duration) || 'not set'}</code>`,
      '',
      'Send the new length, or skip.',
    ].join('\n'),
    keys(SKIP_CANCEL('skip:duration'))
  );

async function applySchedule(draft) {
  const { data, sha } = await readJson(SCHEDULE_PATH);
  const squads = data?.squads ?? [];

  const next = squads.map((s) => {
    if (s.id !== draft.squad) return s;
    const updated = { ...s };
    if (draft.winter) {
      updated.winterTime = draft.winter;
      updated.winterTimeAr = arTime(draft.winter);
    }
    if (draft.summer) {
      updated.summerTime = draft.summer;
      updated.summerTimeAr = arTime(draft.summer);
    }
    if (draft.duration) {
      updated.duration = draft.duration;
      updated.durationAr = arDuration(draft.duration);
    }
    return updated;
  });

  await writeJson({
    path: SCHEDULE_PATH,
    data: { ...data, squads: next },
    sha,
    message: `Update ${String(draft.squad).toUpperCase()} training times via Telegram`,
  });
}

/* ── Recent posts, with a delete button each ──────────────────── */

async function showList(chatId) {
  const { data } = await readJson(NEWS_PATH);
  const items = (data?.items ?? []).slice(0, 8);
  if (!items.length) return send(chatId, 'No posts yet.', MENU_KEYS);

  const rows = items.map((item, i) => [
    [`🗑 ${(item.title || 'Untitled').slice(0, 40)}`, `del:${i}`],
  ]);
  rows.push([['← Menu', 'go:menu']]);

  const lines = items.map((i, n) => `${n + 1}. <b>${esc(i.title)}</b>\n    ${esc(i.date)}`);
  return send(
    chatId,
    ['<b>Recent posts</b>', '', lines.join('\n'), '', 'Tap one to delete it.'].join('\n'),
    keys(rows)
  );
}

async function deleteByIndex(chatId, index) {
  const { sha, data } = await readJson(NEWS_PATH);
  const items = data?.items ?? [];
  const target = items[index];
  if (!target) return send(chatId, 'That post is no longer there.', MENU_KEYS);

  await writeJson({
    path: NEWS_PATH,
    data: { ...data, items: items.filter((_, i) => i !== index) },
    sha,
    message: `Delete news post "${target.id}" via Telegram`,
  });
  return send(
    chatId,
    `🗑 Deleted <b>${esc(target.title)}</b>.\n\nThe website updates in a minute or two.`,
    MENU_KEYS
  );
}

/* ── Unlocking ────────────────────────────────────────────────── */

const GREETING = [
  '👋 <b>Genoa Academy</b>',
  '',
  'This bot publishes news and training times to the academy website.',
  '',
  'Send the <b>admin passcode</b> to begin. Your message is deleted as soon',
  'as it arrives, so the passcode is not left sitting in the chat.',
].join('\n');

async function handleUnlock(chatId, text, messageId, from) {
  const missing = missingAuthConfig();
  if (missing.length > 0) {
    return send(
      chatId,
      `⚠️ This bot is not finished being set up: ${missing.join(' and ')} ` +
        `${missing.length > 1 ? 'are' : 'is'} not set on the server. ` +
        'Your passcode is not the problem.'
    );
  }

  /*
   * A command is not a passcode guess. The old bot counted anything you typed
   * before unlocking as a wrong attempt, so tapping the menu button a few
   * times locked you out of your own site for an hour.
   */
  if (text.startsWith('/')) return send(chatId, GREETING);

  const state = await checkLockout(chatId);
  if (state.lockedOut) {
    return send(chatId, `🚫 Too many wrong passcodes. Try again in ${state.minutes} minute(s).`);
  }

  if (passcodeMatches(text)) {
    await deleteMessage(chatId, messageId);
    await clearFailures(chatId);
    const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || from?.username || '';
    await unlock(chatId, name);
    await send(chatId, '✅ <b>Signed in</b> for 12 hours. Your passcode message was deleted.');
    return menu(chatId);
  }

  await deleteMessage(chatId, messageId);
  const after = await recordFailure(chatId);
  return send(
    chatId,
    after.lockedOut
      ? '🚫 Too many wrong passcodes. This chat is locked for 1 hour.'
      : `❌ That passcode is not right. ${after.remaining} attempt(s) left.`
  );
}

/* ── Typed commands (still supported, never required) ─────────── */

async function handleCommand(chatId, text, draft) {
  const cmd = text.trim().split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');

  // Always allowed, even mid-draft.
  if (cmd === '/cancel') {
    await setDraft(chatId, undefined);
    return send(chatId, 'Draft thrown away. Nothing was published.', MENU_KEYS);
  }
  if (cmd === '/help') return send(chatId, HELP_TEXT, MENU_KEYS);

  // Typed shortcuts for the two buttons people reach for most. These run the
  // SAME code as the buttons, so the two ways of driving the bot cannot drift.
  if (cmd === '/skip') {
    if (!draft) return send(chatId, 'Nothing to skip.', MENU_KEYS);
    return typedSkip(chatId, draft);
  }
  if (cmd === '/publish') {
    if (!draft) return send(chatId, 'Nothing to publish.', MENU_KEYS);
    if (draft.step !== 'confirm') {
      return send(chatId, 'Not finished yet — answer the question above first.', keys([CANCEL]));
    }
    return doPublish(chatId, draft, String(chatId), draft.kind === 'news' ? 'news' : 'sched');
  }
  if (cmd === '/start' || cmd === '/menu') {
    if (draft) return warnBusy(chatId, draft);
    return menu(chatId);
  }

  /*
   * Anything else would previously have DELETED the draft on its way past.
   * Refuse instead: a half-written post must not vanish because someone
   * mistyped a command.
   */
  if (draft) return warnBusy(chatId, draft);

  switch (cmd) {
    case '/news':
      return startNews(chatId);
    case '/schedule':
      return startSchedule(chatId);
    case '/list':
      return showList(chatId);
    case '/lock':
      await lock(chatId);
      return send(chatId, '🔒 Signed out. Send the passcode again to come back.');
    case '/who': {
      const list = await listUnlocked();
      const lines = list.map((u) => `• ${esc(u.name) || 'unnamed'} — ${u.expiresInMinutes} min left`);
      return send(chatId, lines.length ? `<b>Signed in now</b>\n${lines.join('\n')}` : 'Nobody is signed in.', MENU_KEYS);
    }
    default:
      return send(chatId, 'I did not recognise that. Here is the menu.', MENU_KEYS);
  }
}

const warnBusy = (chatId, draft) =>
  send(
    chatId,
    [
      `You are in the middle of ${draft.kind === 'news' ? 'writing a post' : 'changing training times'}.`,
      '',
      'Finish it, or cancel it — your work is not thrown away by mistake.',
    ].join('\n'),
    keys([[['✖️ Cancel that draft', 'go:cancel']]])
  );

/* ── Skipping ─────────────────────────────────────────────────────
   What "skip" means depends on the question on screen, so the step decides.
   Typing /skip used to fall through to the command router, which answered
   "you are in the middle of a post" — correct about the draft, useless as an
   answer to what was actually asked. Steps that cannot be skipped now say
   why, rather than leaving the word sitting in the draft as an answer.   */

const SKIPPABLE = {
  photo: 'photo',
  titleAr: 'arabic',
  excerptAr: 'excerptAr',
  winter: 'winter',
  summer: 'summer',
  duration: 'duration',
};

const NOT_SKIPPABLE = {
  title: 'A post needs a headline — there is nothing to fall back on.',
  excerpt: 'A post needs a summary; it is what appears under the headline.',
  squad: 'Pick a squad first, using the buttons.',
  confirm: 'Nothing left to skip — publish it or cancel it.',
};

async function applySkip(chatId, draft, value) {
  if (value === 'photo') {
    await setDraft(chatId, stamp({ ...draft, step: 'titleAr' }));
    return askArabic(chatId, 'No photo — that is fine.');
  }
  if (value === 'arabic') {
    // Skip BOTH Arabic fields and go straight to the preview.
    const next = stamp({ ...draft, titleAr: '', excerptAr: '', step: 'confirm' });
    await setDraft(chatId, next);
    return send(chatId, newsPreview(next), PREVIEW_KEYS);
  }
  if (value === 'excerptAr') {
    const next = stamp({ ...draft, excerptAr: '', step: 'confirm' });
    await setDraft(chatId, next);
    return send(chatId, newsPreview(next), PREVIEW_KEYS);
  }

  const { data: sched } = await readJson(SCHEDULE_PATH);
  const current = (sched?.squads ?? []).find((sq) => sq.id === draft.squad);

  if (value === 'winter') {
    await setDraft(chatId, stamp({ ...draft, step: 'summer' }));
    return askSummer(chatId, current);
  }
  if (value === 'summer') {
    await setDraft(chatId, stamp({ ...draft, step: 'duration' }));
    return askDuration(chatId, current);
  }
  if (value === 'duration') {
    const next = stamp({ ...draft, step: 'confirm' });
    await setDraft(chatId, next);
    return send(chatId, schedulePreview(next), SCHED_KEYS);
  }
  return menu(chatId);
}

/** Commit a finished draft. Shared by the Publish button and typed /publish. */
async function doPublish(chatId, draft, who, kind) {
  if (kind === 'news') {
    await publishDraft(draft, who);
    await setDraft(chatId, undefined);
    return send(chatId, '🚀 <b>Published.</b>\n\nThe website updates in a minute or two.', MENU_KEYS);
  }
  if (kind === 'sched') {
    await applySchedule(draft);
    await setDraft(chatId, undefined);
    return send(
      chatId,
      '🚀 <b>Saved.</b>\n\nThe website updates in a minute or two. Arabic times were filled in automatically — adjust the wording in Studio if you want it different.',
      MENU_KEYS
    );
  }
  return menu(chatId);
}

/** Typed /skip: work out what it means where the person is standing. */
async function typedSkip(chatId, draft) {
  const target = SKIPPABLE[draft.step];
  if (target) return applySkip(chatId, draft, target);
  return send(chatId, NOT_SKIPPABLE[draft.step] ?? 'That cannot be skipped.', keys([CANCEL]));
}

/* ── Button taps ──────────────────────────────────────────────── */

async function handleTap(chatId, data, tapId, messageId, who) {
  const [kind, value] = data.split(':');
  const draft = await liveDraft(chatId);

  if (kind === 'go') {
    switch (value) {
      case 'menu':
        await answerTap(tapId);
        return menu(chatId);
      case 'help':
        await answerTap(tapId);
        return send(chatId, HELP_TEXT, MENU_KEYS);
      case 'cancel':
        await setDraft(chatId, undefined);
        await answerTap(tapId, 'Cancelled');
        await editMessage(chatId, messageId, 'Cancelled. Nothing was published.');
        return menu(chatId);
      case 'lock':
        await lock(chatId);
        await answerTap(tapId);
        return send(chatId, '🔒 Signed out. Send the passcode again to come back.');
      case 'news':
        await answerTap(tapId);
        if (draft) return warnBusy(chatId, draft);
        return startNews(chatId);
      case 'sched':
        await answerTap(tapId);
        if (draft) return warnBusy(chatId, draft);
        return startSchedule(chatId);
      case 'list':
        await answerTap(tapId);
        if (draft) return warnBusy(chatId, draft);
        return showList(chatId);
      default:
        return answerTap(tapId);
    }
  }

  if (kind === 'sq') {
    await answerTap(tapId);
    if (!SQUADS.includes(value)) return send(chatId, 'Unknown squad.', squadKeys());
    const { data: sched } = await readJson(SCHEDULE_PATH);
    const current = (sched?.squads ?? []).find((s) => s.id === value);
    await setDraft(chatId, stamp({ kind: 'schedule', squad: value, step: 'winter' }));
    return askWinter(chatId, { ...current, id: value });
  }

  if (kind === 'skip') {
    if (!draft) {
      await answerTap(tapId, 'That draft has expired');
      return menu(chatId);
    }
    await answerTap(tapId, 'Skipped');
    return applySkip(chatId, draft, value);
  }

  if (kind === 'pub') {
    if (!draft) {
      await answerTap(tapId, 'That draft has expired');
      return menu(chatId);
    }
    await answerTap(tapId, 'Publishing…');
    await editMessage(chatId, messageId, 'Publishing…');
    return doPublish(chatId, draft, who, value);
  }

  if (kind === 'del') {
    await answerTap(tapId);
    if (draft) return warnBusy(chatId, draft);
    return deleteByIndex(chatId, Number(value));
  }

  return answerTap(tapId);
}

/* ── Webhook entry point ──────────────────────────────────────── */

export default async function handler(request) {
  // Telegram signs every call with the secret registered alongside the webhook.
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response('ok', { status: 200 });
  }

  const tap = update.callback_query;
  // An edited message is NOT a new answer: replying to it would re-run a step
  // the person already completed.
  const message = update.message;
  const chatId = tap?.message?.chat?.id ?? message?.chat?.id;

  // Always answer 200 — any other status makes Telegram retry for ever.
  if (!chatId) return new Response('ok', { status: 200 });

  try {
    const from = tap?.from ?? message?.from;
    const who = from?.username ? `@${from.username}` : String(chatId);

    if (!(await isUnlocked(chatId))) {
      if (tap) {
        await answerTap(tap.id, 'Send the admin passcode first');
        await send(chatId, GREETING);
      } else {
        await handleUnlock(chatId, (message.text ?? '').trim(), message.message_id, message.from);
      }
      return new Response('ok', { status: 200 });
    }

    if (tap) {
      await handleTap(chatId, tap.data ?? '', tap.id, tap.message?.message_id, who);
      return new Response('ok', { status: 200 });
    }

    const text = (message.text ?? '').trim();
    const draft = await liveDraft(chatId);

    if (text.startsWith('/')) {
      await handleCommand(chatId, text, draft);
    } else if (draft?.kind === 'news') {
      await handleNewsStep(chatId, message, draft);
    } else if (draft?.kind === 'schedule') {
      await handleScheduleStep(chatId, message, draft);
    } else {
      await menu(chatId);
    }
  } catch (err) {
    console.error('telegram handler failed', err);

    /*
     * "Try again" was the wrong answer to the commonest failure here. Every
     * publish goes through the same GitHub write as Studio, so when the token
     * cannot write, retrying fails identically and for ever. Send the real
     * reason — the bot is passcode-gated, so only the owner sees it.
     */
    const why = await explainWriteFailure(err).catch(() => String(err?.message ?? err));
    const safe = esc(String(why)).slice(0, 3000);

    await send(chatId, `⚠️ <b>Nothing was published.</b>\n\n${safe}`).catch(() => undefined);
  }

  return new Response('ok', { status: 200 });
}

export const config = { path: '/api/telegram' };
