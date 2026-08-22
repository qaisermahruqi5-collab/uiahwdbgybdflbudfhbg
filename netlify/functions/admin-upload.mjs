// POST { passcode, filename, webpBase64, jpgBase64, width, height }
// Commits a already-resized image pair to public/uploads/ and returns the
// public paths. Resizing happens in the browser (canvas), so this function
// needs no native image dependencies.

import { hasSession, passcodeMatches, json, authConfigError } from './lib/auth.mjs';
import { writeFile, UPLOAD_DIR } from './lib/github.mjs';
import { randomBytes } from 'node:crypto';

const MAX_BYTES = 3 * 1024 * 1024; // per file, after browser-side resize

function base64Bytes(b64) {
  return Math.floor((b64.length * 3) / 4);
}

function safeSlug(name) {
  return (
    String(name ?? '')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'photo'
  );
}

export default async function handler(request) {
  const notConfigured = authConfigError();
  if (notConfigured) return notConfigured;

  if (!hasSession(request)) return json({ error: 'Not signed in' }, 401);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  if (!passcodeMatches(body?.passcode)) {
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'Incorrect admin passcode — nothing was uploaded' }, 401);
  }

  const { webpBase64, jpgBase64 } = body;
  if (typeof webpBase64 !== 'string' || typeof jpgBase64 !== 'string') {
    return json({ error: 'Both a WebP and a JPEG version are required' }, 400);
  }
  if (base64Bytes(webpBase64) > MAX_BYTES || base64Bytes(jpgBase64) > MAX_BYTES) {
    return json({ error: 'Image is too large even after resizing' }, 413);
  }

  // Content-addressed-ish name: readable, but collision-proof across posts.
  const stem = `${safeSlug(body.filename)}-${randomBytes(4).toString('hex')}`;

  await writeFile({
    path: `${UPLOAD_DIR}/${stem}.webp`,
    contentBase64: webpBase64,
    message: `Add news photo ${stem}.webp`,
  });
  await writeFile({
    path: `${UPLOAD_DIR}/${stem}.jpg`,
    contentBase64: jpgBase64,
    message: `Add news photo ${stem}.jpg`,
  });

  return json({
    ok: true,
    image: {
      webp: `/uploads/${stem}.webp`,
      jpg: `/uploads/${stem}.jpg`,
      width: Number(body.width) || 1600,
      height: Number(body.height) || 900,
      alt: '',
    },
  });
}

export const config = { path: ['/api/admin/upload', '/studio-io/upload'] };
