import supportedLocales, { type SupportedLocale } from "./supported_locales";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

export function getLanguage(): SupportedLocale {
  const lang = navigator.language ?? "en";
  const sanitizedLang = lang.split("-")[0];
  return isSupportedLocale(sanitizedLang) ? sanitizedLang : "en";
}
