import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";

import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { SEARCH_ALBUMS_QUERY } from "../../api/graphql/queries/search";
import { AlbumCardList } from "../../components/Base/AlbumCardList";

export function Artist() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(SEARCH_ALBUMS_QUERY, {
    variables: {
      input: {
        artistId: cuid ?? undefined,
      },
    },
    skip: !cuid,
  });

  if (!cuid) {
    return null;
  }

  if (loading) {
    return <GenericLoading />;
  }

  if (error) {
    return <GenericGraphQLError error={error} />;
  }

  const albums = data?.searchAlbums ?? [];

  return (
    <div className="w-full p-6">
      <h2 className="pb-4 text-2xl font-bold">Albums</h2>
      {albums.length === 0 ? (
        <div className="p-6">No albums found</div>
      ) : (
        <AlbumCardList albums={albums} />
      )}
    </div>
  );
}
