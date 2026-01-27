import { useQuery } from "@apollo/client/react";
import { useAtomValue } from "jotai";

import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { translatorSupportAtom } from "../atoms/app/browser_support";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";
import { useLyricsLanguageDetection } from "../hooks/use_language_detector";

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

  return (
    <div>
      {trackData.map((lyricLine, index) => (
        <p key={index}>{lyricLine.t}</p>
      ))}
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
