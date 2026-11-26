import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/languageProvider";
import {
  initGoogleTranslate,
  requestGoogleTranslateLanguage,
} from "@/lib/googleTranslate";

/**
 * Hidden Google Translate engine. The visible control is our own
 * <LanguageSwitcher>; this element only exists so the Google script can
 * translate the page and persist the selected language in the googtrans
 * cookie.
 */
export function GoogleTranslateWidget() {
  const { language } = useLanguage();
  const initialized = useRef(false);
  const appliedLanguage = useRef(language);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGoogleTranslate(language);
  }, [language]);

  useEffect(() => {
    if (appliedLanguage.current === language) return;
    appliedLanguage.current = language;
    requestGoogleTranslateLanguage(language);
  }, [language]);

  return <div id="google_translate_element" aria-hidden="true" />;
}
