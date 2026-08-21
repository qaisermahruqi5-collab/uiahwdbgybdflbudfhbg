interface StatProps {
  /** Display value, e.g. "500+" — Bebas, gold. */
  value: string;
  /** Micro uppercase label under the value — muted. */
  label: string;
}

/**
 * Wave A hairline stat column (design.md). Bebas gold value over a muted
 * micro uppercase label. Designed to sit in a parent flex row separated by
 * vertical hairlines — separators are the PARENT's job, e.g.:
 *
 *   <div className="flex items-center gap-8">
 *     <Stat value="500+" label="Players" />
 *     <span className="hairline w-px h-10" aria-hidden="true" />
 *     <Stat value="25+" label="Coaches" />
 *   </div>
 */
export default function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-start gap-1 text-start">
      <span
        className="font-bebas leading-none text-[#C9A84C]"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
      >
        {value}
      </span>
      <span className="font-inter text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
        {label}
      </span>
    </div>
  );
}
