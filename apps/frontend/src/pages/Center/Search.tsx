import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { t } from "@lingui/core/macro";
import { useSearchParams } from "react-router";

import {
  SearchMusicInput,
  type SearchMusicQuery,
} from "../../api/graphql/gql/graphql";
import { SEARCH_MUSIC_QUERY } from "../../api/graphql/queries/search";
import { type TrackWithAlbum } from "../../atoms/player/machine";
import { AlbumCardList } from "../../components/Base/AlbumCardList";
import { ArtistCardList } from "../../components/Base/ArtistCardList";
import { PlaylistCardList } from "../../components/Base/PlaylistCardList";
import { TrackList } from "../../components/TrackList/TrackList";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { GenericLoading } from "./GenericLoading";

const SEARCH_TYPE_VALUES = [
  "all",
  "track",
  "album",
  "artist",
  "playlist",
] as const;
type SearchType = (typeof SEARCH_TYPE_VALUES)[number];

const SEARCH_LIMITS = {
  all: 10,
  tracks: 25,
  albums: 25,
  artists: 25,
  playlists: 25,
} as const;

type SearchTrack = SearchMusicQuery["search"]["tracks"][number];

const isSearchType = (value: string | null): value is SearchType =>
  value !== null && SEARCH_TYPE_VALUES.includes(value as SearchType);

const toTrackWithAlbum = (track: SearchTrack): TrackWithAlbum | null => {
  if (!track.album) {
    return null;
  }

  return {
    __typename: "Track",
    id: track.id,
    name: track.name,
    flacFileId: track.flacFileId,
    hasLyrics: track.hasLyrics,
    trackNumber: track.trackNumber,
    discNumber: track.discNumber,
    durationMs: track.durationMs,
    artists: track.artists,
    albumId: track.album.id,
    album: track.album,
    date: null,
    isrc: null,
    lyrics: null,
  };
};

/**
 * Search params:
 * - q: string (search query)
 * - type: "all" | "album" | "artist" | "track" | "playlist" (optional, defaults to "all")
 */
