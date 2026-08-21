import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function CtaBandSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els || els.length === 0) return;
    gsap.fromTo(els,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'expo.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    /* Full-width red pinstripe band with diagonal slash edges */
    <section
      ref={sectionRef}
      className="pinstripe slash-top slash-bottom"
      style={{
        background: 'linear-gradient(135deg, #7A0A12 0%, #5A0810 55%, #0B1B3D 130%)',
        padding: 'clamp(6rem, 14vw, 10rem) 0',
      }}
    >
      <div
        className="relative max-w-[1280px] mx-auto text-center"
        style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
      >
        {/* Ghost word behind the band content */}
        <span
          aria-hidden="true"
          className="text-ghost font-bebas uppercase select-none whitespace-nowrap leading-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ fontSize: 'clamp(8rem, 24vw, 18rem)' }}
        >
          JOIN
        </span>

        <div className="reveal relative">
          <h2
            className="font-bebas uppercase text-[#F5F1EB] leading-[0.95] mb-4"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              letterSpacing: '0.03em',
            }}
          >
            {t('cta.title')}
          </h2>
          <p
            className="font-inter text-[1.0625rem] leading-[1.6] max-w-[520px] mx-auto mb-8"
            style={{ color: 'rgba(245, 241, 235, 0.8)' }}
          >
            {t('cta.text')}
          </p>
          <Link to="/join" className="btn-primary">
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
