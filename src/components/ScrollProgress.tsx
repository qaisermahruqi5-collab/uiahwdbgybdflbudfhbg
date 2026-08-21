import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const { dir } = useLanguage();

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      setProgress(ratio);
      setVisible(scrollY > 100);
    };

    /* Coalesce scroll bursts into one measurement per frame */
    const handleScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure(); // reflect the position we were restored at
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  /* Scales a full-width bar instead of animating `width`, so the browser keeps
     the whole thing on the compositor. The origin follows the writing
     direction, so the bar grows from the leading edge in RTL too. */
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 start-0 w-full h-[3px] z-[60] transition-opacity duration-200"
      style={{
        transform: `scaleX(${progress})`,
        transformOrigin: dir === 'rtl' ? 'right center' : 'left center',
        willChange: 'transform',
        backgroundColor: '#C9A84C',
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
