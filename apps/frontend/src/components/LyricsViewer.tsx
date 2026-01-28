import { useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";

import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { translatorSupportAtom } from "../atoms/app/browser_support";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";
import { useLyricsLanguageDetection } from "../hooks/use_language_detector";
import { useLyricsTranslation } from "../hooks/use_translator";

const TARGET_LANGUAGE = "fr";

export default function LyricsViewer() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const shouldFetchLyrics = Boolean(currentTrack && currentTrack.hasLyrics);
  const translatorAvailable = useAtomValue(translatorSupportAtom);

  const queryResult = useQuery(TRACK_LYRICS_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !shouldFetchLyrics,
    variables: { id: currentTrack?.id ?? "" },
  });

  const trackData = queryResult.data?.track?.lyrics ?? [];
  const languageDetectionState = useLyricsLanguageDetection({
    enabled: translatorAvailable,
    lyrics: trackData,
  });

  const translationState = useLyricsTranslation({
    enabled: translatorAvailable && languageDetectionState.status === "ready",
    sourceLanguage: languageDetectionState.detectedLanguage,
    targetLanguage: TARGET_LANGUAGE,
    lyrics: trackData,
  });

  if (!currentTrack) {
    return <div>No track selected</div>;
  }

  if (currentTrack.hasLyrics === false) {
    return <div>No lyrics available for this track</div>;
  }

  if (queryResult.loading) {
    return <div>Loading lyrics...</div>;
  }

  if (queryResult.error) {
    return <div>Error loading lyrics: {queryResult.error.message}</div>;
  }

  if (!queryResult.data?.track?.lyrics || trackData.length === 0) {
    return <div>No lyrics found for this track</div>;
  }

  const showTranslation =
    translatorAvailable &&
    languageDetectionState.detectedLanguage !== null &&
    languageDetectionState.detectedLanguage !== TARGET_LANGUAGE;

  return (
    <div>
      <div
        className={`grid gap-4 ${showTranslation ? "grid-cols-2" : "grid-cols-1"}`}
      >
        <div>
          <h3>Original</h3>
          {trackData.map((lyricLine, index) => (
            <p key={index}>{lyricLine.t}</p>
          ))}
        </div>
        {showTranslation && (
          <div>
            <h3>Translation (French)</h3>
            {translationState.status === "loading" && (
              <p>Initializing translator...</p>
            )}
            {translationState.status === "downloading" && (
              <p>
                Downloading translation model...
                {translationState.downloadProgress !== null && (
                  <span> {translationState.downloadProgress}%</span>
                )}
              </p>
            )}
            {translationState.status === "translating" && (
              <p>Translating lyrics...</p>
            )}
            {translationState.status === "error" && (
              <p>Translation error: {translationState.error}</p>
            )}
            {translationState.status === "ready" &&
              translationState.translatedLyrics &&
              translationState.translatedLyrics.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        )}
      </div>
      <div>
        {translatorAvailable ? undefined : (
          <span>Translator is not available</span>
        )}
        {languageDetectionState.status === "loading" && (
          <span>Initializing language detector...</span>
        )}
        {languageDetectionState.status === "detecting" && (
          <span>Detecting language...</span>
        )}
        <br />
        {languageDetectionState.status === "ready" &&
          languageDetectionState.detectedLanguage && (
            <span>
              Detected language: {languageDetectionState.detectedLanguage}
            </span>
          )}
        {languageDetectionState.status === "error" && (
          <span>Language detection error: {languageDetectionState.error}</span>
        )}
      </div>
    </div>
  );
}
