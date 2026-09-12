// ═══════════════════════════════════════════════════════════════════
// NAVBAR — the findability fix lives here.
//
// The review's loudest complaint was that people could not locate
// things: coaches, the venue and the fee detail had no entry point at
// all. So the bar now names all seven destinations, and Register is a
// filled button rather than another link in the row.
//
// RULES THIS ENCODES
//  • Sticky, and the Register button is in it at every scroll position
//    and every breakpoint — including the mobile bar, not just inside
//    the menu. That is what keeps registering within two clicks from
//    anywhere on the site.
//  • The header is never fully transparent: a Register button you
//    cannot read is not "always visible".
//  • Pathway, Coaches and Location are SECTIONS of the Academy page,
//    reached by anchor (/about#coaches). There is deliberately no
//    second coaches page — see src/sections/CoachesSection.tsx.
//  • The mobile menu lists every item in NAV_LINKS. Nothing is hidden
//    behind a submenu, and nothing is desktop-only.
//
// Scroll position after a navigation is owned by ScrollToHash, not by
// this component — two owners meant the hash links fought a
// scroll-to-top and lost.
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SITE } from '@/config/site';
import { registerLink } from '@/lib/registerLink';
import { useLanguage } from '@/i18n/useLanguage';

/* ── Compact EN|عربي toggle pill (desktop bar + mobile overlay) ── */
function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t('nav.langSwitchLabel')}
      className={`flex items-center overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.4)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`px-3 py-1.5 font-inter text-[0.75rem] font-semibold uppercase tracking-[0.04em] transition-all duration-300 ${
          lang === 'en'
            ? 'bg-[#C9A84C] text-[#060F25]'
            : 'text-[#C9A84C] hover:bg-[rgba(201,168,76,0.12)]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        /* Always render the Arabic label in Cairo, even in LTR mode */
        style={{ fontFamily: "'Cairo', sans-serif" }}
        className={`px-3 py-1.5 text-[0.8125rem] font-semibold transition-all duration-300 ${
          lang === 'ar'
            ? 'bg-[#C9A84C] text-[#060F25]'
            : 'text-[#C9A84C] hover:bg-[rgba(201,168,76,0.12)]'
        }`}
      >
        عربي
      </button>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { t } = useLanguage();

  /** Every destination, in one list, used by BOTH the bar and the menu. */
  const NAV_LINKS = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/programs', label: t('nav.programs') },
    { to: '/about#pathway', label: t('nav.pathway') },
    { to: '/about#coaches', label: t('nav.coaches') },
    { to: '/about#location', label: t('nav.location') },
    { to: '/faq', label: t('nav.faq') },
  ];

  /** Secondary destinations — kept out of the crowded bar, but never
   *  orphaned: the mobile menu and the footer sitemap both list them. */
  const SECONDARY_LINKS = [
    { to: '/news', label: t('nav.news') },
    { to: '/calendar', label: t('nav.calendar') },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Every link in the overlay closes it in its own onClick — tapping an
     anchor must not leave the menu covering the section it scrolled to.
     Done there rather than in an effect on location, which would be a
     setState-during-effect cascade for no extra safety. */

  /* Mobile menu: Escape to close, body scroll-lock, focus close button on open */
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /** Underline the section the visitor is in. '/' only matches exactly. */
  const isCurrent = (to: string) => {
    const [path, frag] = to.split('#');
    if (path !== location.pathname) return false;
    if (!frag) return !location.hash;
    return location.hash === `#${frag}`;
  };

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex h-[76px] items-center transition-all duration-300 md:h-[88px]"
        style={{
          /* Never transparent — the Register button has to stay legible
             over the hero photo as well as over the page background. */
          backgroundColor: scrolled ? 'rgba(6, 15, 37, 0.94)' : 'rgba(6, 15, 37, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid rgba(201, 168, 76, 0.35)'
            : '1px solid rgba(201, 168, 76, 0.16)',
        }}
      >
        <div
          className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-4"
          style={{ padding: '0 clamp(1rem, 4vw, 3rem)' }}
        >
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center" aria-label={SITE.name}>
            <img
              src="/logo.png"
              alt={SITE.name}
              width={385}
              height={522}
              className="h-12 w-auto transition-all sm:h-14 md:h-[4rem]"
              style={{ filter: 'drop-shadow(0 0 10px rgba(201, 168, 76, 0.3))' }}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-4 lg:flex xl:gap-5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isCurrent(link.to) ? 'page' : undefined}
                className="group relative whitespace-nowrap font-inter text-[0.8125rem] font-medium uppercase tracking-[0.03em] text-[#C9A84C] transition-opacity"
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-[-4px] start-0 h-[1px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full ${
                    isCurrent(link.to) ? 'w-full' : 'w-0'
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
                />
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Register — the primary action, present at every breakpoint */}
            <Link
              to={registerLink()}
              className="btn-primary whitespace-nowrap px-4 py-2 text-[0.6875rem] sm:px-5 sm:text-[0.75rem]"
            >
              {t('nav.register')}
            </Link>

            <LangToggle className="hidden sm:flex" />

            {/* Hamburger — everything in NAV_LINKS plus the secondary pages */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-[#C9A84C] lg:hidden"
              aria-label={t('nav.openMenu')}
              aria-expanded={menuOpen}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile / tablet full-screen menu ──────────────────────────
          Scrollable, because at 360px nine links plus the language
          toggle do not fit on one screen and a menu you cannot reach
          the bottom of is the bug this is meant to prevent.        */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.dialogLabel')}
          className="fixed inset-0 z-[70] flex flex-col"
          style={{
            backgroundColor: 'rgba(6, 15, 37, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex h-[76px] shrink-0 items-center justify-end px-4">
            <button
              ref={closeButtonRef}
              onClick={() => setMenuOpen(false)}
              className="p-2 text-[#C9A84C]"
              aria-label={t('nav.closeMenu')}
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-12">
            <nav className="flex flex-col items-start gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isCurrent(link.to) ? 'page' : undefined}
                  className="w-full py-3 font-bebas text-[1.75rem] uppercase tracking-[0.03em] text-[#C9A84C] sm:text-[2rem]"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Secondary pages — listed, never hidden */}
              {SECONDARY_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-3 font-inter text-[1rem] font-medium uppercase tracking-[0.06em] text-[#8A94A6]"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              to={registerLink()}
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-8 w-full px-8 py-4 text-[0.875rem]"
            >
              {t('nav.register')}
            </Link>

            <LangToggle className="mt-6 w-fit" />
          </div>
        </div>
      )}
    </>
  );
}
