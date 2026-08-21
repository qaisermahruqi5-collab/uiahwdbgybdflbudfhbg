import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import Marquee from '@/components/design/Marquee';
import Stat from '@/components/design/Stat';
import WhyUsSection from '@/sections/WhyUsSection';
import ProgramsPreviewSection from '@/sections/ProgramsPreviewSection';
import GallerySection from '@/sections/GallerySection';
import CtaBandSection from '@/sections/CtaBandSection';

export default function HeroPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { t, dir } = useLanguage();
  const content = useContent();

  usePageTitle(SITE.name, t('meta.homeDesc'));

  /* GSAP Animations */
  useGSAP(() => {
    if (!containerRef.current) return;

    /* Hero image slides in from its own screen edge (right in LTR, left in RTL) */
    const imageX = dir === 'rtl' ? -60 : 60;

    /* Hero load animation */
    const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
      .fromTo('.hero-headline', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 0.45)
      .fromTo('.hero-subheadline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .fromTo('.hero-chips', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
      .fromTo('.hero-cta', { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.8)
      .fromTo('.hero-image', { opacity: 0, x: imageX }, { opacity: 1, x: 0, duration: 1 }, 0.5)
      .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.2);
  }, { scope: containerRef, dependencies: [dir] });

  return (
    <div ref={containerRef}>
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section
        ref={heroRef}
        id="hero-section"
        /* overflow-x-clip contains the entrance tween: the image slides in
           from x:60, which otherwise flashes a horizontal scrollbar on load.
           `clip` (not `hidden`) leaves vertical scrolling untouched. */
        className="relative min-h-[100dvh] flex items-center overflow-x-clip"
      >
        <div
          className="w-full max-w-[1280px] mx-auto"
          style={{ padding: 'clamp(6rem, 12vw, 8rem) clamp(1rem, 5vw, 4rem) clamp(3rem, 8vw, 6rem)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6 md:gap-12 items-center">
            {/* Left Column - Text */}
            <div className="relative isolate flex flex-col items-center md:items-start text-center md:text-left gap-6 order-2 lg:order-1">
              {/* Ghost word behind the column */}
              <span
                aria-hidden="true"
                className="text-ghost font-bebas uppercase select-none whitespace-nowrap leading-none absolute z-[-1] top-1/2 -translate-y-1/2 start-[-0.05em]"
                style={{ fontSize: 'clamp(6rem, 18vw, 14rem)' }}
              >
                GENOA
              </span>

              {/* Badge */}
              <div
                className="hero-badge inline-flex items-center gap-2 px-4 py-[0.375rem] rounded-[2px] border font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C]"
                style={{
                  backgroundColor: 'rgba(201, 168, 76, 0.08)',
                  borderColor: 'rgba(201, 168, 76, 0.4)',
                }}
              >
                {t('hero.badge')}
              </div>

              {/* Headline */}
              <h1
                className="hero-headline font-bebas uppercase text-[#F5F1EB] leading-[0.95]"
                style={{
                  fontSize: 'clamp(2.5rem, 12vw, 8rem)',
                  letterSpacing: '0.04em',
                  textShadow: '0 4px 40px rgba(0,0,0,0.3)',
                }}
              >
                {t('hero.headline')}
              </h1>

              {/* Subheadline */}
              <p
                className="hero-subheadline font-inter text-[1.25rem] font-normal leading-[1.6] max-w-[520px]"
                style={{ color: 'rgba(245, 241, 235, 0.85)' }}
              >
                {t('hero.subheadline')}
              </p>

              {/* Hairline stat strip (replaces the chips row) */}
              <div className="hero-chips flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4">
                {content.aboutStats.map((stat, i) => (
                  <span key={stat.label} className="flex items-center gap-8">
                    {i > 0 && <span className="hairline w-px h-10" aria-hidden="true" />}
                    <Stat value={stat.value} label={stat.label} />
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hero-cta flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link to="/join" className="btn-primary">
                  {t('hero.apply')}
                </Link>
                <Link to="/programs" className="btn-outline">
                  {t('hero.explore')}
                </Link>
              </div>

              {/* Scroll Indicator — squared */}
              <div className="hero-scroll hidden md:flex flex-col items-center gap-2 mt-8">
                <div className="relative w-[1px] h-10 bg-[rgba(201,168,76,0.3)]">
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-[2px] bg-[#C9A84C]"
                    style={{ animation: 'scroll-dot 2s ease-in-out infinite' }}
                  />
                </div>
                <span className="font-inter text-[0.75rem] text-[#C9A84C] uppercase tracking-[0.15em]">
                  {t('hero.scroll')}
                </span>
              </div>
            </div>

            {/* Right Column - Player Image (sharp frame) */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="hero-image relative">
                {/* Red slash accent block behind, offset to the trailing edge */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6"
                  style={{
                    backgroundColor: '#7A0A12',
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 3rem), calc(100% - 3rem) 100%, 0 100%)',
                  }}
                />
                {/* Frame: one diagonal-clipped corner */}
                <div
                  className="relative"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 3rem), calc(100% - 3rem) 100%, 0 100%)' }}
                >
                  {/* 3px gold edge bar on the leading side */}
                  <div aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] z-[2] bg-[#C9A84C]" />
                  <picture>
                    <source srcSet="/player.webp" type="image/webp" />
                    <img
                      src="/player.jpg"
                      alt={t('hero.playerAlt')}
                      width={638}
                      height={834}
                      fetchPriority="high"
                      className="w-auto max-h-[35vh] sm:max-h-[45vh] lg:max-h-[80vh] object-cover object-top"
                    />
                  </picture>
                  {/* Inner-edge gradient overlay (mirrors with text direction) */}
                  <div
                    className="absolute inset-y-0 start-0 w-[30%] pointer-events-none"
                    style={{ background: `linear-gradient(to ${dir === 'rtl' ? 'left' : 'right'}, rgba(90, 8, 16, 0.6) 0%, transparent 100%)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academy claims ticker (replaces the gold gradient divider) */}
      <Marquee items={[...content.heroChips, content.features[1].title]} />

      {/* ═══════════════════ HOME SECTIONS ═══════════════════ */}
      <WhyUsSection />
      <ProgramsPreviewSection />
      <GallerySection index="03" />
      <CtaBandSection />
    </div>
  );
}
