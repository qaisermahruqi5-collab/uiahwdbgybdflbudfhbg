// ═══════════════════════════════════════════════════════════════════
// LANGUAGE CONTEXT — framework-only module (no components) so that
// react-refresh/only-export-components stays clean.
// ═══════════════════════════════════════════════════════════════════

import { createContext } from 'react';

export type Lang = 'en' | 'ar';
export type Dir = 'ltr' | 'rtl';

/** Placeholder values for t(): {name} tokens are replaced at render time. */
export type TParams = Record<string, string | number>;

export interface LanguageContextValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  /**
   * Translate a UI-chrome key for the active language.
   * Falls back to English, then to the key itself.
   * Replaces {placeholder} tokens when `params` is given.
   */
  t: (key: string, params?: TParams) => string;
}

export const LANG_STORAGE_KEY = 'ga-lang';

export const LanguageContext = createContext<LanguageContextValue | null>(null);
