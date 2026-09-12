// ═══════════════════════════════════════════════════════════════════
// BREADCRUMBS — "where am I, and how do I get back" on every inner
// page. Home is always the first crumb; the current page is the last
// and is not a link (aria-current marks it for screen readers).
// Chevrons are decorative and flip with text direction.
// ═══════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/useLanguage';

export interface Crumb {
  label: string;
  /** Omit on the final crumb — the page you are already on. */
  to?: string;
}

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const { t, dir } = useLanguage();
  const separator = dir === 'rtl' ? '‹' : '›';

  const crumbs: Crumb[] = [{ label: t('nav.home'), to: '/' }, ...trail];

  return (
    <nav aria-label={t('nav.breadcrumbLabel')}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-[#8A94A6] text-[0.75rem]">
                  {separator}
                </span>
              )}
              {last || !crumb.to ? (
                <span
                  aria-current="page"
                  className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#8A94A6]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="font-inter text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition-opacity duration-300 hover:opacity-75"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
