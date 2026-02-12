import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";

export default function Album() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(ALBUM_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  if (!cuid) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // TODO: 404 if no album found
  // TODO: album colors

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-full">
      <div className="h-80 w-full bg-zinc-700 p-6">
        <div className="flex flex-row gap-6">
          <img
            src={`/api/album/${data!.album.id}/cover/1280`}
            alt={data!.album.name}
            className="max-h-56 max-w-56 rounded-lg shadow-lg"
          />
          <div className="flex flex-col justify-end">
            <h2 className="text-3xl font-bold">{data!.album.name}</h2>
            <span>{data!.album.date?.toDateString()}</span>
          </div>
        </div>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
