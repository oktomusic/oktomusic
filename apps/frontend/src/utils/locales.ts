import { t } from "@lingui/core/macro";

export const locales = [
  "en",
  "fr",
  "de",
  "it",
  "es",
  "pt",
  "ru",
] as const satisfies readonly string[];

export type Locale = (typeof locales)[number];

export function getLocales() {
  return {
    en: t`English`,
    fr: t`French`,
    de: t`German`,
    it: t`Italian`,
    es: t`Spanish`,
    pt: t`Portuguese`,
    ru: t`Russian`,
  } as const satisfies Record<Locale, string>;
}
