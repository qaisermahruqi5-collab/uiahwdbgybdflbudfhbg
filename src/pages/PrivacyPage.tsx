import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, MessageCircle, Send, ShieldCheck, Baby, Timer, Mail } from 'lucide-react';
import { SITE } from '@/config/site';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';

gsap.registerPlugin(ScrollTrigger);

interface PrivacySection {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

export default function PrivacyPage() {
  const { t } = useLanguage();

  usePageTitle(t('page.privacy'), t('meta.privacyDesc'));

  const containerRef = useRef<HTMLDivElement>(null);

  const sections: PrivacySection[] = [
    {
      icon: ClipboardList,
      title: t('privacy.collectTitle'),
      body: t('privacy.collectBody'),
    },
    {
      icon: MessageCircle,
      title: t('privacy.whyTitle'),
      body: t('privacy.whyBody'),
    },
    {
      icon: Send,
      title: t('privacy.whereTitle'),
      body: t('privacy.whereBody'),
    },
    {
      icon: ShieldCheck,
      title: t('privacy.neverTitle'),
      body: t('privacy.neverBody', { site: SITE.name }),
    },
    {
      icon: Baby,
      title: t('privacy.childrenTitle'),
      body: t('privacy.childrenBody'),
    },
    {
      icon: Timer,
      title: t('privacy.retentionTitle'),
      body: t('privacy.retentionBody'),
    },
    {
      icon: Mail,
      title: t('privacy.contactTitle'),
      body: (
        <>
          {t('privacy.contactBefore')}{' '}
          <a
            href={`mailto:${SITE.email}`}
            className="text-[#C9A84C] underline underline-offset-4 decoration-[rgba(201,168,76,0.4)] transition-colors duration-300 hover:text-[#E0C878]"
          >
            {SITE.email}
          </a>{' '}
          {t('privacy.contactAfter')}
        </>
      ),
    },
  ];

  /* GSAP Animations — scroll-triggered reveals, footer never touched */
  useGSAP(() => {
    if (!containerRef.current) return;

    const groups = gsap.utils.toArray<HTMLElement>('.reveal-group');
    groups.forEach(group => {
      const els = group.querySelectorAll('.reveal');
      if (!els.length) return;
      gsap.fromTo(els,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 80%',
            once: true,
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pt-24">
      {/* Section Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ PRIVACY SECTION ═══════════════════ */}
      <section
        id="privacy-section"
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
          <div className="reveal-group text-start mb-14">
            <div className="reveal section-index">06</div>
            <p className="reveal font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
              {t('privacy.overline')}
            </p>
            <h1
              className="reveal font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '0.03em',
              }}
            >
              {t('privacy.title')}
            </h1>
            {/* Intro */}
            <p
              className="reveal font-inter text-[1rem] leading-[1.7] max-w-[540px] mt-4"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('privacy.intro', { site: SITE.name })}
            </p>
          </div>

          {/* Sections — .reveal wrapper animates, .card-panel stays hover-liftable */}
          <div className="reveal-group max-w-[820px] mx-auto flex flex-col gap-6">
            {sections.map(section => (
              <div key={section.title} className="reveal">
                <div className="card-panel corner-ticks p-7 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <section.icon size={20} className="shrink-0 text-[#C9A84C]" aria-hidden="true" />
                    <h2 className="font-bebas uppercase text-[#E0C878] text-[1.5rem] leading-none tracking-[0.03em]">
                      {section.title}
                    </h2>
                  </div>
                  <p className="font-inter text-[0.9375rem] leading-[1.75] text-[#8A94A6]">
                    {section.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
