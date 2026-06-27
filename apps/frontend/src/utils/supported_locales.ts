export const supportedLocales = [
  "en",
  "fr",
] as const satisfies readonly string[];

export type SupportedLocale = (typeof supportedLocales)[number];

export const DEFAULT_FALLBACK: SupportedLocale = "en";
