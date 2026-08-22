// ═══════════════════════════════════════════════════════════════════
// TELEGRAM BOT — publish academy news and update the training schedule
// from a phone.
//
// SECURITY MODEL: the bot is publicly reachable (bot usernames are
// searchable), so there is NO pre-shared allowlist. Anyone may open a
// chat, but nothing happens until they send the admin passcode. A
// correct passcode unlocks that chat for 12h and auto-adds it to the
// authorised list; wrong ones are rate limited into a lockout. The
// passcode message is deleted from the chat immediately.
// ═══════════════════════════════════════════════════════════════════

import { passcodeMatches, requireEnv, missingAuthConfig } from './lib/auth.mjs';
import { readJson, writeJson, writeFile, NEWS_PATH, SCHEDULE_PATH, UPLOAD_DIR } from './lib/github.mjs';
import {
  isUnlocked, unlock, lock, listUnlocked,
  checkLockout, recordFailure, clearFailures,
  getDraft, setDraft,
} from './lib/store.mjs';
import { randomBytes } from 'node:crypto';

const SQUADS = ['u6', 'u8', 'u10', 'u12', 'u14', 'u16'];

/* ── Telegram API helpers ─────────────────────────────────────── */

async function tg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${requireEnv('TELEGRAM_BOT_TOKEN')}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({}));
}

const send = (chatId, text, extra = {}) =>
  tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });

const deleteMessage = (chatId, messageId) =>
  tg('deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);

/** Escape user text before it goes back out inside parse_mode HTML. */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ── Arabic helpers ───────────────────────────────────────────────
   Times and durations are formulaic, so the bot mirrors them into
   Arabic automatically. Free prose is never machine-translated — the
   bot asks for it, and blank Arabic falls back to English on the site. */

const arTime = (s) => String(s ?? '').replace(/\bPM\b/gi, 'مساءً').replace(/\bAM\b/gi, 'صباحًا');
const arDuration = (s) => String(s ?? '').replace(/\bminutes?\b/gi, 'دقيقة');

/* ── Content operations ───────────────────────────────────────── */

function slugify(title) {
  return (
    String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'post'
  );
}

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

  // No WebP twin: converting would need a native image library. The site
  // treats the WebP source as optional and serves this JPEG.
  return { jpg: `/uploads/${stem}.jpg`, width: largest.width, height: largest.height, alt: '' };
}

/* ── Conversation ─────────────────────────────────────────────── */

const HELP = [
  '<b>Genoa Academy bot</b>',
  '',
  '/news — post an academy update',
  '/schedule — change a squad&#39;s training times',
  '/list — show the latest posts',
  '/delete &lt;id&gt; — remove a post',
  '/who — who is currently signed in',
  '/revoke &lt;id&gt; — sign someone out',
  '/lock — sign yourself out now',
  '/cancel — abandon what you are doing',
].join('\n');

async function handleUnlock(chatId, text, messageId, from) {
  // No passcode can match when the server has none configured. Say so
  // instead of counting it as a wrong attempt and locking the chat.
  const missing = missingAuthConfig();
  if (missing.length > 0) {
    await send(
      chatId,
      `⚠️ This bot is not finished being set up: ${missing.join(' and ')} ` +
      `${missing.length > 1 ? 'are' : 'is'} not set on the server. Add ` +
      `${missing.length > 1 ? 'them' : 'it'} in Netlify under Site configuration > ` +
      'Environment variables and redeploy. Your passcode is not the problem.'
    );
    return;
  }

  const state = await checkLockout(chatId);
  if (state.lockedOut) {
    await send(chatId, `🚫 Too many wrong passcodes. Try again in ${state.minutes} minute(s).`);
    return;
  }

  if (passcodeMatches(text)) {
    await deleteMessage(chatId, messageId); // do not leave it sitting in the chat
    await clearFailures(chatId);
    const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || from?.username || '';
    await unlock(chatId, name);
    await send(chatId, `✅ Unlocked for 12 hours. Your passcode message was deleted.\n\n${HELP}`);
    return;
  }

  await deleteMessage(chatId, messageId);
  const after = await recordFailure(chatId);
  await send(
    chatId,
    after.lockedOut
      ? '🚫 Too many wrong passcodes. This chat is locked for 1 hour.'
      : `❌ Wrong passcode. ${after.remaining} attempt(s) left.`
  );
}

