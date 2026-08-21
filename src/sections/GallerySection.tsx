// ═══════════════════════════════════════════════════════════════════
// GALLERY — the ONE place media lives. A single slideshow carrying
// every academy photo AND video (src/data/media.ts). Images advance
// on a timer; a video pauses the timer, plays, then hands over to the
// next item when it ends.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { GALLERY_MEDIA } from '@/data/media';
import { useLanguage } from '@/i18n/useLanguage';
import SectionHeader from '@/components/design/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

const SLIDE_MS = 5000;

export default function GallerySection({
  index = '03',
  withBackground = true,
}: {
  index?: string;
  withBackground?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { t, dir } = useLanguage();

  const [current, setCurrent] = useState(0);
  /* Respect prefers-reduced-motion: start parked, let the visitor opt in. */
  const [isPlaying, setIsPlaying] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isPaused, setIsPaused] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const total = GALLERY_MEDIA.length;
  const activeItem = GALLERY_MEDIA[current];

  const goTo = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);
  const next = useCallback(() => setCurrent(prev => (prev + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + total) % total), [total]);

  /* Eager-load the current slide and its neighbours so a transition never
     lands on a blank frame; everything further out stays lazy. */
  const isPrimed = (i: number) =>
    i === 0 ||
    i === current ||
    i === (current + 1) % total ||
    i === (current - 1 + total) % total;

  /* Autoplay — images only. A video drives its own advance via onEnded. */
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    if (activeItem.kind === 'video') return;
    const id = window.setInterval(next, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [isPlaying, isPaused, activeItem, next]);

  /* Only the active video ever plays; every other one rewinds and stops. */
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      if (id === activeItem.id && activeItem.kind === 'video') {
        if (isPlaying && !isPaused) {
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      } else {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [activeItem, isPlaying, isPaused]);

  /* Touch swipe (direction mirrors in RTL) */
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    const forward = dir === 'rtl' ? dx > 0 : dx < 0;
    if (forward) next();
    else prev();
  };

  /* Keyboard arrows while the carousel has focus */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (dir === 'rtl') prev();
      else next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (dir === 'rtl') next();
      else prev();
    }
  };

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
        backgroundColor: withBackground ? 'rgba(6, 15, 37, 0.5)' : undefined,
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
            index={index}
            overline={t('gallery.overline')}
            title={t('gallery.title')}
            ghost="GALLERY"
          />
        </div>

        {/* Slideshow — sharp frame: 2px radius, 1px gold border,
            one diagonal-clipped corner + 3px gold leading edge bar */}
        <div className="reveal">
          <div
            className="relative max-w-[1000px] mx-auto overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.3)] min-h-[220px] sm:min-h-[320px]"
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#060F25',
              clipPath: 'polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%)',
            }}
            role="region"
            aria-roledescription="carousel"
            aria-label={t('gallery.label')}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
            }}
          >
            {GALLERY_MEDIA.map((item, i) => {
              const active = current === i;
              const fade = {
                transitionProperty: 'opacity',
                transitionDuration: '800ms',
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                opacity: active ? 1 : 0,
              } as const;

              if (item.kind === 'video') {
                return (
                  <video
                    key={item.id}
                    ref={el => { videoRefs.current[item.id] = el; }}
                    src={item.src}
                    poster={item.poster}
                    width={item.width}
                    height={item.height}
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={t('gallery.videoLabel', { n: item.index })}
                    onEnded={next}
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ ...fade, pointerEvents: active ? 'auto' : 'none' }}
                  >
                    {t('gallery.noVideo')}
                  </video>
                );
              }

              return (
                <picture key={item.id}>
                  <source srcSet={item.webp} type="image/webp" />
                  <img
                    src={item.jpg}
                    alt={t('gallery.photoAlt', { n: item.index })}
                    width={item.width}
                    height={item.height}
                    loading={isPrimed(i) ? 'eager' : 'lazy'}
                    decoding={i === 0 ? undefined : 'async'}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={fade}
                  />
                </picture>
              );
            })}

            {/* 3px gold edge bar (inline-start — mirrors in RTL) */}
            <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] z-[2] bg-[#C9A84C]" />

            {/* VIDEO badge + counter */}
            <div className="absolute top-4 start-6 z-[3] flex items-center gap-2">
              {activeItem.kind === 'video' && (
                <span className="rounded-[2px] bg-[#7A0A12] px-2 py-[0.2rem] font-inter text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#F5F1EB]">
                  {t('gallery.videoBadge')}
                </span>
              )}
              <span className="rounded-[2px] border border-[rgba(201,168,76,0.4)] bg-[rgba(6,15,37,0.75)] px-2 py-[0.2rem] font-inter text-[0.625rem] font-semibold tracking-[0.12em] text-[#C9A84C]">
                {t('gallery.counter', { current: current + 1, total })}
              </span>
            </div>

            {/* Arrow Navigation — icons mirror in RTL */}
            <button
              onClick={prev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-[3] w-11 h-11 rounded-[2px] items-center justify-center border border-[rgba(201,168,76,0.35)] bg-[rgba(6,15,37,0.75)] text-[#F5F1EB] transition-colors duration-300 hover:bg-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.6)]"
              aria-label={t('gallery.prev')}
            >
              {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <button
              onClick={next}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[3] w-11 h-11 rounded-[2px] items-center justify-center border border-[rgba(201,168,76,0.35)] bg-[rgba(6,15,37,0.75)] text-[#F5F1EB] transition-colors duration-300 hover:bg-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.6)]"
              aria-label={t('gallery.next')}
            >
              {dir === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>

            {/* Segment progress bars — active = filled gold, inactive = hairline outline */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-1.5">
              {GALLERY_MEDIA.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className="h-[5px] w-6 sm:w-8 rounded-[1px] border transition-all duration-300"
                  style={{
                    backgroundColor: current === i ? '#C9A84C' : 'transparent',
                    borderColor: current === i ? '#C9A84C' : 'rgba(201, 168, 76, 0.5)',
                  }}
                  aria-label={t('gallery.goToSlide', { n: i + 1 })}
                  aria-current={current === i}
                />
              ))}
            </div>

            {/* Pause / Play */}
            <button
              onClick={() => setIsPlaying(p => !p)}
              aria-pressed={!isPlaying}
              aria-label={isPlaying ? t('gallery.pause') : t('gallery.play')}
              className="absolute bottom-3 right-3 z-[3] w-10 h-10 rounded-[2px] border border-[rgba(201,168,76,0.35)] bg-[rgba(6,15,37,0.75)] flex items-center justify-center text-[#F5F1EB] transition-colors duration-300 hover:bg-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.6)]"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
