import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ShieldCheck, Trophy, Users, HeartHandshake, type LucideIcon } from 'lucide-react';
import { type Feature } from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<Feature['icon'], LucideIcon> = {
  ShieldCheck,
  Trophy,
  Users,
  HeartHandshake,
};

export default function WhyUsSection() {
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
    <section
      ref={sectionRef}
      style={{
        backgroundColor: 'rgba(6, 15, 37, 0.5)',
        padding: 'clamp(4rem, 10vw, 8rem) 0',
      }}
    >
      <div
        className="max-w-[1280px] mx-auto"
        style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
      >
        {/* Section Header */}
        <div className="reveal mb-12">
          <SectionHeader
            index="01"
            overline={t('why.overline')}
            title={t('why.title')}
            ghost="1893"
          />
        </div>

        {/* Feature Cards — .reveal lives on the wrapper so the .card-panel
            hover lift is never overridden by a GSAP inline transform */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <div key={feature.title} className="reveal">
                <div className="card-panel corner-ticks h-full flex flex-col items-start text-start gap-4 p-8">
                  <div className="flex w-full items-center justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="font-bebas leading-none text-[#C9A84C]"
                      style={{ fontSize: '2rem' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Icon size={22} className="text-[#C9A84C]" aria-hidden="true" />
                  </div>
                  <h3 className="font-bebas text-[1.375rem] uppercase tracking-[0.02em] text-[#F5F1EB] leading-tight">
                    {feature.title}
                  </h3>
                  <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                    {feature.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
