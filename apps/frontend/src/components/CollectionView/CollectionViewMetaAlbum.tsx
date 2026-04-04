import { Link } from "react-router";
import { plural } from "@lingui/core/macro";
import { Temporal } from "temporal-polyfill";

import { DurationLong } from "../DurationLong";

interface CollectionViewArtist {
  readonly id: string;
  readonly name: string;
}

interface CollectionViewMetaAlbumProps {
  readonly artists: readonly CollectionViewArtist[];
  readonly date: Temporal.PlainDate | undefined;
  readonly tracksTotal: number;
  readonly durationMs: number;
}

export function CollectionViewMetaAlbum(props: CollectionViewMetaAlbumProps) {
  return (
    <div className="flex flex-row items-center text-sm">
      {props.artists && props.artists.length > 0 && (
        <span className="font-bold">
          {props.artists.map((artist, index) => (
            <span key={artist.id ?? index}>
              <Link to={`/artist/${artist.id}`} className="hover:underline">
                {artist.name}
              </Link>
              {index < props.artists.length - 1 && ", "}
            </span>
          ))}
        </span>
      )}
      {props.date && (
        <>
          <span className="mx-2">•</span>
          <span title={props.date.toLocaleString() ?? ""}>
            {props.date.year}
          </span>
        </>
      )}
      <span className="mx-2">•</span>
      <span>
        {plural(
          { count: props.tracksTotal },
          {
            one: "# track",
            other: "# tracks",
          },
        )}
      </span>
      <span>,&nbsp;</span>
      <DurationLong durationMs={props.durationMs} />
    </div>
  );
}
