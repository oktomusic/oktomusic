import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorLike } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";
import { LuCheck, LuDownload, LuLoaderCircle } from "react-icons/lu";
import { t } from "@lingui/core/macro";

import { translatorSupportAtom } from "../atoms/app/browser_support";
import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";
import { LyricsLine } from "../api/graphql/gql/graphql";
import { OktoListboxOption } from "../components/Base/OktoListbox";
import { useLyricsLanguageDetection } from "./use_language_detector";
import { useLyricsTranslation } from "./use_translator";
import { useTranslatorAvailability } from "./use_translator_availability";
import { getLocales, Locale } from "../utils/locales";

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
  readonly translatorSupport: boolean;
  readonly language: PanelOverlayLanguage;
  readonly setLanguage: (language: PanelOverlayLanguage) => void;
  readonly languageOptions: Record<string, OktoListboxOption>;
  readonly showTranslationSpinner: boolean;
  readonly translatedLyrics: ReadonlyArray<string> | null;
  readonly lyrics: ReadonlyArray<LyricsLine>;
  readonly lyricsLoading: boolean;
  readonly lyricsError: ErrorLike | undefined;
}

export function usePanelOverlayTranslation(): PanelOverlayTranslationState {
  const translatorSupport = useAtomValue(translatorSupportAtom);
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
    enabled: translatorSupport,
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
  const targetLanguages = useMemo(
    () => Object.keys(localeLabels) as Locale[],
    [localeLabels],
  );

  const availabilityState = useTranslatorAvailability({
    enabled:
      translatorSupport &&
      languageDetectionState.status === "ready" &&
      Boolean(languageDetectionState.detectedLanguage),
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguages,
    refreshTrigger: availabilityRefreshKey,
  });

  const translationState = useLyricsTranslation({
    enabled:
      translatorSupport &&
      language !== "original" &&
      languageDetectionState.detectedLanguage !== null,
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguage: language === "original" ? "" : language,
    lyrics,
    preservePreviousTranslation: true,
  });

  const languageOptions = useMemo<Record<string, OktoListboxOption>>(() => {
    const baseOptions = {
      original: {
        label: t`Original`,
        icon: undefined,
      },
    } as const satisfies Record<string, OktoListboxOption>;

    if (
      !translatorSupport ||
      languageDetectionState.status !== "ready" ||
      !languageDetectionState.detectedLanguage
    ) {
      return baseOptions;
    }

    const translatedOptions: Record<string, OktoListboxOption> = {};

    for (const [targetLanguage, label] of Object.entries(localeLabels) as [
      Locale,
      string,
    ][]) {
      if (targetLanguage === languageDetectionState.detectedLanguage) {
        continue;
      }

      const availability =
        availabilityState.availabilityByLocale[targetLanguage];
      const downloadKey = `${languageDetectionState.detectedLanguage}:${targetLanguage}`;
      const isDownloaded = downloadedLanguages[downloadKey] === true;

      if (availability === "unavailable") {
        continue;
      }

      if (isDownloaded || availability === "available") {
        translatedOptions[targetLanguage] = { label, icon: undefined };
        continue;
      }

      if (availability === "downloadable") {
        translatedOptions[targetLanguage] = { label, icon: LuDownload };
        continue;
      }

      if (availability === "downloading") {
        translatedOptions[targetLanguage] = {
          label,
          icon: (props: Parameters<typeof LuLoaderCircle>[0]) => (
            <LuLoaderCircle
              {...props}
              className={`${props.className ?? ""} animate-spin`.trim()}
            />
          ),
        };
        continue;
      }

      if (availability === undefined) {
        continue;
      }

      translatedOptions[targetLanguage] = { label, icon: LuCheck };
    }

    return {
      ...baseOptions,
      ...translatedOptions,
    };
  }, [
    availabilityState.availabilityByLocale,
    downloadedLanguages,
    languageDetectionState.detectedLanguage,
    languageDetectionState.status,
    localeLabels,
    translatorSupport,
  ]);

  useEffect(() => {
    if (language in languageOptions) {
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
    translatorSupport,
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
