// ═══════════════════════════════════════════════════════════════════
// AT A GLANCE — four large tap targets, directly under the hero.
//
// This exists because the single loudest complaint in the stakeholder
// review was that people could not find things. It answers the four
// questions parents actually arrive with — what does it cost, when do
// they train, where is it, how do I sign up — before any scrolling on
// a phone.
//
// Sized for thumbs: a 2×2 grid at 360px, one row from `md`. Every card
// is a real link, so it is keyboard-reachable and opens in a new tab
// with a modifier click like any other.
// ═══════════════════════════════════════════════════════════════════

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardCheck, MapPin, Wallet, type LucideIcon } from 'lucide-react';
import { registerLink } from '@/lib/registerLink';
import { useLanguage } from '@/i18n/useLanguage';

gsap.registerPlugin(ScrollTrigger);

interface QuickLink {
  to: string;
  icon: LucideIcon;
  labelKey: string;
  hintKey: string;
  primary?: boolean;
}

const LINKS: QuickLink[] = [
  { to: '/programs#pricing', icon: Wallet, labelKey: 'quick.pricing', hintKey: 'quick.pricingHint' },
  { to: '/programs#schedule', icon: CalendarClock, labelKey: 'quick.times', hintKey: 'quick.timesHint' },
  { to: '/about#location', icon: MapPin, labelKey: 'quick.location', hintKey: 'quick.locationHint' },
  { to: registerLink(), icon: ClipboardCheck, labelKey: 'quick.register', hintKey: 'quick.registerHint', primary: true },
];

export default function QuickLinksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els || els.length === 0) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'expo.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 95%', once: true },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="quick-links-title"
      style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}
    >
      <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1rem, 5vw, 4rem)' }}>
        <h2
          id="quick-links-title"
          className="mb-5 font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]"
        >
          {t('quick.title')}
        </h2>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {LINKS.map(link => {
            const Icon = link.icon;
            return (
              <li key={link.to} className="reveal">
                <Link
                  to={link.to}
                  className="card-panel corner-ticks flex h-full min-h-[7.5rem] flex-col justify-between gap-2 p-4 md:min-h-[8.5rem] md:p-5"
                  style={
                    link.primary
                      ? {
                          backgroundColor: 'rgba(201,168,76,0.1)',
                          borderColor: 'rgba(201,168,76,0.5)',
                        }
                      : undefined
                  }
                >
                  <Icon size={22} className="shrink-0 text-[#C9A84C]" aria-hidden="true" />
                  <div>
                    <span className="block font-bebas text-[1.25rem] uppercase leading-tight tracking-[0.03em] text-[#F5F1EB] md:text-[1.375rem]">
                      {t(link.labelKey)}
                    </span>
                    <span className="mt-[0.15rem] block font-inter text-[0.6875rem] leading-[1.5] text-[#8A94A6]">
                      {t(link.hintKey)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
