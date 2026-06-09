import { detect, fromStorage, fromNavigator } from "@lingui/detect-locale";

import supportedLocales, { type SupportedLocale } from "./supported_locales";
import { applicationLanguageLocalStorageKey } from "../atoms/app/settings_client.ts";
import { DEFAULT_FALLBACK } from "./default_language_fallback.ts";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

export function setLanguageInLocalStorage(lang: SupportedLocale) {
  localStorage.setItem(applicationLanguageLocalStorageKey, lang);
}

export function getLanguage(): SupportedLocale {
  const lang =
    detect(
      fromStorage(applicationLanguageLocalStorageKey),
      fromNavigator(),
      DEFAULT_FALLBACK,
    ) ?? DEFAULT_FALLBACK;
  const sanitizedLang = lang.split("-")[0];
  return isSupportedLocale(sanitizedLang) ? sanitizedLang : DEFAULT_FALLBACK;
}
