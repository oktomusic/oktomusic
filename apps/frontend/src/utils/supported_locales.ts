export const supportedLocales = [
  "en",
  "fr",
] as const satisfies readonly string[];

export type SupportedLocale = (typeof supportedLocales)[number];

export const DEFAULT_FALLBACK: SupportedLocale = "en";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

export function getLanguage(lang: string): SupportedLocale {
  const sanitizedLang = lang.split("-")[0];
  return isSupportedLocale(sanitizedLang) ? sanitizedLang : DEFAULT_FALLBACK;
}
