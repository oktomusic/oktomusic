import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";
import { plural } from "@lingui/core/macro";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";
import { DurationLong } from "../../components/DurationLong";

import "./Album.css";

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

  const albumTracksTotal = data!.album.tracksByDisc.reduce(
    (acc, disc) => acc + disc.length,
    0,
  );
  const albumDurationMs = data!.album.tracksByDisc
    .flat()
    .reduce((acc, track) => acc + track.durationMs, 0);

  return (
    <div className="w-full">
      <div className="album-banner flex h-80 w-full items-end p-6">
        <div className="flex flex-row gap-6">
          <img
            src={`/api/album/${data!.album.id}/cover/1280`}
            alt={data!.album.name}
            className="max-h-56 max-w-56 rounded-lg shadow-2xl/50"
          />
          <div className="flex flex-col justify-end gap-2">
            <h2 className="text-7xl font-bold">{data!.album.name}</h2>
            <div className="text-sm">
              <span className="font-bold">
                {data!.album.artists.map((artist, index) => (
                  <span key={artist.id ?? index}>
                    <a href="#" className="hover:underline">
                      {artist.name}
                    </a>
                    {index < (data!.album.artists.length ?? 0) - 1 && ", "}
                  </span>
                ))}
              </span>
              <span className="mx-2">•</span>
              <span title={data!.album.date?.toLocaleDateString() ?? ""}>
                {data!.album.date?.getFullYear()}
              </span>
              <span className="mx-2">•</span>
              <span>
                {plural(
                  { count: albumTracksTotal },
                  {
                    one: "# track",
                    other: "# tracks",
                  },
                )}
              </span>
              <span>, </span>
              <span>
                <DurationLong durationMs={albumDurationMs} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
