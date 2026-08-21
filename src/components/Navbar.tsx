import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getLenis } from '@/lib/lenis';
import { SITE } from '@/config/site';
import { useLanguage } from '@/i18n/useLanguage';

/* ── Compact EN|عربي toggle pill (desktop bar + mobile overlay) ── */
function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t('nav.langSwitchLabel')}
      className={`flex items-center rounded-[2px] border border-[rgba(201,168,76,0.4)] overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`font-inter text-[0.75rem] font-semibold uppercase tracking-[0.04em] px-3 py-1.5 transition-all duration-300 ${
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
        className={`text-[0.8125rem] font-semibold px-3 py-1.5 transition-all duration-300 ${
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

  const NAV_LINKS = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/programs', label: t('nav.programs') },
    { to: '/news', label: t('nav.news') },
    { to: '/calendar', label: t('nav.calendar') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Scroll to top on route change — Lenis-aware */
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

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

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[76px] md:h-[88px] flex items-center transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(6, 15, 37, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(201, 168, 76, 0.35)' : '1px solid rgba(201, 168, 76, 0.12)',
        }}
      >
        <div
          className="w-full max-w-[1280px] mx-auto flex items-center justify-between h-full"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt={SITE.name}
              width={385}
              height={522}
              className="h-14 sm:h-16 md:h-[4.5rem] w-auto transition-all"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(201, 168, 76, 0.3))',
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-[#C9A84C] font-inter font-medium text-[0.875rem] uppercase tracking-[0.04em] hover:opacity-100 transition-opacity group"
              >
                {link.label}
                <span aria-hidden="true" className="absolute bottom-0 start-0 w-0 h-[1px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }} />
              </Link>
            ))}
            <Link
              to="/join"
              className="btn-primary px-5 py-2 text-[0.75rem]"
            >
              {t('nav.join')}
            </Link>
            <LangToggle />
          </div>

          {/* Mobile / tablet: language toggle + hamburger */}
          <div className="lg:hidden flex items-center gap-3">
            <LangToggle />
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#C9A84C] p-2"
              aria-label={t('nav.openMenu')}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.dialogLabel')}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'rgba(6, 15, 37, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <button
            ref={closeButtonRef}
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 end-6 text-[#C9A84C] p-2"
            aria-label={t('nav.closeMenu')}
          >
            <X size={28} />
          </button>
          <div className="flex max-h-[100dvh] w-full flex-col items-center gap-6 overflow-y-auto px-6 py-24">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="relative group text-[#C9A84C] font-bebas text-[2rem] sm:text-[2.5rem] uppercase tracking-[0.03em] transition-all"
              >
                {link.label}
                <span aria-hidden="true" className="absolute bottom-0 start-0 w-0 h-[2px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }} />
              </Link>
            ))}
            <Link
              to="/join"
              onClick={() => setMenuOpen(false)}
              className="relative group text-[#C9A84C] font-bebas text-[2rem] sm:text-[2.5rem] uppercase tracking-[0.03em] transition-all"
            >
              {t('nav.join')}
              <span aria-hidden="true" className="absolute bottom-0 start-0 w-0 h-[2px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)' }} />
            </Link>
            <LangToggle className="mt-2" />
          </div>
        </div>
      )}
    </>
  );
}
