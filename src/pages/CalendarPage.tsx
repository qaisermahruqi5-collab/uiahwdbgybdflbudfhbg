// ═══════════════════════════════════════════════════════════════════
// CALENDAR & TRAINING SCHEDULE — one tab, three views of the same
// data: the weekly grid, the full per-age-group table, and the
// season (term) calendar. All figures come from useContent().
// ═══════════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { Info, Snowflake, Sun } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const thClass =
  'px-4 py-3 text-start font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C] whitespace-nowrap';
const tdClass = 'px-4 py-4 font-inter text-[0.875rem] text-[#F5F1EB] whitespace-nowrap';

export default function CalendarPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const content = useContent();

  usePageTitle(t('page.calendar'), t('meta.calendarDesc'));

  /* Every group trains on the same three days — the grid repeats the
     same column of age-group slots under each training day. */
  const trainingDays = [t('calendar.mon'), t('calendar.wed'), t('calendar.thu')];

  useGSAP(() => {
    if (!containerRef.current) return;
    const groups = gsap.utils.toArray<HTMLElement>('.reveal-group');
    groups.forEach(group => {
      const els = group.querySelectorAll('.reveal');
      if (!els.length) return;
      gsap.fromTo(els,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pt-24">
      {/* Section Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ WEEKLY GRID ═══════════════════ */}
      <section
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* Page header — keeps the h1 */}
          <div className="reveal-group relative isolate text-start mb-14">
            <span
              aria-hidden="true"
              className="text-ghost font-bebas uppercase select-none whitespace-nowrap leading-none absolute start-0 z-0"
              style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', bottom: '-0.25em' }}
            >
              WEEK
            </span>
            <div className="relative z-[1]">
              <div className="reveal section-index">01</div>
              <p className="reveal font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
                {t('calendar.overline')}
              </p>
              <h1
                className="reveal font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
              >
                {t('calendar.title')}
              </h1>
              <p
                className="reveal font-inter text-[1rem] leading-[1.7] max-w-[620px] mt-4"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('calendar.intro')}
              </p>
            </div>
          </div>

          {/* Day columns — one card per training day, age-group slots inside */}
          <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainingDays.map(day => (
              <div key={day} className="reveal">
                <div className="card-panel corner-ticks h-full flex flex-col p-0 overflow-hidden">
                  {/* Day header band */}
                  <div
                    className="px-6 py-4"
                    style={{
                      backgroundColor: 'rgba(122, 10, 18, 0.35)',
                      borderBottom: '1px solid rgba(201,168,76,0.28)',
                    }}
                  >
                    <h3 className="font-bebas uppercase text-[#E0C878] text-[1.5rem] tracking-[0.08em] leading-none">
                      {day}
                    </h3>
                  </div>

                  {/* Slots */}
                  <div className="flex flex-col">
                    {content.programs.map((program, i) => (
                      <div
                        key={program.id}
                        className="flex items-start gap-4 px-6 py-4"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
                      >
                        <span className="font-bebas text-[1.5rem] leading-none tracking-[0.04em] text-[#C9A84C] w-12 shrink-0">
                          {program.name}
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 font-inter text-[0.8125rem] text-[#F5F1EB]">
                            <Snowflake size={13} className="text-[#8A94A6]" aria-hidden="true" />
                            {program.winterTime}
                          </span>
                          <span className="flex items-center gap-2 font-inter text-[0.8125rem] text-[#F5F1EB]">
                            <Sun size={13} className="text-[#8A94A6]" aria-hidden="true" />
                            {program.summerTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Winter / summer legend */}
          <div className="reveal-group mt-6">
            <div className="reveal flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="flex items-center gap-2 font-inter text-[0.8125rem] text-[#8A94A6]">
                <Snowflake size={14} className="text-[#C9A84C]" aria-hidden="true" />
                {t('calendar.winterLabel')}
              </span>
              <span className="flex items-center gap-2 font-inter text-[0.8125rem] text-[#8A94A6]">
                <Sun size={14} className="text-[#C9A84C]" aria-hidden="true" />
                {t('calendar.summerLabel')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ FULL SCHEDULE TABLE ═══════════════════ */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}>
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal-group mb-12">
            <div className="reveal">
              <SectionHeader
                index="02"
                overline={t('calendar.scheduleOverline')}
                title={t('calendar.scheduleTitle')}
                ghost="TIME"
              />
            </div>
          </div>

          <div className="reveal-group">
            <div className="reveal">
              <div className="card-panel corner-ticks overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
                      <th scope="col" className={thClass}>{t('calendar.ageHeader')}</th>
                      <th scope="col" className={thClass}>{t('calendar.daysHeader')}</th>
                      <th scope="col" className={thClass}>{t('calendar.winterHeader')}</th>
                      <th scope="col" className={thClass}>{t('calendar.summerHeader')}</th>
                      <th scope="col" className={thClass}>{t('calendar.durationHeader')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.programs.map((program, i) => (
                      <tr
                        key={program.id}
                        style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
                      >
                        <th
                          scope="row"
                          className={`${tdClass} font-bebas text-[1.5rem] tracking-[0.04em] text-[#C9A84C]`}
                        >
                          {program.name}
                        </th>
                        <td className={tdClass}>{program.days}</td>
                        <td className={tdClass}>{program.winterTime}</td>
                        <td className={tdClass}>{program.summerTime}</td>
                        <td className={tdClass}>{program.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ SEASON CALENDAR ═══════════════════ */}
      <section
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal-group mb-10">
            <div className="reveal">
              <SectionHeader
                index="03"
                overline={t('calendar.seasonOverline')}
                title={t('calendar.seasonTitle')}
                ghost="33"
              />
            </div>
            <p
              className="reveal font-inter text-[1rem] leading-[1.7] max-w-[560px] mt-5"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('calendar.seasonIntro')}
            </p>
          </div>

          <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.terms.map((term, i) => {
              const isTotal = i === content.terms.length - 1;
              return (
                <div key={term.term} className="reveal">
                  <div
                    className="card-panel corner-ticks h-full flex flex-col gap-2 p-7"
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
                    <span className="font-bebas text-[2.25rem] leading-none tracking-[0.02em] text-[#F5F1EB]">
                      {term.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirmation note + CTA */}
          <div className="reveal-group mt-10">
            <div className="reveal">
              <div
                className="pinstripe rounded-[2px] p-7 md:p-8 flex flex-col gap-6"
                style={{
                  backgroundColor: 'rgba(122, 10, 18, 0.35)',
                  border: '1px solid rgba(201, 168, 76, 0.22)',
                  borderInlineStart: '3px solid #C9A84C',
                }}
              >
                <div className="flex items-start gap-4">
                  <Info size={20} className="shrink-0 text-[#C9A84C] mt-[2px]" aria-hidden="true" />
                  <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                    {t('calendar.note')}
                  </p>
                </div>
                <div>
                  <Link to="/join" className="btn-primary px-8 py-3 text-[0.8125rem]">
                    {t('calendar.ctaButton')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
