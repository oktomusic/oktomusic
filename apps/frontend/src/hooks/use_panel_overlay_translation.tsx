import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { useAtomValue } from "jotai";
import { LuCheck, LuDownload, LuLoaderCircle } from "react-icons/lu";

import { translatorSupportAtom } from "../atoms/app/browser_support";
import { settingClientLyricsTranslationEnabled } from "../atoms/app/settings_client";
import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";
import { LyricsLine } from "../api/graphql/gql/graphql";
import { OktoListboxItem } from "../components/Base/OktoListbox";
import { useLyricsLanguageDetection } from "./use_language_detector";
import { useLyricsTranslation } from "./use_translator";
import { useTranslatorAvailability } from "./use_translator_availability";
import { getLocales, Locale, locales } from "../utils/locales";

export type PanelOverlayLanguage = "original" | Locale;

interface TranslationStatus {
  readonly status:
    | "idle"
    | "loading"
    | "downloading"
    | "translating"
    | "ready"
    | "error";
  readonly translatedLyrics: ReadonlyArray<string> | null;
}

export interface PanelOverlayTranslationState {
  readonly translationEnabled: boolean;
  readonly language: PanelOverlayLanguage;
  readonly setLanguage: (language: PanelOverlayLanguage) => void;
  readonly languageOptions: readonly OktoListboxItem<PanelOverlayLanguage>[];
  readonly showTranslationSpinner: boolean;
  readonly translatedLyrics: ReadonlyArray<string> | null;
  readonly lyrics: ReadonlyArray<LyricsLine>;
  readonly lyricsLoading: boolean;
  readonly lyricsError: ErrorLike | undefined;
}

export function usePanelOverlayTranslation(): PanelOverlayTranslationState {
  const translatorSupport = useAtomValue(translatorSupportAtom);
  const translationEnabledSetting = useAtomValue(
    settingClientLyricsTranslationEnabled,
  );
  const translationEnabled = translatorSupport && translationEnabledSetting;
  const currentTrack = useAtomValue(playerQueueCurrentTrack);

  const shouldFetchLyrics = Boolean(currentTrack && currentTrack.hasLyrics);

  const queryResult = useQuery(TRACK_LYRICS_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !shouldFetchLyrics,
    variables: { id: currentTrack?.id ?? "" },
  });

  const lyrics = queryResult.data?.track?.lyrics ?? [];

  const languageDetectionState = useLyricsLanguageDetection({
    enabled: translationEnabled,
    lyrics,
  });

  const [language, setLanguage] = useState<PanelOverlayLanguage>("original");
  const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);
  const [downloadedLanguages, setDownloadedLanguages] = useState<
    Partial<Record<string, true>>
  >({});
  const previousTranslationStatusRef =
    useRef<TranslationStatus["status"]>("idle");

  const localeLabels = useMemo(() => getLocales(), []);

  const availabilityState = useTranslatorAvailability({
    enabled:
      translationEnabled &&
      languageDetectionState.status === "ready" &&
      Boolean(languageDetectionState.detectedLanguage),
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguages: locales,
    refreshTrigger: availabilityRefreshKey,
  });

  const translationState = useLyricsTranslation({
    enabled:
      translationEnabled &&
      language !== "original" &&
      languageDetectionState.detectedLanguage !== null,
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguage: language === "original" ? "" : language,
    lyrics,
    preservePreviousTranslation: true,
  });

  const languageOptions = useMemo<
    readonly OktoListboxItem<PanelOverlayLanguage>[]
  >(() => {
    const options: OktoListboxItem<PanelOverlayLanguage>[] = [
      {
        value: "original",
        label: t`Original`,
      },
    ];

    if (
      !translationEnabled ||
      languageDetectionState.status !== "ready" ||
      !languageDetectionState.detectedLanguage
    ) {
      return options;
    }

    for (const targetLanguage of locales) {
      if (targetLanguage === languageDetectionState.detectedLanguage) {
        continue;
      }

      const label = localeLabels[targetLanguage];
      const availability =
        availabilityState.availabilityByLocale[targetLanguage];
      const downloadKey = `${languageDetectionState.detectedLanguage}:${targetLanguage}`;
      const isDownloaded = downloadedLanguages[downloadKey] === true;

      if (availability === "unavailable" || availability === undefined) {
        continue;
      }

      if (isDownloaded || availability === "available") {
        options.push({ value: targetLanguage, label });
        continue;
      }

      if (availability === "downloadable") {
        options.push({ value: targetLanguage, label, icon: LuDownload });
        continue;
      }

      if (availability === "downloading") {
        options.push({
          value: targetLanguage,
          label,
          icon: (iconProps) => (
            <LuLoaderCircle
              {...iconProps}
              className={`${iconProps.className ?? ""} animate-spin`.trim()}
            />
          ),
        });
        continue;
      }

      options.push({ value: targetLanguage, label, icon: LuCheck });
    }

    return options;
  }, [
    availabilityState.availabilityByLocale,
    downloadedLanguages,
    languageDetectionState.detectedLanguage,
    languageDetectionState.status,
    localeLabels,
    translationEnabled,
  ]);

  useEffect(() => {
    if (languageOptions.some((option) => option.value === language)) {
      return;
    }

    queueMicrotask(() => {
      setLanguage("original");
    });
  }, [language, languageOptions]);

  useEffect(() => {
    const previousStatus = previousTranslationStatusRef.current;

    if (
      language !== "original" &&
      previousStatus === "downloading" &&
      translationState.status === "ready"
    ) {
      queueMicrotask(() => {
        setAvailabilityRefreshKey((current) => current + 1);
      });
    }

    previousTranslationStatusRef.current = translationState.status;
  }, [language, translationState.status]);

  useEffect(() => {
    if (
      language === "original" ||
      translationState.status !== "ready" ||
      !languageDetectionState.detectedLanguage
    ) {
      return;
    }

    const downloadKey = `${languageDetectionState.detectedLanguage}:${language}`;
    queueMicrotask(() => {
      setDownloadedLanguages((current) =>
        current[downloadKey] === true
          ? current
          : { ...current, [downloadKey]: true },
      );
    });
  }, [
    language,
    languageDetectionState.detectedLanguage,
    translationState.status,
  ]);

  const showTranslationSpinner =
    language !== "original" &&
    (translationState.status === "loading" ||
      translationState.status === "downloading" ||
      translationState.status === "translating");

  return {
    translationEnabled,
    language,
    setLanguage,
    languageOptions,
    showTranslationSpinner,
    translatedLyrics: translationState.translatedLyrics,
    lyrics,
    lyricsLoading: queryResult.loading,
    lyricsError: queryResult.error,
  };
}
