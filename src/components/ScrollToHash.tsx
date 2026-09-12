// ═══════════════════════════════════════════════════════════════════
// SCROLL RESTORATION — the single owner of "where does the page sit
// after a navigation".
//
// Two jobs, and they must not fight:
//   • no #hash  → go to the top, as a new page should
//   • a #hash   → scroll that section under the sticky header
//
// WHY A COMPONENT AND NOT THE BROWSER
// The app is a HashRouter, so the URL already spends its one '#' on the
// route: /#/about#coaches. The browser therefore never sees '#coaches'
// as a fragment and never scrolls to it — React Router hands it to us
// as location.hash instead, and this is where we act on it.
//
// WHY setTimeout AND NOT requestAnimationFrame
// The target is usually in the DOM by the time this effect runs, but not
// always, so the lookup is retried. That retry must NOT be driven by
// requestAnimationFrame: rAF callbacks are throttled to a standstill
// whenever the page is not being composited — a background tab, an
// offscreen preview, some mobile power-saving states. A deep link opened
// into a background tab would then never scroll, and would silently sit
// at the top when the visitor switched to it. setTimeout keeps running
// in those conditions, so the scroll still lands.
// ═══════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '@/lib/lenis';

/** Clearance for the fixed navbar (76px mobile / 88px desktop) plus air.
 *  Kept in step with `.scroll-anchor { scroll-margin-top }` in index.css. */
export const NAV_OFFSET = 104;

/** How long to keep looking for a section that has not mounted yet. */
const RETRY_INTERVAL_MS = 50;
const RETRY_LIMIT = 20; // ≈1s, then give up rather than hang

/** How long to give the smooth scroll before checking it happened at all. */
const VERIFY_DELAY_MS = 400;

function scrollToTop() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

/** Where the page must end up for `el` to sit just under the navbar. */
function targetScrollTop(el: HTMLElement): number {
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
}

/**
 * Scroll `el` under the sticky header, smoothly when we can.
 *
 * Lenis owns scrolling for the whole site, so a programmatic jump goes
 * through it — bypassing it would leave its internal position out of step
 * with the real one, and the next wheel event would snap back.
 *
 * Returns a "did it actually move?" check. Lenis animates on
 * requestAnimationFrame, which stops entirely when the page is not being
 * composited, and its scrollTo then does nothing at all and reports no
 * error. That is precisely the background-tab case — someone opening a
 * shared /#/faq#faq-instalments link into a new tab — so rather than
 * trust it, we look again shortly afterwards and jump natively if the
 * page never moved. A normal smooth scroll is well underway by then, so
 * the fallback does not fire and does not interrupt it.
 */
function scrollToElement(el: HTMLElement): (() => void) | undefined {
  const lenis = getLenis();

  if (!lenis) {
    /* Lenis is absent under prefers-reduced-motion — jump, don't animate. */
    window.scrollTo({ top: targetScrollTop(el), behavior: 'auto' });
    return undefined;
  }

  const startedAt = window.scrollY;
  lenis.scrollTo(el, { offset: -NAV_OFFSET });

  return () => {
    if (window.scrollY !== startedAt) return; // it moved — nothing to do
    const top = targetScrollTop(el);
    if (Math.round(top) === Math.round(startedAt)) return; // already in place
    window.scrollTo({ top, behavior: 'auto' });
  };
}

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      scrollToTop();
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let lookTimer = 0;
    let verifyTimer = 0;

    const go = (el: HTMLElement) => {
      const verify = scrollToElement(el);
      if (verify) verifyTimer = window.setTimeout(verify, VERIFY_DELAY_MS);
    };

    const look = () => {
      const el = document.getElementById(id);
      if (el) {
        go(el);
        return;
      }
      /* Not mounted yet (or the id is gone) — keep looking briefly, then
         give up at the top rather than leaving the visitor mid-page. */
      if (++attempts < RETRY_LIMIT) lookTimer = window.setTimeout(look, RETRY_INTERVAL_MS);
      else scrollToTop();
    };

    /* The common case: the section is already mounted, so this lands
       immediately and no retry timer is ever created. */
    look();

    return () => {
      window.clearTimeout(lookTimer);
      window.clearTimeout(verifyTimer);
    };
  }, [pathname, hash]);

  return null;
}
