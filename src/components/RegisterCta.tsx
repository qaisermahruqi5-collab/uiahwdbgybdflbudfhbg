// ═══════════════════════════════════════════════════════════════════
// REGISTER CTA — the band that closes every page.
//
// Part of the "never more than two clicks from registering" rule: the
// sticky header covers the top of the page, this covers the bottom, so
// a parent who has just finished reading does not have to scroll back
// up to act.
// ═══════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/config/site';
import { registerLink } from '@/lib/registerLink';
import { useLanguage } from '@/i18n/useLanguage';

export default function RegisterCta({
  /** Override the heading where a page wants its own words. */
  title,
  text,
}: {
  title?: string;
  text?: string;
} = {}) {
  const { t } = useLanguage();

  return (
    <section
      id="register-cta"
      style={{
        backgroundColor: 'rgba(6, 15, 37, 0.5)',
        padding: 'clamp(3rem, 8vw, 6rem) 0',
      }}
    >
      <div
        className="mx-auto max-w-[1280px]"
        style={{ padding: '0 clamp(1rem, 5vw, 4rem)' }}
      >
        <div
          className="pinstripe rounded-[2px] px-6 py-10 text-center sm:px-8 md:py-14"
          style={{
            backgroundColor: 'rgba(122, 10, 18, 0.35)',
            border: '1px solid rgba(201, 168, 76, 0.22)',
          }}
        >
          <h2
            className="font-bebas uppercase leading-none text-[#FFFFFF]"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)', letterSpacing: '0.03em' }}
          >
            {title ?? t('cta.title')}
          </h2>
          <p
            className="mx-auto mt-3 max-w-[480px] font-inter text-[1rem] leading-[1.7]"
            style={{ color: 'rgba(245, 241, 235, 0.75)' }}
          >
            {text ?? t('cta.text')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to={registerLink()} className="btn-primary w-full px-10 py-4 text-[0.875rem] sm:w-auto">
              {t('cta.button')}
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-[0.8125rem] sm:w-auto"
            >
              <MessageCircle size={16} aria-hidden="true" />
              {t('cta.whatsapp')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
