import { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Instagram, MessageCircle } from 'lucide-react';
import { SITE, whatsappLink } from '@/config/site';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';

gsap.registerPlugin(ScrollTrigger);

export default function NewsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const content = useContent();

  usePageTitle(t('page.news'), t('meta.newsDesc'));

  /* The stored date is a plain ISO day; the label is built per language so
     editors never have to type a formatted date by hand. Arabic keeps Latin
     digits ('-u-nu-latn') to match the rest of the Arabic site. */
  const formatDate = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (iso: string) => {
      const parsed = new Date(`${iso}T00:00:00`);
      return Number.isNaN(parsed.getTime()) ? iso : fmt.format(parsed);
    };
  }, [lang]);

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
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pt-24">
      {/* Section Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ NEWS ═══════════════════ */}
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
              NEWS
            </span>
            <div className="relative z-[1]">
              <div className="reveal section-index">01</div>
              <p className="reveal font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
                {t('news.overline')}
              </p>
              <h1
                className="reveal font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
              >
                {t('news.title')}
              </h1>
              <p
                className="reveal font-inter text-[1rem] leading-[1.7] max-w-[560px] mt-4"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('news.intro')}
              </p>
            </div>
          </div>

          {/* News list */}
          {content.news.length === 0 ? (
            <div className="reveal-group">
              <p className="reveal card-panel px-6 py-8 text-center font-inter text-[0.9375rem] text-[#8A94A6]">
                {t('news.empty')}
              </p>
            </div>
          ) : (
            <div className="reveal-group flex flex-col gap-6">
              {content.news.map(item => (
                <article key={item.id} className="reveal">
                  <div className="card-panel corner-ticks relative flex flex-col gap-5 p-7 md:p-9 md:flex-row md:items-start">
                    {/* 3px gold leading edge bar */}
                    <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-[#C9A84C]" />

                    {/* Optional photo — sharp frame, one clipped corner.
                        Posts without an image keep the original full-width text. */}
                    {item.image && (
                      <div
                        className="shrink-0 overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.28)] md:w-[260px] lg:w-[320px]"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
                      >
                        <picture>
                          {item.image.webp && (
                            <source srcSet={item.image.webp} type="image/webp" />
                          )}
                          <img
                            src={item.image.jpg}
                            alt={(lang === 'ar' && item.image.altAr) || item.image.alt}
                            width={item.image.width}
                            height={item.image.height}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto object-cover"
                            style={{ aspectRatio: `${item.image.width} / ${item.image.height}` }}
                          />
                        </picture>
                      </div>
                    )}

                    <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-[2px] bg-[#C9A84C] px-3 py-1 font-inter text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#060F25]">
                        {item.category}
                      </span>
                      <time
                        dateTime={item.date}
                        className="font-inter text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[#8A94A6]"
                      >
                        {formatDate(item.date)}
                      </time>
                    </div>

                    <h2 className="font-bebas uppercase text-[#FFFFFF] leading-[1.05] text-[1.75rem] md:text-[2rem] tracking-[0.02em]">
                      {item.title}
                    </h2>

                    <span className="hairline w-16" aria-hidden="true" />

                    <p className="font-inter text-[0.9375rem] leading-[1.8] text-[#8A94A6] max-w-[760px]">
                      {item.excerpt}
                    </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gold Divider */}
      <div className="w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)' }} />

      {/* ═══════════════════ FOLLOW BAND ═══════════════════ */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 0' }}>
        <div
          className="reveal-group max-w-[1280px] mx-auto"
          style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
        >
          <div className="reveal">
            <div
              className="pinstripe rounded-[2px] text-center px-8 py-14"
              style={{
                backgroundColor: 'rgba(122, 10, 18, 0.35)',
                border: '1px solid rgba(201, 168, 76, 0.22)',
              }}
            >
              <h2
                className="font-bebas uppercase text-[#FFFFFF] leading-none mb-3"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '0.03em' }}
              >
                {t('news.followTitle')}
              </h2>
              <p
                className="font-inter text-[1rem] leading-[1.7] max-w-[480px] mx-auto mb-8"
                style={{ color: 'rgba(245, 241, 235, 0.75)' }}
              >
                {t('news.followText')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-[0.8125rem]"
                >
                  <Instagram size={18} aria-hidden="true" />
                  {SITE.instagramHandle}
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-2 px-8 py-3 text-[0.8125rem]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  {SITE.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
