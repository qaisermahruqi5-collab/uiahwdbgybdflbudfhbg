// ═══════════════════════════════════════════════════════════════════
// PROGRAMS & FEES — rebuilt after the stakeholder review.
//
// WHAT CHANGED, AND WHY
//
//  • THE DUPLICATE FORMAT IS GONE. The page used to show every age
//    group twice: cards at the top, then a table lower down. Two
//    formats saying the same thing is what made it confusing. There is
//    now ONE format — a self-contained block per age group — and every
//    age group uses it identically.
//
//  • "SESSION" IS SPLIT IN TWO. It used to mean both "how long one
//    training lasts" and "how many times a week". Now: Duration, and
//    Training days per week. Never both under one word again.
//
//  • TERMS HAVE DATES. Every term label carries its week count, its
//    dates and how many monthly instalments it is paid over.
//
//  • PER-TERM AND FULL-SEASON PRICES SIT IN ONE TABLE, side by side,
//    so they can be compared without scrolling. See PricingTable.
//
//  • EVERY BLOCK LEADS INTO REGISTRATION with the age group — and the
//    training days — already selected. See src/lib/registerLink.ts.
//
// Anchors: #schedule, #terms, #pricing, plus #u6 … #u16 per age group.
// ═══════════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Repeat,
  Timer,
} from 'lucide-react';
import type { Program } from '@/data/content';
import { FREQUENCIES } from '@/data/pricing';
import { registerLink } from '@/lib/registerLink';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trainingDaysLabel } from '@/i18n/labels';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import Breadcrumbs from '@/components/Breadcrumbs';
import PricingTable from '@/components/PricingTable';
import RegisterCta from '@/components/RegisterCta';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const thClass =
  'px-4 py-3 text-start font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]';
const tdClass = 'px-4 py-3.5 font-inter text-[0.875rem] text-[#F5F1EB] align-top';

/* ── One age group's schedule facts, in the same shape every time ──
   A definition list rather than a <table>: three label/value pairs are
   not tabular data, and a list stacks cleanly at 360px with no
   horizontal scroll.                                              */
