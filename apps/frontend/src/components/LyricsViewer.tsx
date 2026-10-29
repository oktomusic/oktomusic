import { ErrorLike } from "@apollo/client";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue } from "jotai";

import type { LyricsLine } from "../api/graphql/types";
import { settingClientLyricsDisplayMode } from "../atoms/app/settings_client";
import {
  playerPlaybackPositionAtom,
  playerQueueCurrentTrack,
} from "../atoms/player/machine";
import { GenericGraphQLError } from "../pages/Center/GenericGraphQLError";
import { GenericLoading } from "../pages/Center/GenericLoading";
import { Locale } from "../utils/locales";
import { isCurrentLine, isWordPassed } from "../utils/lyrics";

export interface LyricsViewerProps {
  readonly selectedLanguage: "original" | Locale;
  readonly sourceLanguage: string | null;
  readonly translatedLyrics: ReadonlyArray<string> | null;
  readonly lyrics: ReadonlyArray<LyricsLine>;
  readonly lyricsLoading: boolean;
  readonly lyricsError: ErrorLike | undefined;
}

export function LyricsViewer(props: LyricsViewerProps) {
  const { t } = useLingui();
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const currentPosition = useAtomValue(playerPlaybackPositionAtom);
  const lyricsDisplayMode = useAtomValue(settingClientLyricsDisplayMode);
  const trackData = props.lyrics;

  if (!currentTrack) {
    return (
      <div className="mx-4 flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{t`No track selected`}</span>
      </div>
    );
  }

  if (currentTrack.hasLyrics === false) {
    return (
      <div className="mx-4 flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{t`No lyrics available for this track`}</span>
      </div>
    );
  }

  if (props.lyricsLoading) {
    return <GenericLoading />;
  }

  if (props.lyricsError) {
    return <GenericGraphQLError error={props.lyricsError} />;
  }

  // Theorically should never happen
  if (trackData.length === 0) {
    return (
      <div className="mx-4 flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6">
        <span className="text-4xl font-bold">{t`No lyrics available for this track`}</span>
      </div>
    );
  }

  const showTranslation =
    props.selectedLanguage !== "original" && props.translatedLyrics !== null;

  return (
    <div className="mx-4 mt-12 mb-6 w-full">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div>
          {trackData.map((lyricLine, index) => {
            const translatedLine = props.translatedLyrics?.[index];

            switch (lyricsDisplayMode) {
              case "word":
                return (
                  <div className="mb-7 flex flex-col gap-4" key={index}>
                    <p
                      lang={props.sourceLanguage ?? ""}
                      className="lyrics-line text-5xl font-bold"
                    >
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
                    {showTranslation && (
                      <p
                        lang={props.selectedLanguage}
                        className="text-2xl text-zinc-200/45"
                      >
                        {translatedLine}
                      </p>
                    )}
                  </div>
                );
              case "line":
                return (
                  <div className="mb-7 flex flex-col gap-4" key={index}>
                    <p
                      lang={props.sourceLanguage ?? ""}
                      className={`lyrics-line text-5xl font-bold ${isCurrentLine(currentPosition, lyricLine) ? "text-zinc-200" : "text-zinc-200/50"}`}
                    >
                      {lyricLine.t}
                    </p>
                    {showTranslation && (
                      <p
                        lang={props.selectedLanguage}
                        className="text-2xl text-zinc-200/45"
                      >
                        {translatedLine}
                      </p>
                    )}
                  </div>
                );
              case "static":
              default:
                return (
                  <div className="mb-7 flex flex-col gap-4" key={index}>
                    <p
                      lang={props.sourceLanguage ?? ""}
                      className="lyrics-line text-5xl font-bold text-zinc-200"
                    >
                      {lyricLine.t}
                    </p>
                    {showTranslation && (
                      <p
                        lang={props.selectedLanguage}
                        className="text-2xl text-zinc-200/45"
                      >
                        {translatedLine}
                      </p>
                    )}
                  </div>
                );
            }
          })}
        </div>
      </div>
    </div>
  );
}
