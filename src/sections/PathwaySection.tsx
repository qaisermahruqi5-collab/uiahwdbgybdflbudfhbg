// ═══════════════════════════════════════════════════════════════════
// PATHWAY — five numbered stages, 01 to 05, read as one progression.
//
// Mobile: a vertical timeline, each stage on the line.
// Desktop: a stepped horizontal row, staggered so the eye travels left
// to right (and right to left in Arabic — the connector is a logical
// border, so it mirrors with `dir` for free).
//
// DELIBERATELY ENDS HERE. Coaches is a separate section with its own
// heading and its own #coaches anchor — nothing about staff belongs
// inside or immediately under the pathway, because the pathway is the
// PLAYER's journey.
// ═══════════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Info } from 'lucide-react';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export default function PathwaySection({ index = '02' }: { index?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const content = useContent();

  useGSAP(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els || els.length === 0) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'expo.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="pathway"
      /* Clears the sticky header when the section is deep-linked. */
      className="scroll-anchor"
      style={{
        backgroundColor: 'rgba(6, 15, 37, 0.5)',
        padding: 'clamp(4rem, 10vw, 8rem) 0',
      }}
    >
      <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div className="reveal mb-14">
          <SectionHeader
            index={index}
            overline={t('pathway.overline')}
            title={t('pathway.title')}
            ghost="PATH"
          />
          <p
            className="mt-5 max-w-[640px] font-inter text-[1rem] leading-[1.7]"
            style={{ color: 'rgba(245, 241, 235, 0.75)' }}
          >
            {t('pathway.intro')}
          </p>
        </div>

        {/* Stages. One list, restyled at `lg` — the markup is shared, so
            the two layouts cannot say different things. */}
        <ol className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-4">
          {content.pathwayStages.map((stage, i) => (
            <li
              key={stage.index}
              className="reveal pathway-step relative flex gap-5 pb-8 last:pb-0 lg:flex-1 lg:flex-col lg:gap-0 lg:pb-0"
              /* Desktop stagger: .pathway-card reads --step in index.css, so
                 each card sits a little lower than the last and the row reads
                 as a progression. Ignored below `lg`. */
              style={{ ['--step' as string]: String(i) }}
            >
              {/* Mobile: the timeline rail + node */}
              <div className="flex flex-col items-center lg:hidden" aria-hidden="true">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.55)] bg-[rgba(11,27,61,0.6)] font-bebas text-[1.125rem] leading-none tracking-[0.04em] text-[#C9A84C]">
                  {stage.index}
                </span>
                {i < content.pathwayStages.length - 1 && (
                  <span className="mt-2 w-[1px] flex-1 bg-[rgba(201,168,76,0.25)]" />
                )}
              </div>

              {/* Desktop: the number above the card, on a hairline rail */}
              <div className="hidden lg:block" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <span className="font-bebas text-[1.5rem] leading-none tracking-[0.04em] text-[#C9A84C]">
                    {stage.index}
                  </span>
                  <span className="hairline flex-1" />
                </div>
              </div>

              <div className="card-panel pathway-card flex-1 p-5 lg:mt-4 lg:p-6">
                <h3 className="font-bebas text-[1.5rem] uppercase leading-tight tracking-[0.02em] text-[#F5F1EB]">
                  {stage.title}
                </h3>
                <span className="hairline my-3 block w-10" aria-hidden="true" />
                <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                  {stage.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* The honest qualifier. Understated on purpose — Italy is an
            opportunity for some players, not a promise to all of them. */}
        <div className="reveal mt-10 flex items-start gap-3">
          <Info size={18} className="mt-[2px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
          <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
            {content.pathwayNote}
          </p>
        </div>
      </div>
    </section>
  );
}
