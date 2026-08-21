// ═══════════════════════════════════════════════════════════════════
// useContent — returns the full localized site-content object for the
// active language, deep-falling-back to the English master for any
// missing field. Components consume ONE source: useContent().
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { CONTENT_AR } from '@/data/content-ar';
import { buildSiteContent, type SiteContent } from './content-types';
import { useLanguage } from './useLanguage';

export function useContent(): SiteContent {
  const { lang } = useLanguage();
  return useMemo(
    () => buildSiteContent(lang === 'ar' ? CONTENT_AR : undefined),
    [lang]
  );
}
