// GET  /api/admin/telegram  -> current webhook status
// POST /api/admin/telegram  -> register (or re-register) the webhook
//
// Exists so nobody has to paste a bot token into a terminal. Both the token
// and the webhook secret are already in this function's environment, so it
// can call Telegram itself. Neither value is ever returned to the browser.

import { hasSession, passcodeMatches, json, authConfigError } from './lib/auth.mjs';

const tgApi = (method) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

/** The public origin of this site, as seen by the visitor. */
function publicOrigin(request) {
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('host');
  return `${proto}://${host}`;
}

/** Strip anything secret out of Telegram's reply before it reaches a browser. */
function safeInfo(info) {
  if (!info) return null;
  return {
    url: info.url ? info.url.replace(/\/bot[0-9]+:[^/]+/, '/bot***') : '',
    hasCustomCertificate: info.has_custom_certificate,
    pendingUpdateCount: info.pending_update_count,
    lastErrorMessage: info.last_error_message ?? null,
    lastErrorDate: info.last_error_date ?? null,
    maxConnections: info.max_connections,
    // Studio warns when this is missing callback_query: it means the webhook
    // was registered by an older version and the buttons will not respond.
    allowedUpdates: info.allowed_updates ?? null,
  };
}

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return json({ error: 'TELEGRAM_BOT_TOKEN is not set in Netlify.' }, 400);
  }
  if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
    return json({ error: 'TELEGRAM_WEBHOOK_SECRET is not set in Netlify.' }, 400);
  }

  const expectedUrl = `${publicOrigin(request)}/api/telegram`;

  if (request.method === 'GET') {
    try {
      const res = await fetch(tgApi('getWebhookInfo'));
      const body = await res.json();
      if (!body.ok) return json({ error: body.description ?? 'Telegram rejected the request.' }, 502);

      const info = safeInfo(body.result);
      return json({
        connected: body.result?.url === expectedUrl,
        expectedUrl,
        info,
      });
    } catch (err) {
      return json({ error: `Could not reach Telegram: ${err.message}` }, 502);
    }
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  // Pointing the bot at a new URL is a configuration change, so it takes the
  // passcode like every other change.
  if (!passcodeMatches(body?.passcode)) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ error: 'Incorrect admin passcode — the bot was not changed.' }, 401);
  }

  try {
    const res = await fetch(tgApi('setWebhook'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: expectedUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        /*
         * callback_query is what delivers BUTTON TAPS. It was missing, so
         * every inline button in the bot was dead on arrival — Telegram
         * dropped the tap and the bot never heard about it. Re-registering
         * the webhook is what applies this.
         */
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    });
    const result = await res.json();
    if (!result.ok) {
      return json({ error: result.description ?? 'Telegram refused to set the webhook.' }, 502);
    }

    // The ☰ menu in Telegram. Discoverability for anyone who would rather
    // type than tap, and it costs one call at connect time.
    await fetch(tgApi('setMyCommands'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'menu', description: 'Show the main menu' },
          { command: 'news', description: 'Write a news post' },
          { command: 'schedule', description: 'Change training times' },
          { command: 'list', description: 'Recent posts' },
          { command: 'cancel', description: 'Throw away the current draft' },
          { command: 'help', description: 'How this works' },
          { command: 'lock', description: 'Sign out' },
        ],
      }),
    }).catch(() => undefined);

    const check = await (await fetch(tgApi('getWebhookInfo'))).json();
    return json({ ok: true, connected: check.result?.url === expectedUrl, expectedUrl, info: safeInfo(check.result) });
  } catch (err) {
    return json({ error: `Could not reach Telegram: ${err.message}` }, 502);
  }
}

export const config = { path: ['/api/admin/telegram', '/studio-io/bot'] };
