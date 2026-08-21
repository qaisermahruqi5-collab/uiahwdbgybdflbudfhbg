import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import RegistrationForm from '../components/RegistrationForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function RegistrationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { t, dir } = useLanguage();

  usePageTitle(t('page.join'), t('meta.joinDesc'));

  /* GSAP Animations */
  useGSAP(() => {
    if (!containerRef.current) return;

    /* Form section - scroll triggered */
    if (formRef.current) {
      const formHeaderEls = formRef.current.querySelectorAll('.form-header-animate');
      gsap.fromTo(formHeaderEls,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      gsap.fromTo('.form-card-wrapper',
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out', delay: 0.2,
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pt-24">
      {/* Back Button */}
      <div className="max-w-[1280px] mx-auto" style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem) 0' }}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-inter text-[0.875rem] font-medium uppercase tracking-[0.04em] text-[#C9A84C] transition-all duration-300 hover:opacity-80"
        >
          <span aria-hidden="true">{dir === 'rtl' ? '→' : '←'}</span>
          <span>{t('register.backHome')}</span>
        </Link>
      </div>

      {/* Section Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ FORM SECTION ═══════════════════ */}
      <section
        ref={formRef}
        id="form-section"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* Section Header — editorial: index + overline + single h1 */}
          <div className="text-start mb-12">
            <div className="form-header-animate section-index">05</div>
            <p className="form-header-animate font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
              {t('register.overline')}
            </p>
            <h1
              className="form-header-animate font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '0.03em',
              }}
            >
              {t('register.title')}
            </h1>
            {/* Subtitle */}
            <p
              className="form-header-animate font-inter text-[1rem] leading-[1.6] max-w-[520px] mt-4"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('register.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="form-card-wrapper">
            <RegistrationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
