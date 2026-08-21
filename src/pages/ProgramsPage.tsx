import { Fragment, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Sun,
  Snowflake,
  Timer,
  Repeat,
  Banknote,
  Plus,
  Info,
  Check,
  FileText,
} from 'lucide-react';
import type { FaqItem } from '@/data/content';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

/* ── Shared table styling (sharp, hairline-separated) ───────────── */
const thClass =
  'px-4 py-3 text-start font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C] whitespace-nowrap';
const tdClass =
  'px-4 py-4 font-inter text-[0.875rem] text-[#F5F1EB] align-top';

/* ── One labelled spec row inside a program card ────────────────── */
function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="shrink-0 text-[#C9A84C]" aria-hidden="true" />
      <span className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#8A94A6] w-[6.5rem] shrink-0">
        {label}
      </span>
      <span className="font-inter text-[0.875rem] font-medium text-[#F5F1EB]">
        {value}
      </span>
    </div>
  );
}

/* ── FAQ accordion row — native button = keyboard access for free ──
   Rows live inside ONE sharp panel, separated by .hairline dividers. */
function FaqAccordionItem({
  item,
  index,
  open,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div>
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start cursor-pointer transition-colors duration-300 hover:bg-[rgba(201,168,76,0.05)]"
      >
        <span className="font-inter text-[1rem] font-semibold text-[#F5F1EB] leading-[1.4]">
          {item.q}
        </span>
        <Plus
          size={20}
          className="shrink-0 text-[#C9A84C] transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: open ? '700px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-6 pb-6">
          <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const { t } = useLanguage();
  const content = useContent();

  usePageTitle(t('page.programs'), t('meta.programsDesc'));

  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* ═══════════════════ PROGRAMS SECTION ═══════════════════ */}
      <section
        id="programs-section"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          {/* Page Header — keeps the h1; styled with .section-index + ghost */}
          <div className="reveal-group relative isolate text-start mb-14">
            <span
              aria-hidden="true"
              className="text-ghost font-bebas uppercase select-none whitespace-nowrap leading-none absolute start-0 z-0"
              style={{
                fontSize: 'clamp(5rem, 14vw, 11rem)',
                bottom: '-0.25em',
              }}
            >
              TRAIN
            </span>
            <div className="relative z-[1]">
              <div className="reveal section-index">01</div>
              <p className="reveal font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
                {t('programs.overline')}
              </p>
              <h1
                className="reveal font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
              >
                {t('programs.title')}
              </h1>
              <p
                className="reveal font-inter text-[1rem] leading-[1.7] max-w-[620px] mt-4"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('programs.intro')}
              </p>
            </div>
          </div>

          {/* Programs Grid — .reveal on the article wrapper so GSAP never
              transforms a .card-panel directly */}
          <div className="reveal-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.programs.map(program => {
              const band = content.priceBands.find(b => b.id === program.priceBand);
              return (
              <article key={program.id} className="reveal">
                <div className="card-panel corner-ticks relative flex flex-col h-full p-7">
                  {/* Corner-tab age badge (absolute top-end gold tab, 2px radius) */}
                  <span className="absolute top-0 end-0 rounded-[2px] bg-[#C9A84C] px-3 py-1 font-inter text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#060F25]">
                    {program.ages}
                  </span>

                  {/* Name — the age group and nothing else */}
                  <h2 className="font-bebas uppercase text-[#FFFFFF] leading-none text-[2.75rem] tracking-[0.04em] mb-3">
                    {program.name}
                  </h2>

                  {/* Description */}
                  <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6] mb-6">
                    {program.description}
                  </p>

                  {/* Schedule specs — rows separated by .hairline */}
                  <div className="mt-auto flex flex-col gap-3">
                    <span className="hairline" aria-hidden="true" />
                    <SpecRow icon={CalendarDays} label={t('programs.daysLabel')} value={program.days} />
                    <SpecRow icon={Repeat} label={t('programs.sessionsLabel')} value={program.sessions} />
                    <span className="hairline" aria-hidden="true" />
                    <SpecRow icon={Snowflake} label={t('programs.winterLabel')} value={program.winterTime} />
                    <SpecRow icon={Sun} label={t('programs.summerLabel')} value={program.summerTime} />
                    <SpecRow icon={Timer} label={t('programs.durationLabel')} value={program.duration} />

                    {/* Fees for this age group's price band — the same figures
                        as the full tables in section 02, surfaced per card. */}
                    {band && (
                      <>
                        <span className="hairline" aria-hidden="true" />
                        <div className="flex items-center gap-3">
                          <Banknote size={16} className="shrink-0 text-[#C9A84C]" aria-hidden="true" />
                          <span className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">
                            {t('programs.cardFeesLabel')}
                          </span>
                        </div>
                        {band.rows.map(row => (
                          <div
                            key={row.sessions}
                            className="flex items-baseline justify-between gap-3 ps-7"
                          >
                            <span className="font-inter text-[0.75rem] text-[#8A94A6]">
                              {row.sessions}
                            </span>
                            <span className="font-inter text-[0.875rem] font-semibold text-[#E0C878] whitespace-nowrap">
                              {row.term1}{' '}
                              <span className="font-normal text-[0.6875rem] text-[#8A94A6]">
                                {t('programs.perTerm')}
                              </span>
                            </span>
                          </div>
                        ))}
                        {band.rows.length > 1 && (
                          <p className="ps-7 font-inter text-[0.6875rem] leading-[1.6] text-[#8A94A6]">
                            {t('programs.fullSeasonRange', {
                              from: band.rows[0].fullSeason,
                              to: band.rows[band.rows.length - 1].fullSeason,
                            })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </div>

          {/* Schedule + Fees Notes Callout — red pinstripe panel, 3px gold
              leading bar (border-inline-start = RTL-aware) */}
          <div className="reveal-group mt-10">
            <div className="reveal">
              <div
                className="pinstripe rounded-[2px] p-7 md:p-8 flex flex-col gap-5"
                style={{
                  backgroundColor: 'rgba(122, 10, 18, 0.35)',
                  border: '1px solid rgba(201, 168, 76, 0.22)',
                  borderInlineStart: '3px solid #C9A84C',
                }}
              >
                <div className="flex items-start gap-4">
                  <Info size={20} className="shrink-0 text-[#C9A84C] mt-[2px]" aria-hidden="true" />
                  <div>
                    <h3 className="font-bebas uppercase text-[#E0C878] text-[1.25rem] tracking-[0.03em] mb-1">
                      {t('programs.scheduleTitle')}
                    </h3>
                    <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                      {content.scheduleNote}
                    </p>
                  </div>
                </div>
                <span className="hairline" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <Banknote size={20} className="shrink-0 text-[#C9A84C] mt-[2px]" aria-hidden="true" />
                  <div>
                    <h3 className="font-bebas uppercase text-[#E0C878] text-[1.25rem] tracking-[0.03em] mb-1">
                      {t('programs.feesTitle')}
                    </h3>
                    <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                      {content.feesNote}
                    </p>
                  </div>
                </div>
                <div>
                  <Link to="/calendar" className="btn-outline px-6 py-3 text-[0.75rem]">
                    {t('programs.viewCalendar')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ PRICING SECTION ═══════════════════ */}
      <section
        id="pricing-section"
        style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal-group mb-12">
            <div className="reveal">
              <SectionHeader
                index="02"
                overline={t('programs.pricingOverline')}
                title={t('programs.pricingTitle')}
                ghost="FEES"
              />
            </div>
            <p
              className="reveal font-inter text-[1rem] leading-[1.7] max-w-[680px] mt-5"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('programs.pricingIntro')}
            </p>
          </div>

          {/* Season structure — three terms, 33 weeks */}
          <div className="reveal-group mb-10">
            <div className="reveal">
              <h3 className="font-bebas uppercase text-[#E0C878] text-[1.375rem] tracking-[0.03em] mb-4">
                {t('programs.seasonTitle')}
              </h3>
              <div className="card-panel overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
                      <th scope="col" className={thClass}>{t('programs.termHeader')}</th>
                      <th scope="col" className={thClass}>{t('programs.durationHeader')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.terms.map((term, i) => (
                      <tr
                        key={term.term}
                        style={{
                          borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)',
                          backgroundColor:
                            i === content.terms.length - 1 ? 'rgba(201,168,76,0.07)' : undefined,
                        }}
                      >
                        <th scope="row" className={`${tdClass} font-semibold`}>{term.term}</th>
                        <td className={tdClass}>{term.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Price bands — one table per age band, rows = sessions per week */}
          <div className="reveal-group flex flex-col gap-8">
            {content.priceBands.map(band => (
              <div key={band.id} className="reveal">
                <h3 className="font-bebas uppercase text-[#E0C878] text-[1.375rem] tracking-[0.03em] mb-4">
                  {band.title}
                </h3>
                <div className="card-panel corner-ticks overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
                        <th scope="col" className={thClass}>{t('programs.priceSessions')}</th>
                        <th scope="col" className={thClass}>{t('programs.priceTerm1')}</th>
                        <th scope="col" className={thClass}>{t('programs.priceTerm2')}</th>
                        <th scope="col" className={thClass}>{t('programs.priceTerm3')}</th>
                        <th scope="col" className={thClass}>{t('programs.priceFullSeason')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {band.rows.map((row, i) => (
                        <tr
                          key={row.sessions}
                          style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(201,168,76,0.12)' }}
                        >
                          <th
                            scope="row"
                            className={`${tdClass} font-bebas text-[1.25rem] tracking-[0.04em] uppercase text-[#C9A84C] whitespace-nowrap`}
                          >
                            {row.sessions}
                          </th>
                          {([
                            [row.term1, row.term1Monthly],
                            [row.term2, row.term2Monthly],
                            [row.term3, row.term3Monthly],
                          ] as const).map(([price, monthly], k) => (
                            <td key={k} className={tdClass}>
                              <span className="block font-semibold">{price}</span>
                              <span className="block text-[0.75rem] text-[#8A94A6] mt-1">{monthly}</span>
                            </td>
                          ))}
                          <td className={tdClass} style={{ backgroundColor: 'rgba(201,168,76,0.07)' }}>
                            <span className="block font-bebas text-[1.5rem] tracking-[0.03em] text-[#E0C878] leading-none">
                              {row.fullSeason}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <p className="reveal font-inter text-[0.8125rem] text-[#8A94A6]">
              {t('programs.priceCurrencyNote')}
            </p>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ WHAT'S INCLUDED ═══════════════════ */}
      <section
        id="included-section"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal-group mb-12">
            <div className="reveal">
              <SectionHeader
                index="03"
                overline={t('programs.includedOverline')}
                title={t('programs.includedTitle')}
                ghost="KIT"
              />
            </div>
          </div>

          <div className="reveal-group grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {content.included.map(item => (
              <div key={item} className="reveal flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)]"
                >
                  <Check size={12} className="text-[#C9A84C]" />
                </span>
                <p className="font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ TERMS & POLICIES ═══════════════════ */}
      <section
        id="policies-section"
        style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
      >
        <div
          className="max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal-group mb-12">
            <div className="reveal">
              <SectionHeader
                index="04"
                overline={t('programs.policiesOverline')}
                title={t('programs.policiesTitle')}
                ghost="TERMS"
              />
            </div>
          </div>

          <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.policies.map(policy => (
              <div key={policy.title} className="reveal">
                <div className="card-panel corner-ticks h-full flex flex-col gap-3 p-7">
                  <FileText size={20} className="text-[#C9A84C]" aria-hidden="true" />
                  <h3 className="font-bebas uppercase text-[#F5F1EB] text-[1.375rem] tracking-[0.02em] leading-tight">
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
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
      <section
        id="faq-section"
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
          <div className="reveal-group mb-12">
            <div className="reveal">
              <SectionHeader
                index="05"
                overline={t('programs.faqOverline')}
                title={t('programs.faqTitle')}
                ghost="FAQ"
              />
            </div>
          </div>

          {/* Accordion — ONE sharp panel, rows separated by .hairline */}
          <div className="reveal-group max-w-[820px] mx-auto">
            <div className="reveal">
              <div className="card-panel corner-ticks flex flex-col py-2">
                {content.faqs.map((item, index) => (
                  <Fragment key={item.q}>
                    {index > 0 && (
                      <span className="hairline w-auto mx-6" aria-hidden="true" />
                    )}
                    <FaqAccordionItem
                      item={item}
                      index={index}
                      open={openFaq === index}
                      onToggle={() => setOpenFaq(prev => (prev === index ? null : index))}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ CTA BAND ═══════════════════ */}
      <section
        id="programs-cta"
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(4rem, 10vw, 8rem) 0',
        }}
      >
        <div
          className="reveal-group max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal">
            <div
              className="pinstripe rounded-[2px] text-center px-8 py-14 md:py-16"
              style={{
                backgroundColor: 'rgba(122, 10, 18, 0.35)',
                border: '1px solid rgba(201, 168, 76, 0.22)',
              }}
            >
              <h2
                className="font-bebas uppercase text-[#FFFFFF] leading-none mb-3"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  letterSpacing: '0.03em',
                }}
              >
                {t('programs.ctaTitle')}
              </h2>
              <p
                className="font-inter text-[1rem] leading-[1.7] max-w-[480px] mx-auto mb-8"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('programs.ctaText')}
              </p>
              <Link to="/join" className="btn-primary px-10 py-4 text-[0.875rem]">
                {t('programs.ctaButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
