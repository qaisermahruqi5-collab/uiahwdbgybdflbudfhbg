import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** Gold Bebas numeral, e.g. "01" — stays latin digits in EN and AR. */
  index: string;
  /** Micro uppercase overline under the index row. */
  overline: string;
  /** Display title — pass t() output or JSX; Cairo takes over in RTL. */
  title: ReactNode;
  /** Horizontal alignment; headers are left-aligned unless noted. */
  align?: 'left' | 'center';
  /** Optional oversized stroke-only word behind the title (aria-hidden). */
  ghost?: string;
  /**
   * Heading level for the title. Sections are h2; pass 'h1' when this header
   * IS the page title, so every route ships exactly one h1.
   */
  as?: 'h1' | 'h2';
}

/**
 * Wave A "Stadium Editorial" section header (design.md).
 * Gold Bebas index + 40px hairline (.section-index), micro overline, huge
 * Bebas h2, optional ghost word (.text-ghost) absolutely positioned behind
 * the title. Logical start-alignment keeps it RTL-correct out of the box.
 */
export default function SectionHeader({
  index,
  overline,
  title,
  align = 'left',
  ghost,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div className={`relative isolate ${centered ? 'text-center' : 'text-start'}`}>
      {ghost ? (
        <span
          aria-hidden="true"
          className={`text-ghost font-bebas uppercase select-none whitespace-nowrap leading-none absolute z-0 ${
            centered ? 'left-1/2 -translate-x-1/2' : 'start-0'
          }`}
          style={{
            fontSize: 'clamp(5rem, 14vw, 11rem)',
            bottom: '-0.25em',
          }}
        >
          {ghost}
        </span>
      ) : null}

      <div className="relative z-[1]">
        <div className="section-index">{index}</div>
        <p className="font-inter text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#C9A84C] mt-3">
          {overline}
        </p>
        <Heading
          className="font-bebas uppercase text-[#F5F1EB] leading-[0.95] mt-2"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
        >
          {title}
        </Heading>
      </div>
    </div>
  );
}
