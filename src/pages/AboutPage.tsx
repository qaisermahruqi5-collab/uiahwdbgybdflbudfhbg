import { Fragment, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import CoachesSection from '@/sections/CoachesSection';
import GallerySection from '@/sections/GallerySection';
import PathwaySection from '@/sections/PathwaySection';
import LocationSection from '@/sections/LocationSection';
import Breadcrumbs from '@/components/Breadcrumbs';
import RegisterCta from '@/components/RegisterCta';
import SectionHeader from '@/components/design/SectionHeader';
import Stat from '@/components/design/Stat';
import { registerLink } from '@/lib/registerLink';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const closingRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const content = useContent();

  usePageTitle(t('page.about'), t('meta.aboutDesc'));

  /* GSAP Animations */
  useGSAP(() => {
    if (!containerRef.current) return;

    /* About section - scroll triggered */
    if (aboutRef.current) {
      const aboutEls = aboutRef.current.querySelectorAll('.about-animate');
      gsap.fromTo(aboutEls,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'expo.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }

    /* Closing CTA + Instagram - scroll triggered */
    if (closingRef.current) {
      const closingEls = closingRef.current.querySelectorAll('.closing-animate');
      gsap.fromTo(closingEls,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: {
            trigger: closingRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }
  }, { scope: containerRef });

  return (
    /* pt-24 clears the fixed navbar — it must live here, not on the section
       below, whose inline `padding` shorthand would override a padding class. */
    <div ref={containerRef} className="pt-24">
      <div
        className="mx-auto max-w-[1280px]"
        style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem) 0' }}
      >
        <Breadcrumbs trail={[{ label: t('nav.about') }]} />
      </div>

      {/* Section Divider */}
      <div className="w-full h-[1px] mt-6" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section
        ref={aboutRef}
        id="about-section"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* Section Header — Stadium Editorial: index 01, ghost 1893 */}
          <div className="about-animate mb-14">
            <SectionHeader
              as="h1"
              index="01"
              overline={t('about.overline')}
              title={content.aboutTitle}
              ghost="1893"
            />
          </div>

          {/* Prose Block — paragraph 1 gets a gold Bebas drop-cap */}
          <div className="about-animate max-w-[720px] mx-auto flex flex-col gap-5">
            {content.aboutParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className="font-inter text-[1.0625rem] leading-[1.8]"
                style={{ color: 'rgba(245, 241, 235, 0.85)' }}
              >
                {i === 0 ? (
                  <>
                    <span
                      className="float-start me-4 mt-[0.3rem] flex items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.35)] bg-[rgba(11,27,61,0.6)] font-bebas leading-[0.85] text-[#C9A84C] select-none"
                      style={{ fontSize: '3.25rem', padding: '0.45rem 0.85rem' }}
                    >
                      {paragraph.charAt(0)}
                    </span>
                    {paragraph.slice(1)}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>

          {/* Stats — hairline row of <Stat> columns */}
          <div className="about-animate flex flex-wrap items-center justify-center gap-x-8 gap-y-6 mt-12">
            {content.aboutStats.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && (
                  <span className="hairline w-px h-10 hidden sm:block" aria-hidden="true" />
                )}
                <Stat value={stat.value} label={stat.label} />
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PATHWAY (#pathway) ═══════════════════
          Ends cleanly. The next section is the gallery, NOT the
          coaches — the pathway is the player's journey, and putting
          staff under it was the thing the brief called out. */}
      <PathwaySection index="02" />

      {/* ═══════════════════ GALLERY (photos + videos) ═══════════════════ */}
      <GallerySection index="03" />

      {/* ═══════════════════ COACHES (#coaches) ═══════════════════
          Its own section, its own heading, its own anchor — the nav
          item points straight here. */}
      <CoachesSection index="04" />

      {/* ═══════════════════ LOCATION (#location) ═══════════════════ */}
      <LocationSection index="05" />

      {/* ═══════════════════ CLOSING CTA + INSTAGRAM ═══════════════════ */}
      <section
        ref={closingRef}
        style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* CTA Button */}
          <div className="closing-animate flex justify-center">
            <Link to={registerLink()} className="btn-primary px-10 py-4 text-[0.875rem]">
              {t('about.joinCta')}
            </Link>
          </div>

          {/* Instagram Link — sharp ticked panel */}
          <div className="closing-animate flex justify-center mt-10">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group card-panel corner-ticks flex items-center gap-4 px-8 py-5"
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-[2px] border border-[rgba(201,168,76,0.5)] transition-colors duration-300 group-hover:border-[#E0C878]"
              >
                <Instagram size={22} className="text-[#C9A84C] transition-colors duration-300 group-hover:text-[#E0C878]" />
              </div>
              <div className="flex flex-col">
                <span className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#C9A84C]">
                  {t('about.followUs')}
                </span>
                <span className="font-inter text-[1rem] font-medium text-white transition-colors group-hover:text-[#C9A84C]">
                  {SITE.instagramHandle}
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Register is reachable from the bottom of every page, not just the header. */}
      <RegisterCta />
    </div>
  );
}
