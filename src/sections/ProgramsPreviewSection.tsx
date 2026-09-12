import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { formatOMR } from '@/data/pricing';
import { registerLink } from '@/lib/registerLink';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export default function ProgramsPreviewSection() {
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
      style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
    >
      <div
        className="max-w-[1280px] mx-auto"
        style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
      >
        {/* Section Header */}
        <div className="reveal mb-12">
          <SectionHeader
            index="02"
            overline={t('programsPreview.overline')}
            title={t('programsPreview.title')}
          />
        </div>

        {/* Program Cards — .reveal lives on the wrapper so the .card-panel
            hover lift is never overridden by a GSAP inline transform */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.programs.map((program) => {
            const band = content.priceBands.find(b => b.id === program.priceBand);
            return (
              <div key={program.id} className="reveal">
                {/* The whole card links to this age group's block on the
                    Programs page, so a tap from the homepage lands on the
                    fees and the Register button for THAT squad. */}
                <Link
                  to={`/programs#${program.id}`}
                  className="card-panel relative h-full flex flex-col gap-4 p-8 pt-12"
                >
                  {/* Ages corner tab */}
                  <span
                    className="absolute top-0 end-0 inline-flex items-center px-3 py-[0.375rem] rounded-[2px] font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#060F25] bg-[#C9A84C]"
                  >
                    {program.ages}
                  </span>
                  <h3 className="font-bebas text-[2rem] uppercase tracking-[0.04em] text-[#F5F1EB] leading-none">
                    {program.name}
                  </h3>
                  <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                    {program.description}
                  </p>

                  {/* Time and duration — the two facts a parent scans for */}
                  <div className="flex flex-col gap-1">
                    <span className="font-inter text-[0.8125rem] text-[#F5F1EB]">
                      {program.time}
                    </span>
                    <span className="font-inter text-[0.75rem] text-[#8A94A6]">
                      {program.days} · {program.duration}
                    </span>
                  </div>

                  {/* Fee summary — the cheapest entry point for this band
                      (Term 1, two training days a week), formatted from the
                      shared pricing data. The footnote below says which
                      rate it is, so it cannot be mistaken for the total. */}
                  {band && band.rows.length > 0 && (
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <span className="hairline" aria-hidden="true" />
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">
                          {t('programsPreview.feesFrom')}
                        </span>
                        <span className="whitespace-nowrap font-inter text-[0.9375rem] font-semibold text-[#E0C878]">
                          {formatOMR(band.rows[0].term1.upfront)}
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footnote — makes clear which of the two rates the card price is */}
        <p className="reveal mt-6 text-center font-inter text-[0.75rem] leading-[1.6] text-[#8A94A6]">
          {t('programsPreview.feesNote')}
        </p>

        {/* View All Link */}
        <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/programs#pricing" className="btn-outline">
            {t('programsPreview.viewAll')}
          </Link>
          <Link to={registerLink()} className="btn-primary">
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