async function handleCommand(chatId, text, from) {
  const [rawCmd, ...rest] = text.trim().split(/\s+/);
  const arg = rest.join(' ').trim();
  const who = from?.username ? `@${from.username}` : String(chatId);

  switch (rawCmd.toLowerCase().replace(/@.*$/, '')) {
    case '/start':
    case '/help':
      return send(chatId, HELP);

    case '/lock':
      await lock(chatId);
      return send(chatId, '🔒 Signed out. Send the passcode again to come back.');

    case '/who': {
      const list = await listUnlocked();
      const lines = list.map((u) => `• <code>${esc(u.id)}</code> ${esc(u.name)} — ${u.expiresInMinutes} min left`);
      return send(chatId, lines.length ? `<b>Signed in now</b>\n${lines.join('\n')}` : 'Nobody is signed in.');
    }

    case '/revoke': {
      if (!arg) return send(chatId, 'Usage: <code>/revoke 123456789</code> — get the id from /who');
      await lock(arg);
      return send(chatId, `🔒 Signed out <code>${esc(arg)}</code>.`);
    }

    case '/cancel':
      await setDraft(chatId, undefined);
      return send(chatId, 'Cancelled.');

    case '/list': {
      const { data } = await readJson(NEWS_PATH);
      const items = (data?.items ?? []).slice(0, 10);
      if (!items.length) return send(chatId, 'No posts yet.');
      const lines = items.map((i) => `• <b>${esc(i.title)}</b>\n  <code>${esc(i.id)}</code> — ${esc(i.date)}`);
      return send(chatId, `<b>Latest posts</b>\n\n${lines.join('\n')}`);
    }

    case '/delete': {
      if (!arg) return send(chatId, 'Usage: <code>/delete post-id</code> — get the id from /list');
      const { sha, data } = await readJson(NEWS_PATH);
      const items = data?.items ?? [];
      const next = items.filter((i) => i.id !== arg);
      if (next.length === items.length) return send(chatId, `No post with id <code>${esc(arg)}</code>.`);
      await writeJson({
        path: NEWS_PATH,
        data: { ...data, items: next },
        sha,
        message: `Delete news post "${arg}" via Telegram (${who})`,
      });
      return send(chatId, '🗑 Deleted. The site rebuilds in a minute or two.');
    }

    case '/news':
      await setDraft(chatId, { kind: 'news', step: 'title' });
      return send(chatId, '📝 <b>New post</b>\n\nSend the <b>headline</b> in English.\n\n/cancel to stop.');

    case '/schedule':
      await setDraft(chatId, { kind: 'schedule', step: 'squad' });
      return send(
        chatId,
        `🗓 <b>Change training times</b>\n\nWhich squad? Reply with one of:\n${SQUADS.join(', ')}\n\n/cancel to stop.`
      );

    default:
      return send(chatId, `Unknown command.\n\n${HELP}`);
  }
}

async function handleNewsStep(chatId, message, draft, who) {
  const text = (message.text ?? '').trim();
  const skipped = text.toLowerCase() === '/skip';

  switch (draft.step) {
    case 'title':
      if (!text) return send(chatId, 'Send the headline as text.');
      await setDraft(chatId, { ...draft, title: text, step: 'excerpt' });
      return send(chatId, 'Good. Now the <b>summary</b> — a short paragraph.');

    case 'excerpt':
      if (!text) return send(chatId, 'Send the summary as text.');
      await setDraft(chatId, { ...draft, excerpt: text, step: 'photo' });
      return send(chatId, '📷 Send a <b>photo</b> for the post, or /skip.');

    case 'photo': {
      if (message.photo?.length) {
        await send(chatId, 'Saving the photo…');
        const image = await saveTelegramPhoto(message.photo);
        if (!image) return send(chatId, 'That photo would not save. Try a smaller one, or /skip.');
        image.alt = draft.title;
        await setDraft(chatId, { ...draft, image, step: 'titleAr' });
        return send(chatId, '✅ Photo saved.\n\nNow the <b>Arabic headline</b>, or /skip for English only.');
      }
      if (!skipped) return send(chatId, 'Send a photo, or /skip.');
      await setDraft(chatId, { ...draft, step: 'titleAr' });
      return send(chatId, 'No photo. Now the <b>Arabic headline</b>, or /skip.');
    }

    case 'titleAr':
      await setDraft(chatId, { ...draft, titleAr: skipped ? '' : text, step: 'excerptAr' });
      return send(chatId, 'Now the <b>Arabic summary</b>, or /skip.');

    case 'excerptAr': {
      const finished = { ...draft, excerptAr: skipped ? '' : text, step: 'confirm' };
      await setDraft(chatId, finished);
      return send(
        chatId,
        [
          '<b>Ready to publish</b>',
          '',
          `<b>${esc(finished.title)}</b>`,
          esc(finished.excerpt),
          '',
          finished.image ? '📷 photo attached' : '— no photo',
          finished.titleAr ? '🇴🇲 Arabic included' : '🇬🇧 English only (Arabic falls back to English)',
          '',
          'Send /publish to put it live, or /cancel.',
        ].join('\n')
      );
    }

    case 'confirm': {
      if (text.toLowerCase() !== '/publish') return send(chatId, 'Send /publish or /cancel.');
      await publishDraft(draft, who);
      await setDraft(chatId, undefined);
      return send(chatId, '🚀 Published. The website rebuilds in a minute or two.');
    }

    default:
      await setDraft(chatId, undefined);
      return send(chatId, 'Lost track of that draft — start again with /news.');
  }
}

