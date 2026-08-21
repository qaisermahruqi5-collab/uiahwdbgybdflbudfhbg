import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export default function CoachesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const content = useContent();

  useGSAP(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els || els.length === 0) return;
    gsap.fromTo(els,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
    >
      <div
        className="max-w-[1280px] mx-auto"
        style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
      >
        {/* Section Header — Stadium Editorial: index 02, ghost STAFF */}
        <div className="reveal mb-14">
          <SectionHeader
            index="02"
            overline={t('coaches.overline')}
            title={t('coaches.title')}
            ghost="STAFF"
          />
        </div>

        {/* Coach Cards — .reveal on the wrapper so GSAP never transforms
            a .card-panel directly (would kill the hover lift) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[880px] mx-auto">
          {content.coaches.map((coach, index) => (
            <div key={`${coach.role}-${index}`} className="reveal">
              <div className="card-panel corner-ticks flex flex-col items-center text-center gap-4 p-8 h-full">
                {/* Square gold-outline monogram (2px radius, Bebas letters) */}
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-[2px] border border-[rgba(201,168,76,0.55)] font-bebas text-[1.5rem] tracking-[0.04em] text-[#C9A84C]"
                  aria-hidden="true"
                >
                  {coach.initials}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bebas text-[1.5rem] uppercase tracking-[0.02em] text-[#F5F1EB] leading-tight">
                    {coach.name}
                  </h3>
                  <span className="font-inter text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
                    {coach.role}
                  </span>
                </div>
                <span className="hairline w-10" aria-hidden="true" />
                <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                  {coach.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
