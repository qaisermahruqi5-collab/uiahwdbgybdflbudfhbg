// ═══════════════════════════════════════════════════════════════════
// GITHUB — the only writer. Every edit becomes a real commit on main,
// which is what triggers the Netlify rebuild. Content is therefore
// version-controlled and revertable for free.
// ═══════════════════════════════════════════════════════════════════

import { requireEnv } from './auth.mjs';

const API = 'https://api.github.com';

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

export const NEWS_PATH = 'content/news.json';
export const SCHEDULE_PATH = 'content/schedule.json';
export const UPLOAD_DIR = 'public/uploads';
