export interface LanguageOption {
  /** Google Translate language code. */
  code: string;
  /** Endonym shown in the language picker. */
  label: string;
}

export const DEFAULT_LANGUAGE = "en";

/**
 * Same list the legacy site exposed, kept in the legacy order so the picker
 * feels familiar. Google's element script only accepts the codes listed here.
 */
export const LANGUAGES: readonly LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "it", label: "Italiano" },
  { code: "tr", label: "Türkçe" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "fa", label: "فارسی" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ro", label: "Română" },
  { code: "th", label: "ไทย" },
  { code: "cs", label: "Čeština" },
  { code: "sv", label: "Svenska" },
  { code: "fi", label: "Suomi" },
  { code: "el", label: "Ελληνικά" },
  { code: "he", label: "עברית" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "hu", label: "Magyar" },
  { code: "bg", label: "Български" },
  { code: "da", label: "Dansk" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" },
  { code: "bn", label: "বাংলা" },
  { code: "ur", label: "اردو" },
];

export const GOOGLE_TRANSLATE_LANGUAGES = LANGUAGES.map(
  (language) => language.code,
).join(",");

const LANGUAGE_STORAGE_KEY = "tz-language";
const GOOGTRANS_COOKIE = "googtrans";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year
const SHARED_COOKIE_DOMAIN = "tradezanga.com";

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function toSupportedLanguage(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  if (!base) return null;

  return LANGUAGES.some((language) => language.code === base) ? base : null;
}

export function normalizeLanguage(value: string | null | undefined): string {
  return toSupportedLanguage(value) ?? DEFAULT_LANGUAGE;
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith(prefix)) continue;

    const raw = entry.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return null;
}

/**
 * On the production domains the cookie is shared with the marketing site so
 * the language picked at tradezanga.com is still active on app.tradezanga.com.
 * Localhost and preview deployments fall back to a host-only cookie.
 */
function sharedCookieDomainSuffix() {
  if (!isBrowser()) return "";

  const host = window.location.hostname.toLowerCase();
  if (
    host === SHARED_COOKIE_DOMAIN ||
    host.endsWith(`.${SHARED_COOKIE_DOMAIN}`)
  ) {
    return `;domain=.${SHARED_COOKIE_DOMAIN}`;
  }

  return "";
}

function writeGoogtransValue(value: string) {
  if (!isBrowser()) return;

  const domain = sharedCookieDomainSuffix();
  const cookie = `${GOOGTRANS_COOKIE}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;

  if (domain) {
    // Remove a host-only cookie left by the legacy site/Google widget so the
    // shared cookie is the value Google Translate reads on every subdomain.
    document.cookie = `${GOOGTRANS_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
    document.cookie = `${cookie}${domain}`;
    return;
  }

  document.cookie = cookie;
}

export function clearGoogtransCookie() {
  if (!isBrowser()) return;

  document.cookie = `${GOOGTRANS_COOKIE}=;path=/;max-age=0;SameSite=Lax`;

  const domain = sharedCookieDomainSuffix();
  if (domain) {
    document.cookie = `${GOOGTRANS_COOKIE}=;path=/;max-age=0;SameSite=Lax${domain}`;
  }
}

export function writeGoogtransCookie(language: string) {
  const code = normalizeLanguage(language);

  if (code === DEFAULT_LANGUAGE) {
    clearGoogtransCookie();
    return;
  }

  // Google expects `/source/target`, e.g. `/en/fr`.
  writeGoogtransValue(`/en/${code}`);
}

export function languageFromGoogtransCookie(): string | null {
  const cookie = readCookie(GOOGTRANS_COOKIE);
  if (!cookie) return null;

  const target = cookie.split("/").filter(Boolean).pop();
  return target ? toSupportedLanguage(target) : null;
}

function readStoredLanguage(): string | null {
  if (!isBrowser()) return null;

  try {
    return toSupportedLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function preferredBrowserLanguage(): string {
  if (!isBrowser() || !navigator.language) return DEFAULT_LANGUAGE;

  const candidates =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

  for (const candidate of candidates) {
    const supported = toSupportedLanguage(candidate);
    if (supported) return supported;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Language selection order:
 *   1. `?lang=fr` (e.g. a link handed over from the marketing site)
 *   2. the shared `googtrans` cookie (what the marketing site writes)
 *   3. the choice previously made inside the dashboard
 *   4. the browser's preferred language
 */
export function readLanguagePreference(): string {
  if (!isBrowser()) return DEFAULT_LANGUAGE;

  const queryLanguage = toSupportedLanguage(
    new URLSearchParams(window.location.search).get("lang"),
  );
  if (queryLanguage) return queryLanguage;

  const cookieLanguage = languageFromGoogtransCookie();
  if (cookieLanguage) return cookieLanguage;

  const storedLanguage = readStoredLanguage();
  if (storedLanguage) return storedLanguage;

  return preferredBrowserLanguage();
}

export function persistLanguage(language: string, remember = true): string {
  const code = normalizeLanguage(language);

  if (remember && isBrowser()) {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // localStorage may be unavailable in private mode.
    }
  }

  writeGoogtransCookie(code);
  return code;
}

/** Remove the one-shot `?lang=` parameter after it has been applied. */
export function clearLanguageQueryParam() {
  if (!isBrowser()) return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has("lang")) return;

  url.searchParams.delete("lang");
  window.history.replaceState(window.history.state, "", url.toString());
}
