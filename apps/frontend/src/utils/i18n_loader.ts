import { i18n, type Messages } from "@lingui/core";
import type { SupportedLocale } from "./supported_locales";

export async function dynamicActivate(locale: SupportedLocale) {
  const { messages } = (await import(`./../locales/${locale}/messages.po`)) as {
    messages: Messages;
  };

  i18n.load(locale, messages);
  i18n.activate(locale);
}
