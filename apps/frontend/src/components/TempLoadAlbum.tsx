import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { useSetAtom } from "jotai";

import { ALBUM_QUERY } from "../api/graphql/queries/album";
import type {
  AlbumBasic,
  AlbumQuery,
  AlbumQueryVariables,
} from "../api/graphql/gql/graphql";
import {
  playerQueueAtom,
  playerQueueIndexAtom,
  type TrackWithAlbum,
} from "../atoms/player/machine";

export default function TempLoadAlbum() {
  const [albumId, setAlbumId] = useState("nk9ibahx1zs4x76tgjlfla3y");

  const setQueue = useSetAtom(playerQueueAtom);
  const setQueueIndex = useSetAtom(playerQueueIndexAtom);

  const [loadAlbum, { data, loading, error }] = useLazyQuery<
    AlbumQuery,
    AlbumQueryVariables
  >(ALBUM_QUERY, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (!data) {
      return;
    }

    const album = data.album;
    const albumBasic: AlbumBasic = {
      id: album.id,
      name: album.name,
      artists: album.artists,
    };

    const nextQueue: TrackWithAlbum[] = album.tracksByDisc.flatMap((disc) =>
      disc.map((track) => ({
        ...track,
        albumId: album.id,
        album: albumBasic,
      })),
    );

    setQueue(nextQueue);
    setQueueIndex(0);
  }, [data, setQueue, setQueueIndex]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = albumId.trim();
        if (!trimmed) return;
        void loadAlbum({ variables: { id: trimmed } });
      }}
    >
      <label htmlFor="temp-load-album-id">Album ID</label>
      <input
        id="temp-load-album-id"
        type="text"
        value={albumId}
        onChange={(e) => setAlbumId(e.target.value)}
      />
      <button type="submit" disabled={!albumId.trim() || loading}>
        {loading ? "Loading…" : "Load"}
      </button>
      {error ? <div role="alert">{error.message}</div> : null}
      {data ? (
        <div aria-live="polite">
          Queue replaced with: {data.album.name} (
          {data.album.tracksByDisc.flat().length} tracks)
        </div>
      ) : null}
    </form>
  );
}
