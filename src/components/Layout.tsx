import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ScrollProgress from './ScrollProgress';
import { setLenis } from '@/lib/lenis';

gsap.registerPlugin(ScrollTrigger);

export default function Layout({ children }: { children: ReactNode }) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      /* Reduced motion: skip smooth scrolling and let GSAP tweens complete instantly */
      gsap.globalTimeline.timeScale(100);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    setLenis(lenis);

    /* Keep ScrollTrigger in sync with Lenis scroll position */
    lenis.on('scroll', ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  /* Footer entrance — single owner, runs once for every page */
  useGSAP(() => {
    const footer = layoutRef.current?.querySelector('footer');
    if (footer) {
      gsap.fromTo(footer,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'expo.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }
  }, { scope: layoutRef });

  return (
    <div ref={layoutRef} className="relative min-h-[100dvh]">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] animate-grain"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      <ScrollProgress />
      <Navbar />

      <main className="relative z-[1]">
        {children}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
