import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';

export default function NotFoundPage() {
  const { t } = useLanguage();

  usePageTitle(t('page.notFound'), t('meta.notFoundDesc'));

  const containerRef = useRef<HTMLDivElement>(null);

  /* GSAP entrance — content is viewport-centered, so no ScrollTrigger needed */
  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.fromTo('.reveal',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'expo.out', delay: 0.15 }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(6, 15, 37, 0.5)' }}
    >
      <div
        className="text-center"
        style={{ padding: 'clamp(6rem, 12vw, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 8vw, 6rem)' }}
      >
        {/* Giant ghost 404 behind solid gold 404 */}
        <div className="reveal relative">
          <span
            aria-hidden="true"
            className="text-ghost font-bebas uppercase leading-[0.85] select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              fontSize: 'clamp(10rem, 30vw, 22rem)',
              letterSpacing: '0.02em',
            }}
          >
            404
          </span>
          <div
            className="relative font-bebas uppercase leading-[0.85] text-[#C9A84C]"
            style={{
              fontSize: 'clamp(6rem, 20vw, 14rem)',
              letterSpacing: '0.02em',
            }}
          >
            404
          </div>
        </div>

        {/* Heading */}
        <h1
          className="reveal font-bebas uppercase text-[#FFFFFF] leading-none mt-2"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            letterSpacing: '0.03em',
          }}
        >
          {t('notFound.title')}
        </h1>

        {/* Decorative Line */}
        <div className="reveal w-[60px] h-[2px] bg-[#C9A84C] mx-auto my-5" />

        {/* Friendly Line */}
        <p
          className="reveal font-inter text-[1rem] leading-[1.7] max-w-[420px] mx-auto mb-10"
          style={{ color: 'rgba(245, 241, 235, 0.75)' }}
        >
          {t('notFound.text')}
        </p>

        {/* Back Home */}
        <Link
          to="/"
          className="reveal btn-primary px-10 py-4 text-[1rem]"
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}
