import { useEffect } from 'react';
import { SITE } from '@/config/site';

const DEFAULT_DESCRIPTION =
  'Official Genoa CFC Academy in Muscat, Oman. Elite youth football training for boys and girls aged 5 to 16, U6 to U16.';

/**
 * Sets document.title and the meta description for the current route.
 * Usage: usePageTitle('About the Academy');
 */
export function usePageTitle(title: string, description: string = DEFAULT_DESCRIPTION): void {
  useEffect(() => {
    document.title = title === SITE.name ? title : `${title} | ${SITE.name}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
}
