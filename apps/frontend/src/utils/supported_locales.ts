export const supportedLocales = ["en", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export default supportedLocales;
