import { Link } from "react-router";
import { t } from "@lingui/core/macro";
import { Button } from "@base-ui/react/button";
import { LuPause, LuPlay } from "react-icons/lu";

import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { Cover } from "../Base/Cover";
import {
  getCoverImagesFromAlbumIds,
  type CoverImages,
} from "../Base/CoverImages";

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
  readonly coverAlbumIds: readonly string[];
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

interface LibraryRowItemView {
  readonly title: string;
  readonly link: string;
  readonly cover: CoverImages;
  readonly typeLabel: string;
}

function getLibraryRowItemView(props: LibraryRowProps): LibraryRowItemView {
  switch (props.type) {
    case "artist":
      return {
        title: props.artist.name,
        link: `/artist/${props.artist.id}`,
        cover: coverPlaceHolder,
        typeLabel: t`Artist`,
      };
    case "album":
      return {
        title: props.album.name,
        link: `/album/${props.album.id}`,
        cover: [props.album.id],
        typeLabel: t`Album`,
      };
    case "playlist":
      return {
        title: props.playlist.name,
        link: `/playlist/${props.playlist.id}`,
        cover: getCoverImagesFromAlbumIds(
          props.playlist.coverAlbumIds,
          coverPlaceHolder,
        ),
        typeLabel: t`Playlist`,
      };
  }
}

export function LibraryRow(props: LibraryRowProps) {
  const showPlayIcon = !props.isCurrent || !props.isPlaying;
  const item = getLibraryRowItemView(props);
  const cover = (
    <Cover
      imgs={item.cover}
      size={96}
      alt={`${item.title} cover`}
      loading="lazy"
      fetchPriority="low"
      className="size-12 rounded"
    />
  );

  return (
    <li className="flex flex-row gap-3 rounded p-2 hover:bg-white/10">
      {props.onClickPlay ? (
        <Button
          className="group relative size-12 shrink-0 appearance-none rounded"
          onClick={props.onClickPlay}
          aria-label={
            props.isCurrent
              ? props.isPlaying
                ? "Pause"
                : "Resume playback"
              : `Play ${item.title}`
          }
        >
          {cover}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-zinc-950/60 opacity-0 transition duration-150 group-hover:opacity-100">
            {showPlayIcon ? (
              <LuPlay aria-hidden="true" className="size-8 text-white/90" />
            ) : (
              <LuPause aria-hidden="true" className="size-8 text-white/90" />
            )}
          </span>
        </Button>
      ) : (
        <Link
          to={item.link}
          className="size-12 shrink-0 rounded hover:brightness-110"
        >
          {cover}
        </Link>
      )}
      <div className="flex h-12 w-full grow flex-col content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        <Link to={item.link} className="truncate hover:underline">
          {item.title}
        </Link>
        <span className="text-sm text-zinc-400">
          <span>{item.typeLabel + " • "}</span>
          {props.type === "album" &&
            props.album.artists.map((artist, index) => (
              <span key={artist.id ?? index}>
                <Link to={`/artist/${artist.id}`} className="hover:underline">
                  {artist.name}
                </Link>
                {index < (props.album.artists.length ?? 0) - 1 && ", "}
              </span>
            ))}
          {props.type === "playlist" && (
            <Link
              to={`/user/${props.playlist.author.id}`}
              className="hover:underline"
            >
              {props.playlist.author.username}
            </Link>
          )}
        </span>
      </div>
    </li>
  );
}
