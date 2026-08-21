import { Phone, Mail, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE, whatsappLink } from '@/config/site';
import { useLanguage } from '@/i18n/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: '#060F25',
      }}
    >
      {/* Top hairline */}
      <span aria-hidden="true" className="hairline" />
      <div
        className="max-w-[1280px] mx-auto"
        style={{
          padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 4rem) clamp(2rem, 5vw, 4rem)',
        }}
      >
        {/* Ghost wordmark row (decorative) */}
        <div
          aria-hidden="true"
          className="text-ghost font-bebas uppercase text-center leading-none select-none mb-10"
          style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', opacity: 0.35 }}
        >
          GENOA
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src="/logo.png"
              alt={SITE.name}
              width={385}
              height={522}
              className="h-20 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(201, 168, 76, 0.25))' }}
            />
            <h3 className="font-bebas text-[1.5rem] text-[#C9A84C] tracking-[0.02em] text-center md:text-left">
              {SITE.name}
            </h3>
            <p className="font-inter text-[0.875rem] text-[#8A94A6] leading-relaxed text-center md:text-left">
              {t('footer.tagline', { location: t('site.location') })}
            </p>
          </div>

          {/* Vertical hairline separator (desktop) */}
          <span aria-hidden="true" className="hairline hidden md:block w-px h-auto self-stretch" />

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C]">
              {t('footer.navigate')}
            </h4>
            <nav className="flex flex-col items-center md:items-start gap-3">
              <Link
                to="/about"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.aboutLink')}
              </Link>
              <Link
                to="/programs"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.programsLink')}
              </Link>
              <Link
                to="/news"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.newsLink')}
              </Link>
              <Link
                to="/calendar"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.calendarLink')}
              </Link>
              <Link
                to="/join"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.joinLink')}
              </Link>
              <Link
                to="/privacy"
                className="font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-all duration-300 hover:translate-x-1"
              >
                {t('footer.privacyLink')}
              </Link>
            </nav>
          </div>

          {/* Vertical hairline separator (desktop) */}
          <span aria-hidden="true" className="hairline hidden md:block w-px h-auto self-stretch" />

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C]">
              {t('footer.contact')}
            </h4>
            <div className="flex flex-col items-center md:items-start gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-inter text-[1rem] text-[#F5F1EB] hover:text-[#25D366] transition-colors duration-300"
              >
                <Phone size={16} />
                <span>{t('footer.whatsapp')}</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-colors duration-300"
              >
                <Mail size={16} />
                <span>{SITE.email}</span>
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-inter text-[1rem] text-[#F5F1EB] hover:text-[#C9A84C] transition-colors duration-300"
              >
                <Instagram size={16} />
                <span>{SITE.instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <span aria-hidden="true" className="hairline" />
      <div
        className="w-full text-center"
        style={{
          padding: '1rem 0',
        }}
      >
        <p className="font-inter text-[0.75rem] text-[#8A94A6] tracking-[0.02em]">
          {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
