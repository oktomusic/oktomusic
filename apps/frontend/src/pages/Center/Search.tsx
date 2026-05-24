import { useQuery } from "@apollo/client/react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { t } from "@lingui/core/macro";
import { useSearchParams } from "react-router";

import { SEARCH_ALBUMS_QUERY } from "../../api/graphql/queries/search";
import { AlbumCardList } from "../../components/Base/AlbumCardList";

/**
 * Search params:
 * - q: string (search query)
 * - type: "all" | "album" | "artist" | "track" | "playlist" (optional, defaults to "all")
 */
export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type");
  const searchTypeOptions = [
    { value: "all", label: t`All` },
    { value: "track", label: t`Tracks` },
    { value: "album", label: t`Albums` },
    { value: "artist", label: t`Artists` },
    { value: "playlist", label: t`Playlists` },
  ] as const;
  const type =
    searchTypeOptions.find((option) => option.value === typeParam)?.value ??
    "all";

  const handleTypeChange = (groupValue: string[]) => {
    const nextType =
      searchTypeOptions.find((option) => option.value === groupValue[0])
        ?.value ?? "all";
    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextType === "all") {
      nextSearchParams.delete("type");
    } else {
      nextSearchParams.set("type", nextType);
    }
    setSearchParams(nextSearchParams);
  };

  const { data, loading, error } = useQuery(SEARCH_ALBUMS_QUERY, {
    variables: {
      input: {
        name: query || undefined,
      },
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const albums = data?.searchAlbums ?? [];

  return (
    <div className="w-full p-6">
      <ToggleGroup
        className="mb-4 flex w-full flex-row flex-wrap gap-2"
        value={[type]}
        onValueChange={handleTypeChange}
        aria-label={t`Search type`}
      >
        {searchTypeOptions.map((option) => (
          <Toggle
            key={option.value}
            value={option.value}
            className="h-8 rounded bg-zinc-700 px-4 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 data-pressed:bg-zinc-200 data-pressed:text-zinc-900"
          >
            {option.label}
          </Toggle>
        ))}
      </ToggleGroup>
      <h2 className="pb-4 text-2xl font-bold">
        {query ? `Search results for "${query}"` : "All Albums"}
      </h2>
      {albums.length === 0 ? (
        <div className="p-6">No albums found</div>
      ) : (
        <AlbumCardList albums={albums} />
      )}
    </div>
  );
}
