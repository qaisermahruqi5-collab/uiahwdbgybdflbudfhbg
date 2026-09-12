// ═══════════════════════════════════════════════════════════════════
// FOOTER — the safety net for findability.
//
// A visitor who has scrolled to the bottom of any page should not have
// to go hunting: every page is listed here, alongside direct links to
// the things people actually came for (fees, training times, the FAQ,
// the venue) and the venue address itself.
//
// This is also where News and Calendar stay reachable. The primary nav
// is deliberately limited to the seven destinations the review asked
// for, so the sitemap is what keeps the rest of the site from being
// orphaned.
// ═══════════════════════════════════════════════════════════════════

import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE, whatsappLink } from '@/config/site';
import { registerLink } from '@/lib/registerLink';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';

const headingClass =
  'font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C]';
const linkClass =
  'font-inter text-[0.9375rem] text-[#F5F1EB] transition-colors duration-300 hover:text-[#C9A84C]';

export default function Footer() {
  const { t } = useLanguage();
  const content = useContent();
  const loc = content.location;

  /** Every page on the site. */
  const pages = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/programs', label: t('nav.programs') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/news', label: t('nav.news') },
    { to: '/calendar', label: t('nav.calendar') },
    { to: registerLink(), label: t('nav.register') },
    { to: '/privacy', label: t('footer.privacyLink') },
  ];

  /** Straight to the thing, not to the page it lives on. */
  const shortcuts = [
    { to: '/programs#pricing', label: t('footer.pricingLink') },
    { to: '/programs#schedule', label: t('footer.timesLink') },
    { to: '/programs#terms', label: t('footer.termsLink') },
    { to: '/about#pathway', label: t('nav.pathway') },
    { to: '/about#coaches', label: t('nav.coaches') },
    { to: '/about#location', label: t('nav.location') },
  ];

  return (
    <footer className="relative" style={{ backgroundColor: '#060F25' }}>
      <span aria-hidden="true" className="hairline" />

      <div
        className="mx-auto max-w-[1280px]"
        style={{
          padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 5vw, 4rem) clamp(2rem, 5vw, 3rem)',
        }}
      >
        {/* Ghost wordmark row (decorative) */}
        <div
          aria-hidden="true"
          className="text-ghost mb-10 select-none text-center font-bebas uppercase leading-none"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)', opacity: 0.35 }}
        >
          GENOA
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <img
              src="/logo.png"
              alt={SITE.name}
              width={385}
              height={522}
              className="h-16 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(201, 168, 76, 0.25))' }}
            />
            <h2 className="font-bebas text-[1.375rem] tracking-[0.02em] text-[#C9A84C]">
              {SITE.name}
            </h2>
            <p className="font-inter text-[0.875rem] leading-relaxed text-[#8A94A6]">
              {t('footer.tagline', { location: t('site.location') })}
            </p>
          </div>

          {/* Sitemap — all pages */}
          <nav aria-labelledby="footer-pages" className="flex flex-col gap-4">
            <h2 id="footer-pages" className={headingClass}>
              {t('footer.pages')}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {pages.map(page => (
                <li key={page.to}>
                  <Link to={page.to} className={linkClass}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Shortcuts — deep links to the answers people want */}
          <nav aria-labelledby="footer-find" className="flex flex-col gap-4">
            <h2 id="footer-find" className={headingClass}>
              {t('footer.findFast')}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {shortcuts.map(item => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + the venue, compactly */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 id="footer-contact" className={headingClass}>
                {t('footer.contact')}
              </h2>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-inter text-[0.9375rem] text-[#F5F1EB] transition-colors duration-300 hover:text-[#25D366]"
                  >
                    <Phone size={15} aria-hidden="true" />
                    <span>{t('footer.whatsapp')}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE.email}`}
                    className={`flex items-center gap-2 ${linkClass} break-all`}
                  >
                    <Mail size={15} className="shrink-0" aria-hidden="true" />
                    <span>{SITE.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${linkClass}`}
                  >
                    <Instagram size={15} aria-hidden="true" />
                    <span>{SITE.instagramHandle}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Where training happens, on every page */}
            <div className="flex flex-col gap-2">
              <h2 className={headingClass}>{t('footer.whereWeTrain')}</h2>
              <p className="font-inter text-[0.875rem] leading-[1.6] text-[#F5F1EB]">
                {loc.venue}
              </p>
              <p className="font-inter text-[0.8125rem] leading-[1.6] text-[#8A94A6]">
                {loc.address}
              </p>
              <a
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C] transition-opacity duration-300 hover:opacity-75"
              >
                <MapPin size={13} aria-hidden="true" />
                {t('location.openInMaps')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <span aria-hidden="true" className="hairline" />
      <div className="w-full text-center" style={{ padding: '1rem 0' }}>
        <p className="font-inter text-[0.75rem] tracking-[0.02em] text-[#8A94A6]">
          {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
