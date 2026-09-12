// ═══════════════════════════════════════════════════════════════════
// FAQ — its own page, grouped, and every question deep-linkable.
//
// DEEP LINKS. Each question's row carries a stable id from
// src/data/content.ts (faq-ages, faq-instalments, …). Arriving with
// that fragment — /#/faq#faq-instalments — opens that question and
// scrolls to it, so a link shared in a WhatsApp group lands on the
// answer rather than the top of the page. Changing an id breaks links
// people have already sent, so ids are treated as permanent.
//
// Answers still waiting on the academy are labelled "to be confirmed"
// rather than guessed at.
//
// The accordion is native <button> + aria-expanded, so it works with a
// keyboard and screen reader without any extra handling. More than one
// question can be open at once: closing the previous one would hide an
// answer the visitor is still reading.
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link, useLocation } from 'react-router-dom';
import { Link2, Plus } from 'lucide-react';
import type { FaqItem } from '@/data/content';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import Breadcrumbs from '@/components/Breadcrumbs';
import RegisterCta from '@/components/RegisterCta';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const buttonId = `${item.id}-button`;
  const panelId = `${item.id}-panel`;

  return (
    <div id={item.id} className="scroll-anchor">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-start transition-colors duration-300 hover:bg-[rgba(201,168,76,0.05)] sm:px-6 sm:py-5"
        >
          <span className="font-inter text-[0.9375rem] font-semibold leading-[1.5] text-[#F5F1EB] sm:text-[1rem]">
            {item.q}
            {item.pending && (
              <span className="ms-2 font-normal text-[0.6875rem] uppercase tracking-[0.1em] text-[#8A94A6]">
                {t('common.toBeConfirmed')}
              </span>
            )}
          </span>
          <Plus
            size={20}
            className="shrink-0 text-[#C9A84C] transition-transform duration-300"
            style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="font-inter text-[0.9375rem] leading-[1.8] text-[#8A94A6]">{item.a}</p>
          {/* A link straight to this answer, for sharing. */}
          <a
            href={`#/faq#${item.id}`}
            className="mt-3 inline-flex items-center gap-1.5 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition-opacity duration-300 hover:opacity-75"
          >
            <Link2 size={12} aria-hidden="true" />
            {t('faq.linkToAnswer')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { t } = useLanguage();
  const content = useContent();
  const { hash } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  usePageTitle(t('page.faq'), t('meta.faqDesc'));

  /* Which answers are showing.
     A deep link opens the question it points at — ScrollToHash does the
     scrolling, and this makes sure the answer is not collapsed when the
     visitor arrives. That default is DERIVED from the hash rather than
     pushed into state by an effect, so there is no render cascade and no
     moment where the row is open but the state disagrees.
     `toggled` records only the rows a visitor has actually clicked, so a
     hash-opened answer can still be closed by hand. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const hashId = hash.replace(/^#/, '');

  const isOpen = (id: string) => toggled[id] ?? id === hashId;
  const toggle = (id: string) => setToggled(prev => ({ ...prev, [id]: !isOpen(id) }));

  useGSAP(() => {
    if (!containerRef.current) return;
    const groups = gsap.utils.toArray<HTMLElement>('.reveal-group');
    groups.forEach(group => {
      const els = group.querySelectorAll('.reveal');
      if (!els.length) return;
      gsap.fromTo(
        els,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'expo.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: group, start: 'top 90%', once: true },
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
        <Breadcrumbs trail={[{ label: t('nav.faq') }]} />
      </div>

      <section
        style={{
          backgroundColor: 'rgba(6, 15, 37, 0.5)',
          padding: 'clamp(2.5rem, 6vw, 4.5rem) 0 clamp(3rem, 8vw, 5rem)',
        }}
      >
        <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="reveal-group">
            <div className="reveal">
              <SectionHeader
                as="h1"
                index="01"
                overline={t('faq.overline')}
                title={t('faq.title')}
                ghost="FAQ"
              />
            </div>
            <p
              className="reveal mt-4 max-w-[620px] font-inter text-[1rem] leading-[1.7]"
              style={{ color: 'rgba(245, 241, 235, 0.75)' }}
            >
              {t('faq.intro')}
            </p>

            {/* Jump links — the whole page's contents, above the fold */}
            <nav className="reveal mt-8" aria-label={t('faq.jumpLabel')}>
              <ul className="flex flex-wrap gap-2">
                {content.faqGroups.map(group => (
                  <li key={group.id}>
                    <a
                      href={`#/faq#${group.id}`}
                      className="inline-flex rounded-[2px] border border-[rgba(201,168,76,0.35)] bg-[rgba(11,27,61,0.55)] px-3 py-2 font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C] transition-colors duration-300 hover:border-[rgba(201,168,76,0.6)] hover:bg-[rgba(201,168,76,0.08)]"
                    >
                      {group.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(3rem, 7vw, 5rem) 0' }}>
        <div className="mx-auto max-w-[900px]" style={{ padding: '0 clamp(1rem, 5vw, 4rem)' }}>
          <div className="flex flex-col gap-10">
            {content.faqGroups.map(group => (
              <section
                key={group.id}
                id={group.id}
                aria-labelledby={`${group.id}-title`}
                className="reveal-group scroll-anchor"
              >
                <h2
                  id={`${group.id}-title`}
                  className="reveal mb-4 font-bebas text-[1.75rem] uppercase leading-none tracking-[0.03em] text-[#E0C878]"
                >
                  {group.title}
                </h2>
                <div className="reveal card-panel corner-ticks flex flex-col py-2">
                  {group.items.map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <span className="hairline mx-5 sm:mx-6" aria-hidden="true" />}
                      <FaqRow
                        item={item}
                        open={isOpen(item.id)}
                        onToggle={() => toggle(item.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Anything not answered above */}
          <div className="reveal-group mt-10">
            <div className="reveal card-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
              <div>
                <h2 className="font-bebas text-[1.375rem] uppercase tracking-[0.03em] text-[#F5F1EB]">
                  {t('faq.stillStuckTitle')}
                </h2>
                <p className="mt-1 font-inter text-[0.9375rem] leading-[1.7] text-[#8A94A6]">
                  {t('faq.stillStuckText')}
                </p>
              </div>
              <Link to="/about#location" className="btn-outline shrink-0 px-6 py-3 text-[0.75rem]">
                {t('faq.stillStuckButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RegisterCta />
    </div>
  );
}
