import { useSearchParams } from "react-router";
import { useQuery } from "@apollo/client/react";

import { SEARCH_ALBUMS_QUERY } from "../../api/graphql/queries/search";
import { AlbumCardList } from "../../components/Base/AlbumCardList";

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

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
