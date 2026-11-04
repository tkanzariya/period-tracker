import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSetting, setSetting } from '../db/repository';
import { defaultLanguage, isLanguage, STRINGS, type Language, type Strings } from '../i18n';

interface LanguageValue {
  language: Language;
  /** All the app's wording in the chosen language. */
  S: Strings;
  setLanguage(language: Language): Promise<void>;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function deviceLocale(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}

/** The language lives in Settings (not on the home screen). It starts as the phone's language if that is Hindi. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [language, setLang] = useState<Language>(() => defaultLanguage(deviceLocale()));

  useEffect(() => {
    void getSetting(db, 'language').then((saved) => {
      if (isLanguage(saved)) setLang(saved);
    });
  }, [db]);

  const setLanguage = useCallback(
    async (next: Language) => {
      setLang(next);
      await setSetting(db, 'language', next);
    },
    [db],
  );

  const value = useMemo(() => ({ language, S: STRINGS[language], setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
