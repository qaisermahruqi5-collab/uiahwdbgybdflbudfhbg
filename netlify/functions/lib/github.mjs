// ═══════════════════════════════════════════════════════════════════
// GITHUB — the only writer. Every edit becomes a real commit on main,
// which is what triggers the Netlify rebuild. Content is therefore
// version-controlled and revertable for free.
// ═══════════════════════════════════════════════════════════════════

import { requireEnv } from './auth.mjs';

const API = 'https://api.github.com';

/** Set from the response header on the most recent authenticated call. */
let lastSeenTokenExpiry = null;

function repoParts() {
  const repo = requireEnv('GITHUB_REPO'); // e.g. owner/name
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`GITHUB_REPO must look like "owner/name", got "${repo}"`);
  return { owner, name };
}

async function gh(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'genoa-academy-admin',
      ...(init.headers ?? {}),
    },
  });

  /*
   * GitHub returns the fine-grained token's expiry date on every authenticated
   * response. Catching it here is the only way to warn BEFORE the token lapses
   * and every publish starts failing — which is exactly how this site lost an
   * afternoon once already.
   */
  const expiry = res.headers.get('github-authentication-token-expiration');
  if (expiry) lastSeenTokenExpiry = expiry;

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    // Never echo the token; surface only what helps diagnose.
    throw new Error(`GitHub ${init.method ?? 'GET'} ${path} failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

/**
 * Fetch a text file plus its blob SHA. The SHA is required to update the
 * file, and is what makes concurrent edits safe: GitHub rejects the write
 * if someone else changed the file since we read it.
 */
export async function readFile(path) {
  const { owner, name } = repoParts();
  try {
    const data = await gh(`/repos/${owner}/${name}/contents/${encodeURI(path)}?ref=main`);
    return {
      sha: data.sha,
      text: Buffer.from(data.content, 'base64').toString('utf8'),
    };
  } catch (err) {
    if (String(err).includes(': 404')) return { sha: undefined, text: undefined };
    throw err;
  }
}

export async function readJson(path) {
  const { sha, text } = await readFile(path);
  if (text === undefined) return { sha: undefined, data: undefined };
  return { sha, data: JSON.parse(text) };
}

/** Create or update a file. Pass the sha you read, or omit it to create. */
export async function writeFile({ path, contentBase64, message, sha }) {
  const { owner, name } = repoParts();
  return gh(`/repos/${owner}/${name}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });
}

export function writeJson({ path, data, message, sha }) {
  const text = `${JSON.stringify(data, null, 2)}\n`;
  return writeFile({
    path,
    contentBase64: Buffer.from(text, 'utf8').toString('base64'),
    message,
    sha,
  });
}


/**
 * Why can we not read the repo?
 *
 * GitHub returns 404 — not 403 — for a private repository the caller cannot
 * see, so it deliberately does not leak whether the repo exists. That means a
 * missing file and a token without access are indistinguishable at the file
 * level. Probing the repository root separates them.
 */
export async function diagnoseAccess() {
  const { owner, name } = repoParts();
  const res = await fetch(`${API}/repos/${owner}/${name}`, {
    headers: {
      Authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'genoa-academy-admin',
    },
  });

  if (res.ok) {
    const repo = await res.json();
    return {
      repoVisible: true,
      defaultBranch: repo.default_branch,
      canWrite: Boolean(repo.permissions?.push),
      reason: repo.permissions?.push
        ? null
        : `The token can read ${owner}/${name} but not write to it. Set Contents to "Read and write".`,
    };
  }

  if (res.status === 401) {
    return {
      repoVisible: false,
      reason: 'GITHUB_TOKEN is invalid or expired. Generate a new one and update it in Netlify.',
    };
  }

  if (res.status === 404) {
    return {
      repoVisible: false,
      reason:
        `The token cannot see ${owner}/${name}. That repository is private, and GitHub answers 404 ` +
        `for private repositories a token has no access to. Check, in order: ` +
        `(1) GITHUB_REPO reads exactly "${owner}/${name}"; ` +
        `(2) the token's "Repository access" explicitly includes this repository; ` +
        `(3) its Contents permission is "Read and write"; ` +
        `(4) the token belongs to an account that can reach this repository.`,
    };
  }

  return { repoVisible: false, reason: `GitHub returned ${res.status} for ${owner}/${name}.` };
}