function ScheduleSpec({ program }: { program: Program }) {
  const { t } = useLanguage();

  const rows = [
    { icon: CalendarDays, label: t('programs.daysLabel'), value: program.days, extra: program.frequency },
    { icon: Clock, label: t('programs.timeLabel'), value: program.time },
    { icon: Timer, label: t('programs.durationLabel'), value: program.duration },
  ];

  return (
    <dl className="flex flex-col">
      {rows.map((row, i) => {
        const Icon = row.icon;
        return (
          <div
            key={row.label}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
            style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
          >
            <dt className="flex items-center gap-2 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#8A94A6] sm:w-[9.5rem] sm:shrink-0">
              <Icon size={14} className="shrink-0 text-[#C9A84C]" aria-hidden="true" />
              {row.label}
            </dt>
            <dd className="font-inter text-[0.9375rem] font-medium text-[#F5F1EB]">
              {row.value}
              {row.extra && (
                <span className="ms-2 font-normal text-[0.8125rem] text-[#8A94A6]">
                  ({row.extra})
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default function ProgramsPage() {
  const { t } = useLanguage();
  const content = useContent();
  const containerRef = useRef<HTMLDivElement>(null);

  usePageTitle(t('page.programs'), t('meta.programsDesc'));

  useGSAP(() => {
    if (!containerRef.current) return;
    const groups = gsap.utils.toArray<HTMLElement>('.reveal-group');
    groups.forEach(group => {
      const els = group.querySelectorAll('.reveal');
      if (!els.length) return;
      gsap.fromTo(
        els,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'expo.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        }
      );
    });
  }, { scope: containerRef });

  /* Open items that belong beside the fees, so a parent reads the
     unanswered question where they would have asked it. */
  const feeQuestions = content.openItems.filter(i =>
    ['registration-fee', 'instalment-split'].includes(i.id)
  );

  return (
    <div ref={containerRef} className="pt-24">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-[1280px]"
        style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem) 0' }}
      >
        <Breadcrumbs trail={[{ label: t('nav.programs') }]} />
      </div>

      <section
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(2.5rem, 6vw, 4.5rem) 0 clamp(3rem, 8vw, 5rem)',
        }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group relative isolate mb-0 text-start">
            <span
              aria-hidden="true"
              className="text-ghost absolute start-0 z-0 select-none whitespace-nowrap font-bebas uppercase leading-none"
              style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', bottom: '-0.25em' }}
            >
              TRAIN
            </span>
            <div className="relative z-[1]">
              <div className="reveal section-index">01</div>
              <p className="reveal mt-3 font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">
                {t('programs.overline')}
              </p>
              <h1
                className="reveal mt-2 font-bebas uppercase leading-[0.95] text-[#F5F1EB]"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
              >
                {t('programs.title')}
              </h1>
              <p
                className="reveal mt-4 max-w-[640px] font-inter text-[1rem] leading-[1.7]"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('programs.intro')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── #schedule — which days, and what 2-or-3 actually means ─── */}
      <section
        id="schedule"
        className="scroll-anchor"
        style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 0' }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group">
            <div className="reveal">
              <SectionHeader
                index="02"
                overline={t('programs.scheduleOverline')}
                title={t('programs.scheduleTitle')}
                ghost="WEEK"
              />
            </div>

            <div className="reveal mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
              {/* The three training days, as three plain cards */}
              <ul className="grid grid-cols-3 gap-3">
                {content.trainingDays.map(day => (
                  <li
                    key={day}
                    className="card-panel flex items-center justify-center px-2 py-6"
                  >
                    <span className="font-bebas text-[1.5rem] uppercase leading-none tracking-[0.08em] text-[#E0C878]">
                      {day}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4">
                <p className="font-inter text-[1rem] leading-[1.8] text-[#F5F1EB]">
                  {content.scheduleNote}
                </p>
                <div className="flex items-start gap-3">
                  <Repeat size={18} className="mt-[3px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
                  <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                    {t('programs.frequencyExplainer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="h-[1px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        }}
      />

      {/* ── #terms — the season, stated plainly, with dates ────────── */}
      <section
        id="terms"
        className="scroll-anchor"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(3.5rem, 8vw, 6rem) 0',
        }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group">
            <div className="reveal">
              <SectionHeader
                index="03"
                overline={t('programs.termsOverline')}
                title={t('programs.termsTitle')}
                ghost="33"
              />
            </div>

            <div className="reveal mt-8 card-panel corner-ticks overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
                    <th scope="col" className={thClass}>{t('programs.termHeader')}</th>
                    <th scope="col" className={thClass}>{t('programs.weeksHeader')}</th>
                    <th scope="col" className={thClass}>{t('programs.datesHeader')}</th>
                    <th scope="col" className={thClass}>{t('programs.instalmentsHeader')}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.terms.map((term, i) => {
                    const isTotal = term.id === 'total';
                    return (
                      <tr
                        key={term.id}
                        style={{
                          borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)',
                          backgroundColor: isTotal ? 'rgba(201,168,76,0.07)' : undefined,
                        }}
                      >
                        <th scope="row" className={`${tdClass} font-semibold whitespace-nowrap`}>
                          {term.term}
                          {term.note && (
                            <span className="mt-1 block font-normal text-[0.6875rem] leading-[1.5] text-[#8A94A6]">
                              {term.note}
                            </span>
                          )}
                        </th>
                        <td className={`${tdClass} whitespace-nowrap`}>{term.duration}</td>
                        <td className={tdClass}>{term.dates}</td>
                        <td className={`${tdClass} whitespace-nowrap`}>
                          {isTotal ? (
                            <span className="text-[#8A94A6]">—</span>
                          ) : (
                            t('pricing.instalmentsCount', { count: term.instalments })
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="reveal mt-5 flex items-start gap-3">
              <Info size={18} className="mt-[2px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
              <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                {content.termExplainer}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        className="h-[1px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        }}
      />

      {/* ── #pricing — one block per age group, identical every time ── */}
      <section
        id="pricing"
        className="scroll-anchor"
        style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 0' }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group mb-10">
            <div className="reveal">
              <SectionHeader
                index="04"
                overline={t('programs.pricingOverline')}
                title={t('programs.pricingTitle')}
                ghost="FEES"
              />
            </div>
            <p
              className="reveal mt-5 max-w-[680px] font-inter text-[1rem] leading-[1.7]"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {content.feesNote}
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {content.programs.map(program => {
              const band = content.priceBands.find(b => b.id === program.priceBand);
              return (
                <section
                  key={program.id}
                  id={program.id}
                  aria-labelledby={`${program.id}-title`}
                  className="reveal-group scroll-anchor"
                >
                  {/* Block header — name, ages, and a Register button beside it */}
                  <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3
                        id={`${program.id}-title`}
                        className="font-bebas text-[2.5rem] uppercase leading-none tracking-[0.04em] text-[#FFFFFF]"
                      >
                        {program.name}
                      </h3>
                      <p className="mt-1 font-inter text-[0.9375rem] text-[#C9A84C]">
                        {program.ages}
                      </p>
                    </div>
                    <Link
                      to={registerLink({ age: program.id })}
                      className="btn-primary w-full px-6 py-3 text-[0.75rem] sm:w-auto"
                    >
                      {t('programs.registerFor', { name: program.name })}
                    </Link>
                  </div>

                  <span className="hairline my-5 block" aria-hidden="true" />

                  <p className="reveal mb-6 max-w-[680px] font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                    {program.description}
                  </p>

                  {/* Schedule facts, then fees — the same two things, in the
                      same order, for all six age groups. */}
                  <div className="reveal card-panel mb-6 p-5 md:p-6">
                    <ScheduleSpec program={program} />
                  </div>

                  {band && (
                    <div className="reveal">
                      <PricingTable
                        band={band}
                        caption={t('programs.bandCaption', {
                          name: program.name,
                          band: band.title,
                        })}
                      />
                    </div>
                  )}

                  {/* …and the same decision, again, at the bottom of the block —
                      this time carrying the training-days choice into the form. */}
                  <div className="reveal mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    {FREQUENCIES.map(freq => (
                      <Link
                        key={freq}
                        to={registerLink({ age: program.id, frequency: freq, term: 'term1' })}
                        className={`${freq === FREQUENCIES[0] ? 'btn-primary' : 'btn-outline'} w-full px-6 py-3 text-[0.75rem] sm:w-auto`}
                      >
                        {t('programs.registerWithDays', { days: trainingDaysLabel(t, freq) })}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Fee questions the academy has not answered yet. Marked, not invented. */}
          {feeQuestions.length > 0 && (
            <div className="reveal-group mt-12">
              <div
                className="reveal rounded-[2px] p-6 md:p-7"
                style={{
                  backgroundColor: 'rgba(11,27,61,0.55)',
                  border: '1px dashed rgba(201, 168, 76, 0.4)',
                }}
              >
                <h3 className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
                  {t('programs.openItemsTitle')}
                  <span className="ms-2 font-normal normal-case tracking-normal text-[#8A94A6]">
                    {t('common.toBeConfirmed')}
                  </span>
                </h3>
                <dl className="mt-4 flex flex-col gap-4">
                  {feeQuestions.map(item => (
                    <div key={item.id}>
                      <dt className="font-inter text-[0.9375rem] font-semibold text-[#F5F1EB]">
                        {item.question}
                      </dt>
                      <dd className="mt-1 font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                        {item.placeholder}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* The guide's own standing note, under the fees where it belongs. */}
          <p className="reveal-group mt-8 font-inter text-[0.8125rem] leading-[1.7] text-[#8A94A6]">
            {content.guideNote}
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

      {/* ── What your child gets ───────────────────────────────────── */}
      <section
        id="included"
        className="scroll-anchor"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(3.5rem, 8vw, 6rem) 0',
        }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group mb-10">
            <div className="reveal">
              <SectionHeader
                index="05"
                overline={t('programs.includedOverline')}
                title={t('programs.includedTitle')}
                ghost="KIT"
              />
            </div>
          </div>

          <div className="reveal-group grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {content.included.map(item => (
              <div key={item} className="reveal flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)]"
                >
                  <Check size={12} className="text-[#C9A84C]" />
                </span>
                <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        className="h-[1px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        }}
      />

      {/* ── Terms & policies, then straight on to the FAQ ──────────── */}
      <section id="policies" className="scroll-anchor" style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 0' }}>
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group mb-10">
            <div className="reveal">
              <SectionHeader
                index="06"
                overline={t('programs.policiesOverline')}
                title={t('programs.policiesTitle')}
                ghost="TERMS"
              />
            </div>
          </div>

          <div className="reveal-group grid grid-cols-1 gap-6 md:grid-cols-3">
            {content.policies.map(policy => (
              <div key={policy.title} className="reveal">
                <div className="card-panel corner-ticks flex h-full flex-col gap-3 p-7">
                  <FileText size={20} className="text-[#C9A84C]" aria-hidden="true" />
                  <h3 className="font-bebas text-[1.375rem] uppercase leading-tight tracking-[0.02em] text-[#F5F1EB]">
                    {policy.title}
                  </h3>
                  <span className="hairline w-10" aria-hidden="true" />
                  <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                    {policy.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The FAQ is its own page — link to it rather than repeating it,
              which is the duplication this rebuild exists to remove. */}
          <div className="reveal-group mt-10">
            <div
              className="reveal pinstripe flex flex-col gap-5 rounded-[2px] p-7 md:flex-row md:items-center md:justify-between md:p-8"
              style={{
                backgroundColor: 'rgba(122, 10, 18, 0.35)',
                border: '1px solid rgba(201, 168, 76, 0.22)',
                borderInlineStart: '3px solid #C9A84C',
              }}
            >
              <div className="flex items-start gap-4">
                <HelpCircle size={22} className="mt-[2px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
                <div>
                  <h3 className="font-bebas text-[1.25rem] uppercase tracking-[0.03em] text-[#E0C878]">
                    {t('programs.faqLinkTitle')}
                  </h3>
                  <p className="mt-1 font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                    {t('programs.faqLinkText')}
                  </p>
                </div>
              </div>
              <Link to="/faq" className="btn-outline shrink-0 px-6 py-3 text-[0.75rem]">
                {t('programs.faqLinkButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RegisterCta title={t('programs.ctaTitle')} text={t('programs.ctaText')} />
    </div>
  );
}
