// GET /api/admin/health — self-check for the editor.
//
// Reports whether each environment variable is PRESENT and whether GitHub is
// reachable. It never returns a secret's value, only a boolean and a length,
// so it is safe to read from a browser. Requires a valid session.

import { hasSession, json, authConfigError } from './lib/auth.mjs';
import { readJson, diagnoseAccess, NEWS_PATH, SCHEDULE_PATH } from './lib/github.mjs';

const present = (name) => {
  const v = process.env[name];
  return { set: Boolean(v), length: v ? v.length : 0 };
};

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);

  const env = {
    ADMIN_PASSWORD: present('ADMIN_PASSWORD'),
    ADMIN_SESSION_SECRET: present('ADMIN_SESSION_SECRET'),
    GITHUB_REPO: present('GITHUB_REPO'),
    GITHUB_TOKEN: present('GITHUB_TOKEN'),
    TELEGRAM_BOT_TOKEN: present('TELEGRAM_BOT_TOKEN'),
    TELEGRAM_WEBHOOK_SECRET: present('TELEGRAM_WEBHOOK_SECRET'),
  };

  // GITHUB_REPO is not a secret, and seeing it is the fastest way to spot a typo.
  const repo = process.env.GITHUB_REPO ?? '(unset)';

  let access;
  try {
    access = await diagnoseAccess();
  } catch (err) {
    access = { repoVisible: false, reason: String(err.message ?? err).slice(0, 300) };
  }

  const checks = {};
  for (const [label, path] of [['news', NEWS_PATH], ['schedule', SCHEDULE_PATH]]) {
    try {
      const { data, sha } = await readJson(path);
      checks[label] = sha
        ? { ok: true, items: Array.isArray(data?.items) ? data.items.length : undefined }
        : { ok: false, reason: `${path} not found in ${repo} on branch main` };
    } catch (err) {
      checks[label] = { ok: false, reason: String(err.message ?? err).slice(0, 300) };
    }
  }

  const healthy =
    access.repoVisible && access.canWrite !== false && Object.values(checks).every((c) => c.ok);
  return json({ healthy, repo, access, env, checks });
}

export const config = { path: '/api/admin/health' };