/**
 * Turn a failed WRITE into something a person can act on.
 *
 * GitHub answers a refused write with "Resource not accessible by personal
 * access token", which names neither the permission nor the repository. Worse,
 * reading a PUBLIC repository needs no permission at all, so a token with no
 * write access loads the editor perfectly and only fails at the moment you
 * press Publish — which reads as "publishing is broken" rather than "the token
 * cannot write".
 *
 * Ask GitHub what the token can actually do, and say so.
 */
export async function explainWriteFailure(err) {
  const raw = String(err?.message ?? err);

  // Not a GitHub transport error (validation, JSON shape): pass it through.
  if (!/^GitHub /.test(raw)) return raw;

  const { owner, name } = repoParts();

  let access;
  try {
    access = await diagnoseAccess();
  } catch {
    access = null;
  }

  const is = (code) => raw.includes(`: ${code} `) || raw.includes(`: ${code}{`);

  if (is(401)) {
    return (
      `GITHUB_TOKEN is invalid or has expired, so nothing can be published. ` +
      `Generate a new token, update GITHUB_TOKEN in Netlify, and redeploy.`
    );
  }

  if (is(403)) {
    return (
      `GitHub refused the write: the token cannot write to ${owner}/${name}. ` +
      `Reading worked because that repository is public, which needs no permission — ` +
      `only writing does, which is why this appears at Publish and not before.

` +
      `Fix it on GitHub under Settings > Developer settings > Personal access tokens > ` +
      `Fine-grained tokens, opening the token used here:
` +
      `1. Repository access must explicitly include ${owner}/${name}.
` +
      `2. Repository permissions > Contents must be "Read and write", not "Read-only".
` +
      `3. The token must belong to ${owner}. A fine-grained token only reaches ` +
      `repositories owned by the account it was created under, so a token made on a ` +
      `different account can read this public repo but can never write to it.
` +
      `4. The token must not be expired.

` +
      `Permission changes apply immediately — no new token and no redeploy needed. ` +
      `Only replacing the token itself needs GITHUB_TOKEN updated in Netlify.`
    );
  }

  if (is(404)) {
    return (
      `GitHub could not find ${owner}/${name} for writing. Check GITHUB_REPO reads ` +
      `exactly "${owner}/${name}", and that the branch main exists.` +
      (access?.reason ? ` ${access.reason}` : '')
    );
  }

  if (is(409) || is(422)) {
    return (
      `GitHub rejected the write because the file changed since the editor loaded it. ` +
      `Reload Studio so it picks up the current version, then publish again.`
    );
  }

  return access?.reason ? `${raw} — ${access.reason}` : raw;
}


/**
 * When does GITHUB_TOKEN expire, and how close is that?
 *
 * The header only arrives on an authenticated call, so make one if nothing
 * has been seen yet this invocation.
 */
export async function tokenExpiry() {
  if (!lastSeenTokenExpiry) {
    const { owner, name } = repoParts();
    try {
      await gh(`/repos/${owner}/${name}`);
    } catch {
      /* diagnoseAccess reports why; this only wants the header. */
    }
  }
  if (!lastSeenTokenExpiry) return null;

  // The header looks like "2026-09-20 12:00:00 UTC".
  const parsed = new Date(lastSeenTokenExpiry.replace(" UTC", "Z").replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return { raw: lastSeenTokenExpiry };

  const days = Math.floor((parsed.getTime() - Date.now()) / 86400000);
  return {
    raw: lastSeenTokenExpiry,
    iso: parsed.toISOString(),
    daysLeft: days,
    expired: days < 0,
    soon: days >= 0 && days <= 14,
  };
}

/** The most recent commit touching the editable content. */
export async function lastPublish() {
  const { owner, name } = repoParts();
  try {
    const commits = await gh(
      `/repos/${owner}/${name}/commits?path=content&per_page=1&sha=main`
    );
    const top = Array.isArray(commits) ? commits[0] : null;
    if (!top) return null;
    return {
      when: top.commit?.committer?.date ?? top.commit?.author?.date ?? null,
      // Commit messages are multi-line; the subject line is the useful part.
      message: String(top.commit?.message ?? '').split(/\r?\n/)[0].slice(0, 160),
    };
  } catch {
    return null;
  }
}


export const NEWS_PATH = 'content/news.json';
export const SCHEDULE_PATH = 'content/schedule.json';
export const UPLOAD_DIR = 'public/uploads';
