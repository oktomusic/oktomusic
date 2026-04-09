import { useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";

import {
  playerPlaybackPositionAtom,
  playerQueueCurrentTrack,
} from "../atoms/player/machine";
import { settingClientLyricsDisplayMode } from "../atoms/app/settings_client";
// import { translatorSupportAtom } from "../atoms/app/browser_support";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";
// import { useLyricsLanguageDetection } from "../hooks/use_language_detector";
// import { useLyricsTranslation } from "../hooks/use_translator";
import { GenericLoading } from "../pages/Center/GenericLoading";
import { GenericGraphQLError } from "../pages/Center/GenericGraphQLError";
import { isCurrentLine, isWordPassed } from "../utils/lyrics";

// const TARGET_LANGUAGE = "fr";

export function LyricsViewer() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const currentPosition = useAtomValue(playerPlaybackPositionAtom);
  const shouldFetchLyrics = Boolean(currentTrack && currentTrack.hasLyrics);
  const lyricsDisplayMode = useAtomValue(settingClientLyricsDisplayMode);
  // const translatorAvailable = useAtomValue(translatorSupportAtom);

  const queryResult = useQuery(TRACK_LYRICS_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !shouldFetchLyrics,
    variables: { id: currentTrack?.id ?? "" },
  });

  const trackData = queryResult.data?.track?.lyrics ?? [];
  /*const languageDetectionState = useLyricsLanguageDetection({
    enabled: translatorAvailable,
    lyrics: trackData,
  });

  const translationState = useLyricsTranslation({
    enabled: translatorAvailable && languageDetectionState.status === "ready",
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguage: TARGET_LANGUAGE,
    lyrics: trackData,
  });*/

  if (!currentTrack) {
    return (
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{`No track selected`}</span>
      </div>
    );
  }

  if (currentTrack.hasLyrics === false) {
    return (
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{`No lyrics available for this track`}</span>
      </div>
    );
  }

  if (queryResult.loading) {
    return <GenericLoading />;
  }

  if (queryResult.error) {
    return <GenericGraphQLError error={queryResult.error} />;
  }

  // Theorically should never happen
  if (!queryResult.data?.track?.lyrics || trackData.length === 0) {
    return (
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{`No lyrics available for this track`}</span>
      </div>
    );
  }

  /*const showTranslation =
    translatorAvailable &&
    languageDetectionState.detectedLanguage !== null &&
    languageDetectionState.detectedLanguage !== TARGET_LANGUAGE;*/

  return (
    <div className="mt-12 mb-6 w-full">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div>
          {trackData.map((lyricLine, index) => {
            switch (lyricsDisplayMode) {
              case "word":
                return (
                  <div className="mb-7 flex flex-col gap-4">
                    <p className="lyrics-line text-5xl font-bold" key={index}>
                      {lyricLine.l.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className={`${
                            isWordPassed(currentPosition, lyricLine.ts, word)
                              ? "text-zinc-200/80"
                              : "text-zinc-200/40"
                          }`}
                        >
                          {word.c}
                        </span>
                      ))}
                    </p>
                  </div>
                );
              case "line":
                return (
                  <div className="mb-7 flex flex-col gap-4">
                    <p
                      className={`lyrics-line text-5xl font-bold ${isCurrentLine(currentPosition, lyricLine) ? "text-zinc-200" : "text-zinc-200/50"}`}
                      key={index}
                    >
                      {lyricLine.t}
                    </p>
                  </div>
                );
              case "static":
              default:
                return (
                  <div className="mb-7 flex flex-col gap-4">
                    <p
                      className="lyrics-line text-5xl font-bold text-zinc-200"
                      key={index}
                    >
                      {lyricLine.t}
                    </p>
                  </div>
                );
            }
          })}
        </div>
      </div>
    </div>
  );
}
