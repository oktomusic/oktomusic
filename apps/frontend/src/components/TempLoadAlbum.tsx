import { useState } from "react";
import { Link } from "react-router";
import { useLazyQuery } from "@apollo/client/react";
import { useSetAtom } from "jotai";

import { ALBUM_QUERY } from "../api/graphql/queries/album";
import type {
  AlbumBasic,
  AlbumQuery,
  AlbumQueryVariables,
} from "../api/graphql/gql/graphql";
import { playerQueueAtom, type TrackWithAlbum } from "../atoms/player/machine";

export default function TempLoadAlbum() {
  const [albumId, setAlbumId] = useState("hlh8iz7vwkwl8r4hmopu5kx8");
  const [lastLoadedAlbum, setLastLoadedAlbum] = useState<string | null>(null);

  const setQueue = useSetAtom(playerQueueAtom);

  const [loadAlbum, { loading, error }] = useLazyQuery<
    AlbumQuery,
    AlbumQueryVariables
  >(ALBUM_QUERY, { fetchPolicy: "network-only" });

  const handleLoadAlbum = async (id: string) => {
    const result = await loadAlbum({ variables: { id } });

    if (!result.data) {
      return;
    }

    const album = result.data.album;
    const albumBasic: AlbumBasic = {
      __typename: "AlbumBasic",
      id: album.id,
      name: album.name,
      date: album.date,
      artists: album.artists,
      coverColorVibrant: album.coverColorVibrant,
      coverColorDarkVibrant: album.coverColorDarkVibrant,
      coverColorLightVibrant: album.coverColorLightVibrant,
      coverColorMuted: album.coverColorMuted,
      coverColorDarkMuted: album.coverColorDarkMuted,
      coverColorLightMuted: album.coverColorLightMuted,
    };

    const nextQueue: TrackWithAlbum[] = album.tracksByDisc.flatMap((disc) =>
      disc.map((track) => ({
        ...track,
        albumId: album.id,
        album: albumBasic,
        date: null,
        lyrics: null,
        isrc: null,
      })),
    );

    setQueue((prev) => [...prev, ...nextQueue]);
    setLastLoadedAlbum(album.name);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = albumId.trim();
        if (!trimmed) return;
        void handleLoadAlbum(trimmed);
      }}
      className="flex flex-row gap-2"
    >
      <label htmlFor="temp-load-album-id">Album ID:</label>
      <input
        id="temp-load-album-id"
        type="text"
        value={albumId}
        onChange={(e) => setAlbumId(e.target.value)}
      />
      <button
        className="rounded-lg bg-zinc-700"
        type="submit"
        disabled={!albumId.trim() || loading}
      >
        {loading ? "Loading…" : "Load"}
      </button>
      {error ? <div role="alert">{error.message}</div> : null}
      {lastLoadedAlbum ? (
        <div aria-live="polite">Added {lastLoadedAlbum} to queue</div>
      ) : null}
      <Link to={`/album/${albumId.trim()}`} className="rounded-lg bg-zinc-700">
        View Album
      </Link>
    </form>
  );
}
