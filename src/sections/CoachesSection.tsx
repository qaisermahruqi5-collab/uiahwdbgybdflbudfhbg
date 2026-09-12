// ═══════════════════════════════════════════════════════════════════
// COACHES — its own section, its own heading, its own #coaches anchor.
// The nav item links straight here; there is no second coaches page.
//
// Cards are driven entirely by src/data/coaches.ts: adding a coach is a
// data edit. Portraits render at a fixed 3:4 ratio with identical
// treatment across every card, so a mixed set of supplied photos still
// lines up. A coach with no photo yet gets a square gold monogram, and
// an entry still marked `placeholder` is labelled as an open slot so it
// can never be mistaken for a real person.
//
// "Read more" is a native <button> toggling aria-expanded on a region,
// so the longer CV is keyboard-reachable and announced correctly.
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Languages, ShieldCheck } from 'lucide-react';
import type { Coach } from '@/data/coaches';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

function CoachCard({ coach }: { coach: Coach }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const placeholder = coach.status === 'placeholder';
  const panelId = `coach-detail-${coach.id}`;
  const buttonId = `coach-toggle-${coach.id}`;

  return (
    <article
      id={`coach-${coach.id}`}
      className="card-panel corner-ticks scroll-anchor flex h-full flex-col"
      style={placeholder ? { borderStyle: 'dashed' } : undefined}
    >
      {/* Portrait — fixed 3:4 so every card is the same shape */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3 / 4', backgroundColor: 'rgba(6,15,37,0.6)' }}
      >
        {coach.photo ? (
          <picture>
            {coach.photo.webp && <source srcSet={coach.photo.webp} type="image/webp" />}
            <img
              src={coach.photo.jpg}
              alt={t('coaches.photoAlt', { name: coach.name, role: coach.role })}
              width={coach.photo.width}
              height={coach.photo.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </picture>
        ) : (
          /* No portrait supplied yet — a monogram, not a broken image. */
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.55)] font-bebas text-[1.5rem] tracking-[0.04em] text-[#C9A84C]"
            >
              {coach.initials}
            </span>
            <span className="px-4 text-center font-inter text-[0.6875rem] uppercase tracking-[0.12em] text-[#8A94A6]">
              {t('coaches.photoPending')}
            </span>
          </div>
        )}
        {/* Gold leading edge bar, mirrored in RTL */}
        <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-[#C9A84C]" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {placeholder && (
          <span className="inline-flex w-fit items-center rounded-[2px] border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] px-2 py-[0.2rem] font-inter text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
            {t('coaches.openSlot')}
          </span>
        )}

        <div>
          <h3 className="font-bebas text-[1.625rem] uppercase leading-tight tracking-[0.02em] text-[#F5F1EB]">
            {coach.name}
          </h3>
          <span className="mt-1 block font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
            {coach.role}
          </span>
        </div>

        <span className="hairline w-10" aria-hidden="true" />

        {coach.credentials && (
          <p className="flex items-start gap-2 font-inter text-[0.8125rem] leading-[1.6] text-[#E0C878]">
            <ShieldCheck size={15} className="mt-[2px] shrink-0" aria-hidden="true" />
            <span>{coach.credentials}</span>
          </p>
        )}

        {coach.languages.length > 0 && (
          <p className="flex items-start gap-2 font-inter text-[0.8125rem] leading-[1.6] text-[#8A94A6]">
            <Languages size={15} className="mt-[2px] shrink-0" aria-hidden="true" />
            <span>
              <span className="sr-only">{t('coaches.languagesLabel')}: </span>
              {coach.languages.join(' · ')}
            </span>
          </p>
        )}

        <p className="font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">{coach.bio}</p>

        {coach.detail.length > 0 && (
          <div className="mt-auto pt-2">
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen(o => !o)}
              className="inline-flex items-center gap-2 font-inter text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition-opacity duration-300 hover:opacity-80"
            >
              {open ? t('coaches.readLess') : t('coaches.readMore')}
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="mt-3"
            >
              <ul className="flex flex-col gap-2">
                {coach.detail.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 font-inter text-[0.8125rem] leading-[1.7] text-[#8A94A6]"
                  >
                    <span aria-hidden="true" className="mt-[0.45rem] block h-1 w-1 shrink-0 bg-[#C9A84C]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function CoachesSection({ index = '04' }: { index?: string }) {
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
      id="coaches"
      className="scroll-anchor"
      style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}
    >
      <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div className="reveal mb-14">
          <SectionHeader
            index={index}
            overline={t('coaches.overline')}
            title={t('coaches.title')}
            ghost="COACH"
          />
        </div>

        {/* .reveal on the wrapper so GSAP never transforms a .card-panel
            directly — that would kill its hover lift. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.coaches.map(coach => (
            <div key={coach.id} className="reveal">
              <CoachCard coach={coach} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
