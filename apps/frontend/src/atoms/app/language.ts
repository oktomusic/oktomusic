import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import {
  DEFAULT_FALLBACK,
  getLanguage,
  SupportedLocale,
} from "../../utils/supported_locales";
import { dynamicActivate } from "../../utils/i18n_loader";

// Application language

export const applicationLanguageLocalStorageKey = "oktomusic:lang";

export const applicationLanguage = atomWithStorage<SupportedLocale>(
  applicationLanguageLocalStorageKey,
  DEFAULT_FALLBACK,
  undefined,
  {
    getOnInit: true,
  },
);

export const applicationLanguageLoading = atom(false);

export const applicationLanguageReady = atom(false);

export const bootstrapLocaleAtom = atom(null, async (get, set) => {
  const locale = get(applicationLanguage);

  set(applicationLanguageLoading, true);

  try {
    await dynamicActivate(locale);
    set(applicationLanguageReady, true);
  } finally {
    set(applicationLanguageLoading, false);
  }
});

export const changeLanguageAtom = atom(
  null,
  async (get, set, nextLanguage: SupportedLocale) => {
    nextLanguage = getLanguage(nextLanguage);

    if (nextLanguage === get(applicationLanguage)) {
      return;
    }

    set(applicationLanguageLoading, true);

    try {
      const activated = await dynamicActivate(nextLanguage);

      if (activated) {
        set(applicationLanguage, nextLanguage);
      } else {
        console.log(`Not activated ${nextLanguage}`);
      }
    } finally {
      set(applicationLanguageLoading, false);
    }
  },
);
