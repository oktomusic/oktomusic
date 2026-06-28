import { i18n, type Messages } from "@lingui/core";

import type { SupportedLocale } from "./supported_locales";

let activationSequence = 0;

export async function dynamicActivate(locale: SupportedLocale): Promise<boolean> {
  const nextSequence = ++activationSequence;
  const { messages } = (await import(`./../locales/${locale}/messages.po`)) as {
    messages: Messages;
  };

  if (nextSequence !== activationSequence) {
    return false;
  }

  i18n.load(locale, messages);
  i18n.activate(locale);

  return true;
}
