interface MarqueeProps {
  /** Ticker phrases; rendered in order, separated by gold ✦. */
  items: string[];
  /** Extra classes on the outer wrapper (padding, background, …). */
  className?: string;
}

/**
 * Wave A seamless ticker (design.md). .marquee provides overflow:hidden and
 * .marquee-track runs the translateX(0 → -50%) loop; the track carries TWO
 * identical copies (copy 2 is aria-hidden) so the loop is seamless in both
 * LTR and RTL. Hairline gold border-y, uppercase micro Inter items, gold ✦
 * separators. Pauses on hover, static under prefers-reduced-motion.
 */
export default function Marquee({ items, className = '' }: MarqueeProps) {
  if (items.length === 0) return null;

  const renderCopy = (hidden: boolean) => (
    <div className="flex items-center shrink-0" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="font-inter small-caps text-xs font-semibold uppercase tracking-[0.2em] text-[#F5F1EB]">
            {item}
          </span>
          <span aria-hidden="true" className="mx-6 text-xs text-[#C9A84C]">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee border-y border-[rgba(201,168,76,0.25)] py-4 ${className}`}
      aria-label={items.join(' · ')}
    >
      <div className="marquee-track">
        {renderCopy(false)}
        {renderCopy(true)}
      </div>
    </div>
  );
}
