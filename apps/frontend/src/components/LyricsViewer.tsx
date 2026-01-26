import { useAtomValue } from "jotai";
import { useQuery } from "@apollo/client/react";

import { playerQueueCurrentTrack } from "../atoms/player/machine";
import { TRACK_LYRICS_QUERY } from "../api/graphql/queries/trackLyrics";

export default function LyricsViewer() {
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const shouldFetchLyrics = Boolean(currentTrack && currentTrack.hasLyrics);

  const queryResult = useQuery(TRACK_LYRICS_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !shouldFetchLyrics,
    variables: { id: currentTrack?.id ?? "" },
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

  if (
    !queryResult.data ||
    !queryResult.data.track ||
    !queryResult.data.track.lyrics
  ) {
    return <div>No lyrics found for this track</div>;
  }

  const trackData = queryResult.data.track.lyrics;

  return (
    <div>
      {trackData.map((lyricLine, index) => (
        <p key={index}>{lyricLine.t}</p>
      ))}
    </div>
  );
}
