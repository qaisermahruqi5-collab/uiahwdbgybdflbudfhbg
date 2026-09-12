// ═══════════════════════════════════════════════════════════════════
// LOCATION — where training actually happens, with its own #location
// anchor and a nav entry.
//
// THE MAP IS LAZY BY DESIGN. A Google Maps iframe is heavy and would
// otherwise be fetched on first paint of the whole Academy page, so it
// is only mounted once the visitor asks for it (or the section scrolls
// into view). Until then a lightweight placeholder holds the space, so
// nothing shifts when it arrives.
//
// The iframe needs `frame-src https://www.google.com` in the CSP — see
// netlify.toml. Without it the map is blocked silently: no error on
// screen, just an empty frame and a console message.
//
// "Open in Google Maps" is a plain link, not a script, so it hands off
// to the Maps app on a phone.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ExternalLink, Info, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

/** Holds the map's space, and loads it when the section nears the viewport. */
function LazyMap({ src, title }: { src: string; title: string }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) return;
    const el = holderRef.current;
    if (!el) return;

    /* No IntersectionObserver (very old browser): leave the button, which
       works on its own. */
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div
      ref={holderRef}
      className="card-panel relative overflow-hidden p-0"
      style={{ aspectRatio: '4 / 3' }}
    >
      {show ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors duration-300 hover:bg-[rgba(201,168,76,0.05)]"
        >
          <MapPin size={28} className="text-[#C9A84C]" aria-hidden="true" />
          <span className="font-inter text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[#C9A84C]">
            {t('location.loadMap')}
          </span>
        </button>
      )}
    </div>
  );
}

/** One label/value row, with the value selectable so it can be pasted. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
        {label}
      </dt>
      <dd className="select-text font-inter text-[0.9375rem] leading-[1.7] text-[#F5F1EB]">
        {children}
      </dd>
    </div>
  );
}

export default function LocationSection({ index = '05' }: { index?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const content = useContent();
  const loc = content.location;

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
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="location"
      className="scroll-anchor"
      style={{
        backgroundColor: 'rgba(6, 15, 37, 0.5)',
        padding: 'clamp(4rem, 10vw, 8rem) 0',
      }}
    >
      <div className="mx-auto max-w-[1280px]" style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div className="reveal mb-12">
          <SectionHeader
            index={index}
            overline={t('location.overline')}
            title={t('location.title')}
            ghost="MAP"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Address, plus code, coordinates, and the button that matters */}
          <div className="reveal flex flex-col gap-6">
            <div>
              <h3 className="font-bebas text-[1.625rem] uppercase leading-tight tracking-[0.02em] text-[#F5F1EB]">
                {loc.venue}
              </h3>
              <p className="mt-1 font-inter text-[0.9375rem] text-[#C9A84C]">{loc.area}</p>
            </div>

            <span className="hairline" aria-hidden="true" />

            <dl className="flex flex-col gap-5">
              <DetailRow label={t('location.addressLabel')}>{loc.address}</DetailRow>
              <DetailRow label={t('location.plusCodeLabel')}>
                <code className="font-inter tracking-[0.04em] text-[#E0C878]">{loc.plusCode}</code>
              </DetailRow>
              <DetailRow label={t('location.coordinatesLabel')}>{loc.coordinates}</DetailRow>
            </dl>

            <a
              href={loc.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-[0.8125rem] sm:w-auto"
            >
              <Navigation size={16} aria-hidden="true" />
              {t('location.openInMaps')}
              <ExternalLink size={14} aria-hidden="true" />
            </a>

            {/* Getting here — a marked placeholder until the client writes it,
                never an invented set of directions. */}
            <div
              className="rounded-[2px] p-5"
              style={{
                backgroundColor: 'rgba(122, 10, 18, 0.25)',
                border: '1px solid rgba(201, 168, 76, 0.22)',
                borderInlineStart: '3px solid #C9A84C',
              }}
            >
              <div className="flex items-start gap-3">
                <Info size={18} className="mt-[2px] shrink-0 text-[#C9A84C]" aria-hidden="true" />
                <div>
                  <h4 className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#E0C878]">
                    {t('location.gettingHereTitle')}
                    {loc.gettingHerePending && (
                      <span className="ms-2 font-normal normal-case tracking-normal text-[#8A94A6]">
                        {t('common.toBeConfirmed')}
                      </span>
                    )}
                  </h4>
                  <p className="mt-2 font-inter text-[0.875rem] leading-[1.7] text-[#8A94A6]">
                    {loc.gettingHere}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="reveal">
            <LazyMap src={loc.embedUrl} title={t('location.mapTitle', { venue: loc.venue })} />
          </div>
        </div>
      </div>
    </section>
  );
}
