// ═══════════════════════════════════════════════════════════════════
// CALENDAR & TRAINING SCHEDULE — two views of the same data: the
// training week, and the season.
//
// It used to carry a third view — a per-age-group table of days, times
// and durations — which now lives inside each age group's block on the
// Programs page. The weekly grid below already states every age
// group's time, so repeating it in a table was the same duplication
// the Programs rebuild exists to remove.
//
// All figures come from useContent(), which reads content/schedule.json
// — so Studio and the Telegram bot update this page too.
// ═══════════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { Clock, Info } from 'lucide-react';
import { registerLink } from '@/lib/registerLink';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import Breadcrumbs from '@/components/Breadcrumbs';
import RegisterCta from '@/components/RegisterCta';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export default function CalendarPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const content = useContent();

  usePageTitle(t('page.calendar'), t('meta.calendarDesc'));

  /* Every group trains on the same days — the grid repeats the same column
     of age-group slots under each. The day names come from
     content/schedule.json, so changing training days is a content edit. */
  const trainingDays = content.trainingDays;

  useGSAP(() => {
    if (!containerRef.current) return;
    const groups = gsap.utils.toArray<HTMLElement>('.reveal-group');
    groups.forEach(group => {
      const els = group.querySelectorAll('.reveal');
      if (!els.length) return;
      gsap.fromTo(
        els,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'expo.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pt-24">
      <div
        className="mx-auto max-w-[1280px]"
        style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem) 0' }}
      >
        <Breadcrumbs trail={[{ label: t('nav.calendar') }]} />
      </div>

      <div
        className="mt-6 h-[1px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        }}
      />

      {/* ═══════════════════ WEEKLY GRID ═══════════════════ */}
      <section
        id="schedule"
        className="scroll-anchor"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          {/* Page header — keeps the h1 */}
          <div className="reveal-group relative isolate mb-14 text-start">
            <span
              aria-hidden="true"
              className="text-ghost absolute start-0 z-0 select-none whitespace-nowrap font-bebas uppercase leading-none"
              style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', bottom: '-0.25em' }}
            >
              WEEK
            </span>
            <div className="relative z-[1]">
              <div className="reveal section-index">01</div>
              <p className="reveal mt-3 font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">
                {t('calendar.overline')}
              </p>
              <h1
                className="reveal mt-2 font-bebas uppercase leading-[0.95] text-[#F5F1EB]"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
              >
                {t('calendar.title')}
              </h1>
              <p
                className="reveal mt-4 max-w-[620px] font-inter text-[1rem] leading-[1.7]"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('calendar.intro')}
              </p>
            </div>
          </div>

          {/* Day columns — one card per training day, age-group slots inside */}
          <div className="reveal-group grid grid-cols-1 gap-6 md:grid-cols-3">
            {trainingDays.map(day => (
              <div key={day} className="reveal">
                <div className="card-panel corner-ticks flex h-full flex-col overflow-hidden p-0">
                  {/* Day header band */}
                  <div
                    className="px-6 py-4"
                    style={{
                      backgroundColor: 'rgba(122, 10, 18, 0.35)',
                      borderBottom: '1px solid rgba(201,168,76,0.28)',
                    }}
                  >
                    <h2 className="font-bebas text-[1.5rem] uppercase leading-none tracking-[0.08em] text-[#E0C878]">
                      {day}
                    </h2>
                  </div>

                  {/* Slots — time and duration, the two facts that matter */}
                  <ul className="flex flex-col">
                    {content.programs.map((program, i) => (
                      <li
                        key={program.id}
                        className="flex items-baseline gap-4 px-6 py-4"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
                      >
                        <span className="w-12 shrink-0 font-bebas text-[1.5rem] leading-none tracking-[0.04em] text-[#C9A84C]">
                          {program.name}
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-2 font-inter text-[0.875rem] text-[#F5F1EB]">
                            <Clock size={13} className="text-[#8A94A6]" aria-hidden="true" />
                            {program.time}
                          </span>
                          <span className="font-inter text-[0.75rem] text-[#8A94A6]">
                            {program.duration}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="reveal-group mt-6 font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
            {content.scheduleNote}
          </p>
        </div>
      </section>

      <div
        className="h-[1px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        }}
      />

      {/* ═══════════════════ SEASON CALENDAR ═══════════════════ */}
      <section id="terms" className="scroll-anchor" style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}>
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group mb-10">
            <div className="reveal">
              <SectionHeader
                index="02"
                overline={t('calendar.seasonOverline')}
                title={t('calendar.seasonTitle')}
                ghost="33"
              />
            </div>
            <p
              className="reveal mt-5 max-w-[560px] font-inter text-[1rem] leading-[1.7]"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('calendar.seasonIntro')}
            </p>
          </div>

          {/* Each term card carries its DATES — the thing the review said
              was never stated anywhere. */}
          <div className="reveal-group grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.terms.map(term => {
              const isTotal = term.id === 'total';
              return (
                <div key={term.id} className="reveal">
                  <div
                    className="card-panel corner-ticks flex h-full flex-col gap-2 p-6"
                    style={
                      isTotal
                        ? {
                            backgroundColor: 'rgba(122, 10, 18, 0.35)',
                            borderColor: 'rgba(201, 168, 76, 0.4)',
                          }
                        : undefined
                    }
                  >
                    <span className="font-inter text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
                      {term.term}
                    </span>
                    <span className="font-bebas text-[2rem] leading-none tracking-[0.02em] text-[#F5F1EB]">
                      {term.duration}
                    </span>
                    <span className="hairline my-1 block w-8" aria-hidden="true" />
                    <span className="font-inter text-[0.8125rem] leading-[1.6] text-[#F5F1EB]">
                      {term.dates}
                    </span>
                    {term.note && (
                      <span className="font-inter text-[0.75rem] leading-[1.5] text-[#8A94A6]">
                        {term.note}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="reveal-group mt-8">
            <div className="reveal">
              <div className="flex items-start gap-3">
                <Info size={18} className="mt-[2px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
                <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                  {content.termExplainer} {t('calendar.note')}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={registerLink()}
                  className="btn-primary w-full px-8 py-3 text-[0.8125rem] sm:w-auto"
                >
                  {t('calendar.ctaButton')}
                </Link>
                <Link
                  to="/programs#pricing"
                  className="btn-outline w-full px-8 py-3 text-[0.8125rem] sm:w-auto"
                >
                  {t('calendar.viewFees')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RegisterCta />
    </div>
  );
}