async function handleScheduleStep(chatId, message, draft) {
  const text = (message.text ?? '').trim();
  const skipped = text.toLowerCase() === '/skip';
  const { data, sha } = await readJson(SCHEDULE_PATH);
  const squads = data?.squads ?? [];
  const current = squads.find((s) => s.id === draft.squad);

  switch (draft.step) {
    case 'squad': {
      const id = text.toLowerCase();
      if (!SQUADS.includes(id)) return send(chatId, `Reply with one of: ${SQUADS.join(', ')}`);
      const picked = squads.find((s) => s.id === id);
      await setDraft(chatId, { ...draft, squad: id, step: 'winter' });
      return send(
        chatId,
        `<b>${id.toUpperCase()}</b>\nCurrent winter slot: <code>${esc(picked?.winterTime)}</code>\n\nSend the new winter time, or /skip.`
      );
    }

    case 'winter':
      await setDraft(chatId, { ...draft, winter: skipped ? undefined : text, step: 'summer' });
      return send(chatId, `Current summer slot: <code>${esc(current?.summerTime)}</code>\n\nSend the new summer time, or /skip.`);

    case 'summer':
      await setDraft(chatId, { ...draft, summer: skipped ? undefined : text, step: 'duration' });
      return send(chatId, `Current session length: <code>${esc(current?.duration)}</code>\n\nSend the new length, or /skip.`);

    case 'duration': {
      const finished = { ...draft, duration: skipped ? undefined : text, step: 'confirm' };
      await setDraft(chatId, finished);
      return send(
        chatId,
        [
          `<b>${String(finished.squad).toUpperCase()}</b>`,
          finished.winter ? `Winter → ${esc(finished.winter)}` : 'Winter → unchanged',
          finished.summer ? `Summer → ${esc(finished.summer)}` : 'Summer → unchanged',
          finished.duration ? `Length → ${esc(finished.duration)}` : 'Length → unchanged',
          '',
          'Send /publish to apply, or /cancel.',
        ].join('\n')
      );
    }

    case 'confirm': {
      if (text.toLowerCase() !== '/publish') return send(chatId, 'Send /publish or /cancel.');
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
      await setDraft(chatId, undefined);
      return send(
        chatId,
        '🚀 Updated. The website rebuilds in a minute or two.\n\nArabic times were mirrored automatically — adjust the wording in the dashboard if you want it different.'
      );
    }

    default:
      await setDraft(chatId, undefined);
      return send(chatId, 'Lost track of that — start again with /schedule.');
  }
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

  const message = update.message ?? update.edited_message;
  const chatId = message?.chat?.id;
  // Always answer 200 — any other status makes Telegram retry forever.
  if (!chatId) return new Response('ok', { status: 200 });

  try {
    const text = (message.text ?? '').trim();

    if (!(await isUnlocked(chatId))) {
      if (text === '/start') {
        await send(chatId, '👋 <b>Genoa Academy bot</b>\n\nSend the admin passcode to unlock.');
      } else {
        await handleUnlock(chatId, text, message.message_id, message.from);
      }
      return new Response('ok', { status: 200 });
    }

    const who = message.from?.username ? `@${message.from.username}` : String(chatId);
    const draft = await getDraft(chatId);
    const isCommand = text.startsWith('/') && !['/skip', '/publish'].includes(text.toLowerCase());

    if (isCommand) {
      if (draft && text.toLowerCase() !== '/cancel') await setDraft(chatId, undefined);
      await handleCommand(chatId, text, message.from);
    } else if (draft?.kind === 'news') {
      await handleNewsStep(chatId, message, draft, who);
    } else if (draft?.kind === 'schedule') {
      await handleScheduleStep(chatId, message, draft);
    } else {
      await send(chatId, `Nothing in progress.\n\n${HELP}`);
    }
  } catch (err) {
    console.error('telegram handler failed', err);
    await send(chatId, '⚠️ Something went wrong. Nothing was published. Try again.').catch(() => undefined);
  }

  return new Response('ok', { status: 200 });
}

export const config = { path: '/api/telegram' };
