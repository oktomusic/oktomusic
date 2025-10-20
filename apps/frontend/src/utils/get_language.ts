import { detect, fromStorage, fromNavigator } from "@lingui/detect-locale";

import supportedLocales, { type SupportedLocale } from "./supported_locales";

const DEFAULT_FALLBACK = "en";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

export function getLanguage(): SupportedLocale {
  const lang =
    detect(fromStorage("lang"), fromNavigator(), DEFAULT_FALLBACK) ??
    DEFAULT_FALLBACK;
  const sanitizedLang = lang.split("-")[0];
  return isSupportedLocale(sanitizedLang) ? sanitizedLang : DEFAULT_FALLBACK;
}
