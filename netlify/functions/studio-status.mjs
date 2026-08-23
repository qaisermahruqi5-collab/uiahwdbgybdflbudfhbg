// GET /studio-io/status — everything the Status tab needs about the site
// itself, as opposed to who is currently on it (that is /studio-io/pulse).
//
// Requires a session. Returns no secret and no token value: only whether
// publishing currently works, when the token lapses, what was last published,
// and how much content exists.

import { hasSession, json, authConfigError } from './lib/auth.mjs';
import {
  diagnoseAccess,
  tokenExpiry,
  lastPublish,
  readJson,
  NEWS_PATH,
  SCHEDULE_PATH,
} from './lib/github.mjs';

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  // Independent calls, so run them together rather than in a waterfall.
  const [access, expiry, published, news, schedule] = await Promise.all([
    diagnoseAccess().catch((err) => ({ repoVisible: false, reason: String(err.message ?? err) })),
    tokenExpiry().catch(() => null),
    lastPublish().catch(() => null),
    readJson(NEWS_PATH).catch(() => ({ data: null })),
    readJson(SCHEDULE_PATH).catch(() => ({ data: null })),
  ]);

  const posts = Array.isArray(news.data?.items) ? news.data.items : [];

  return json({
    repo: process.env.GITHUB_REPO ?? '(unset)',
    canPublish: access?.repoVisible === true && access?.canWrite !== false,
    access,
    token: expiry,
    lastPublish: published,
    content: {
      posts: posts.length,
      newestPost: posts[0]?.date ?? null,
      squads: Array.isArray(schedule.data?.squads) ? schedule.data.squads.length : null,
      terms: Array.isArray(schedule.data?.terms) ? schedule.data.terms.length : null,
      withPhotos: posts.filter((p) => p?.image?.jpg).length,
      missingArabic: posts.filter((p) => !String(p?.titleAr ?? '').trim()).length,
    },
  });
}

export const config = { path: ['/studio-io/status', '/api/admin/status'] };
