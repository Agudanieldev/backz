import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearLanguageQueryParam,
  normalizeLanguage,
  persistLanguage,
  readLanguagePreference,
} from "./language";

interface LanguageContextValue {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() =>
    normalizeLanguage(readLanguagePreference()),
  );

  useEffect(() => {
    // Keep the Google Translate cookie in sync before the element script
    // initialises, and consume the one-shot ?lang= hand-off.
    persistLanguage(language, false);
    clearLanguageQueryParam();
  }, [language]);

  const setLanguage = useCallback((next: string) => {
    const code = normalizeLanguage(next);
    persistLanguage(code);
    clearLanguageQueryParam();
    setLanguageState(code);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
}
