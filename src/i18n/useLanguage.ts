// ═══════════════════════════════════════════════════════════════════
// useLanguage — the single hook components use for lang/dir/t().
// Kept in a non-component file for react-refresh lint cleanliness.
// ═══════════════════════════════════════════════════════════════════

import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from './context';

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return ctx;
}
