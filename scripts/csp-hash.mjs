// ═══════════════════════════════════════════════════════════════════
// Recomputes the CSP sha256 hash for every inline <script> in
// index.html and prints the script-src fragment to paste into
// netlify.toml. Run after editing the JSON-LD structured-data block:
//
//   npm run csp-hash
// ═══════════════════════════════════════════════════════════════════

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Normalise CRLF to LF before hashing. Git stores index.html with LF (see
// .gitattributes), so the bytes Netlify actually serves use LF. Hashing a CRLF
// working copy prints a hash that is wrong in production, and the only symptom
// is your structured data silently vanishing from search results.
const raw = await readFile(join(root, 'index.html'), 'utf8');
const html = raw.split('\r\n').join('\n');

const hashes = [];
for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
  const [, body] = match;
  if (!body.trim()) continue; // <script src="..."> — covered by 'self'
  hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
}

if (hashes.length === 0) {
  console.log("No inline scripts found. script-src 'self' is enough.");
} else {
  console.log('Paste this into the script-src directive in netlify.toml:\n');
  console.log(`script-src 'self' ${hashes.join(' ')}`);
}