export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const query = queryParam.trim();
  const typeParam = searchParams.get("type");
  const searchTypeOptions = [
    { value: "all", label: t`All` },
    { value: "track", label: t`Tracks` },
    { value: "album", label: t`Albums` },
    { value: "artist", label: t`Artists` },
    { value: "playlist", label: t`Playlists` },
  ] as const;
  const type: SearchType = isSearchType(typeParam) ? typeParam : "all";

  const searchName = query.length > 0 ? query : undefined;

  const handleTypeChange = (groupValue: string[]) => {
    const nextType = isSearchType(groupValue[0] ?? null)
      ? groupValue[0]
      : "all";
    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextType === "all") {
      nextSearchParams.delete("type");
    } else {
      nextSearchParams.set("type", nextType);
    }
    setSearchParams(nextSearchParams);
  };

  const isAllType = type === "all";
  const isTrackType = type === "track";
  const isAlbumType = type === "album";
  const isArtistType = type === "artist";
  const isPlaylistType = type === "playlist";

  const includeTracks = isAllType || isTrackType;
  const includeAlbums = isAllType || isAlbumType;
  const includeArtists = isAllType || isArtistType;
  const includePlaylists = isAllType || isPlaylistType;

  const searchVariables = useMemo(
    () =>
      ({
        input: {
          trackName: includeTracks ? searchName : undefined,
          albumName: includeAlbums ? searchName : undefined,
          artistName: includeArtists ? searchName : undefined,
          playlistName: includePlaylists ? searchName : undefined,
          includeTracks,
          includeAlbums,
          includeArtists,
          includePlaylists,
          trackLimit: includeTracks
            ? isAllType
              ? SEARCH_LIMITS.all
              : SEARCH_LIMITS.tracks
            : undefined,
          albumLimit: includeAlbums
            ? isAllType
              ? SEARCH_LIMITS.all
              : SEARCH_LIMITS.albums
            : undefined,
          artistLimit: includeArtists
            ? isAllType
              ? SEARCH_LIMITS.all
              : SEARCH_LIMITS.artists
            : undefined,
          playlistLimit: includePlaylists
            ? isAllType
              ? SEARCH_LIMITS.all
              : SEARCH_LIMITS.playlists
            : undefined,
        },
      }) satisfies { readonly input: SearchMusicInput },
    [
      includeAlbums,
      includeArtists,
      includePlaylists,
      includeTracks,
      isAllType,
      searchName,
    ],
  );

  const { data, previousData, loading, error } = useQuery(SEARCH_MUSIC_QUERY, {
    variables: searchVariables,
    notifyOnNetworkStatusChange: true,
  });

  const searchResults = data ?? previousData;

  const tracksWithAlbum = useMemo(
    () =>
      (searchResults?.search.tracks ?? [])
        .map((track) => toTrackWithAlbum(track))
        .filter((track): track is TrackWithAlbum => track !== null),
    [searchResults],
  );

  const albums = searchResults?.search.albums ?? [];
  const artists = searchResults?.search.artists ?? [];
  const playlists = searchResults?.search.playlists ?? [];

  const isRefreshing = loading && searchResults !== undefined;
  const showLoadingState = loading && searchResults === undefined;

  const hasTrackResults = tracksWithAlbum.length > 0;
  const hasAlbumResults = albums.length > 0;
  const hasArtistResults = artists.length > 0;
  const hasPlaylistResults = playlists.length > 0;

  return (
    <div className="w-full p-6">
      <div className="mb-4 flex w-full flex-row flex-wrap items-center gap-3">
        <ToggleGroup
          className="flex flex-row flex-wrap gap-2"
          value={[type]}
          onValueChange={handleTypeChange}
          aria-label={t`Search type`}
        >
          {searchTypeOptions.map((option) => (
            <Toggle
              key={option.value}
              value={option.value}
              className="h-8 rounded bg-zinc-700 px-4 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 data-pressed:bg-zinc-200 data-pressed:text-zinc-900"
            >
              {option.label}
            </Toggle>
          ))}
        </ToggleGroup>
        {isRefreshing || showLoadingState ? (
          <div
            className="flex items-center gap-2 text-sm text-zinc-300"
            role="status"
            aria-live="polite"
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500/40 border-t-zinc-200"
            />
            {t`Updating results`}
          </div>
        ) : null}
      </div>

      {showLoadingState ? (
        <GenericLoading />
      ) : isAllType ? (
        error && !searchResults ? (
          <GenericGraphQLError error={error} />
        ) : (
          <div className="flex flex-col gap-8" aria-busy={isRefreshing}>
            <section aria-labelledby="search-tracks">
              <h3 id="search-tracks" className="pb-3 text-xl font-semibold">
                {t`Tracks`}
              </h3>
              {tracksWithAlbum.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  {t`No tracks found`}
                </div>
              ) : (
                <TrackList
                  tracks={[tracksWithAlbum]}
                  displayCover={true}
                  playMode="manual"
                  droppableId={`search:all:${query || "all"}`}
                />
              )}
            </section>
            <section aria-labelledby="search-albums">
              <h3 id="search-albums" className="pb-3 text-xl font-semibold">
                {t`Albums`}
              </h3>
              {albums.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  {t`No albums found`}
                </div>
              ) : (
                <AlbumCardList albums={albums} />
              )}
            </section>
            <section aria-labelledby="search-artists">
              <h3 id="search-artists" className="pb-3 text-xl font-semibold">
                {t`Artists`}
              </h3>
              {artists.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  {t`No artists found`}
                </div>
              ) : (
                <ArtistCardList artists={artists} />
              )}
            </section>
            <section aria-labelledby="search-playlists">
              <h3 id="search-playlists" className="pb-3 text-xl font-semibold">
                {t`Playlists`}
              </h3>
              {playlists.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  {t`No playlists found`}
                </div>
              ) : (
                <PlaylistCardList playlists={playlists} />
              )}
            </section>
          </div>
        )
      ) : isTrackType ? (
        error && !searchResults ? (
          <GenericGraphQLError error={error} />
        ) : hasTrackResults ? (
          <TrackList
            tracks={[tracksWithAlbum]}
            displayCover={true}
            playMode="manual"
            droppableId={`search:tracks:${query || "all"}`}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
            {t`No tracks found`}
          </div>
        )
      ) : isAlbumType ? (
        error && !searchResults ? (
          <GenericGraphQLError error={error} />
        ) : hasAlbumResults ? (
          <AlbumCardList albums={albums} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
            {t`No albums found`}
          </div>
        )
      ) : isArtistType ? (
        error && !searchResults ? (
          <GenericGraphQLError error={error} />
        ) : hasArtistResults ? (
          <ArtistCardList artists={artists} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
            {t`No artists found`}
          </div>
        )
      ) : error && !searchResults ? (
        <GenericGraphQLError error={error} />
      ) : hasPlaylistResults ? (
        <PlaylistCardList playlists={playlists} />
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
          {t`No playlists found`}
        </div>
      )}
    </div>
  );
}
