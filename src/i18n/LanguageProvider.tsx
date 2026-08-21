// ═══════════════════════════════════════════════════════════════════
// LANGUAGE PROVIDER — owns lang state, persists to localStorage,
// syncs <html lang/dir>, and exposes t() to the whole app.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import en from './en';
import ar from './ar';
import {
  LanguageContext,
  LANG_STORAGE_KEY,
  type Dir,
  type Lang,
  type LanguageContextValue,
  type TParams,
} from './context';

const DICTIONARIES: Record<Lang, Record<string, string>> = { en, ar };

function readStoredLang(): Lang {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);
  const dir: Dir = lang === 'ar' ? 'rtl' : 'ltr';

  /* Sync <html lang/dir> + persist the choice */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* private mode — persistence is best-effort */
    }
    /* Text reflows after a lang/dir switch — recalc GSAP scroll positions */
    ScrollTrigger.refresh();
  }, [lang, dir]);

  const t = useCallback(
    (key: string, params?: TParams): string => {
      const template = DICTIONARIES[lang][key] ?? DICTIONARIES.en[key] ?? key;
      return interpolate(template, params);
    },
    [lang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, setLang, t }),
    [lang, dir, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
