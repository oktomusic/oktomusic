import { Link } from "react-router";
import { HiPause, HiPlay } from "react-icons/hi2";
import { t } from "@lingui/core/macro";
import { Button } from "@headlessui/react";

export interface LibraryRowArtist {
  readonly id: string;
  readonly name: string;
}

export interface LibraryRowAlbum {
  readonly id: string;
  readonly name: string;
  readonly artists: ReadonlyArray<LibraryRowArtist>;
}

export interface LibraryRowProfile {
  readonly id: string;
  readonly username: string;
}

export interface LibraryRowPlaylist {
  readonly id: string;
  readonly name: string;
  readonly author: LibraryRowProfile;
}

export interface LibraryRowPropsBase {
  readonly isCurrent?: boolean;
  readonly isPlaying?: boolean;
  readonly onClickPlay?: () => void;
}

export interface LibraryRowPropsArtist {
  readonly type: "artist";
  readonly artist: LibraryRowArtist;
}

export interface LibraryRowPropsAlbum {
  readonly type: "album";
  readonly album: LibraryRowAlbum;
}

export interface LibraryRowPropsPlaylist {
  readonly type: "playlist";
  readonly playlist: LibraryRowPlaylist;
}

export type LibraryRowProps = LibraryRowPropsBase &
  (LibraryRowPropsArtist | LibraryRowPropsAlbum | LibraryRowPropsPlaylist);

/**
 * @todo Handle artists and playlists, not just albums
 */
export function LibraryRow(props: LibraryRowProps) {
  const showPlayIcon = !props.isCurrent || !props.isPlaying;
  const playLabel = props.type === "album" ? props.album.name : "item";

  return (
    <li className="flex flex-row gap-3 rounded p-2 hover:bg-white/10">
      <Button
        className="group relative size-12 shrink-0 appearance-none rounded"
        onClick={props.onClickPlay}
        aria-label={
          props.isCurrent
            ? props.isPlaying
              ? "Pause"
              : "Resume playback"
            : `Play ${playLabel}`
        }
      >
        <img
          className="size-12 shrink-0 rounded"
          fetchPriority="low"
          loading="lazy"
          draggable={false}
          src={
            props.type === "album"
              ? `/api/album/${props.album.id}/cover/96`
              : ""
          }
          alt={`${playLabel} cover`}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 transition duration-150 group-hover:opacity-100">
          {showPlayIcon ? (
            <HiPlay aria-hidden="true" className="size-8 text-white/90" />
          ) : (
            <HiPause aria-hidden="true" className="size-8 text-white/90" />
          )}
        </span>
      </Button>
      <div className="flex h-12 w-full grow flex-col content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        <span>{playLabel}</span>
        <span className="text-sm text-zinc-400">
          <span>
            {(() => {
              switch (props.type) {
                case "artist":
                  return t`Artist`;
                case "album":
                  return t`Album`;
                case "playlist":
                  return t`Playlist`;
              }
            })() + " • "}
          </span>
          {props.type === "album" &&
            props.album.artists.map((artist, index) => (
              <span key={artist.id ?? index}>
                <Link to={`/artist/${artist.id}`} className="hover:underline">
                  {artist.name}
                </Link>
                {index < (props.album.artists.length ?? 0) - 1 && ", "}
              </span>
            ))}
        </span>
      </div>
    </li>
  );
}
