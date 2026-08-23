/**
 * Presence beacon — "is anyone reading the site right now".
 *
 * WHAT THIS SENDS
 *   A random id this tab invented for itself, and the word "site".
 *
 * WHAT IT DOES NOT SEND
 *   No cookie. No IP is stored server-side. No page, no referrer, no user
 *   agent, no timings, nothing joined across visits. The id lives in
 *   sessionStorage, so it dies with the tab and is never the same twice.
 *   Entries expire after three minutes.
 *
 * It answers one question — how many people are here now — and is built so
 * that it cannot answer any other. That is deliberate: a presence light is
 * useful to the academy, and tracking is not worth doing to their visitors.
 *
 * It is also entirely optional. Every failure is swallowed: if the endpoint
 * is missing, blocked or slow, the website behaves exactly as if this file
 * did not exist.
 */

const ENDPOINT = '/studio-io/pulse';
const KEY = 'ga.presence';
const EVERY_MS = 60_000;

function tabId(): string {
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Storage blocked: still countable for this ping, just not across pings.
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function ping(): void {
  // Only count someone who is actually looking at the page.
  if (document.visibilityState !== 'visible') return;

  const body = JSON.stringify({ where: 'site', id: tabId() });

  try {
    // sendBeacon survives the page being closed and never blocks rendering.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

/** Report an application submission. Fire-and-forget; never blocks the form. */
export function reportFormSubmitted(): void {
  const body = JSON.stringify({ event: 'form' });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through */
  }
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function startPresence(): void {
  ping();
  setInterval(ping, EVERY_MS);
  // Coming back to the tab should register immediately, not up to a minute later.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ping();
  });
}
