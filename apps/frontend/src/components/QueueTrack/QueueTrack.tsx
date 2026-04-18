import { Link } from "react-router";
import { Button } from "@headlessui/react";
import { HiEllipsisHorizontal, HiPause, HiPlay } from "react-icons/hi2";
import { LuDisc3, LuListPlus } from "react-icons/lu";
import { useSetAtom } from "jotai";
import { useMutation } from "@apollo/client/react";
import { t } from "@lingui/core/macro";

import { addToQueueAtom, TrackWithAlbum } from "../../atoms/player/machine";
import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";
import { SubmenuPlaylistsSearch } from "../SubmenuPlaylistsSearch";

import { ADD_TRACKS_TO_PLAYLIST_MUTATION } from "../../api/graphql/mutations/playlists/addTracksToPlaylist";
import { PLAYLIST_QUERY } from "../../api/graphql/queries/playlist";
import { usePanelToast } from "../../hooks/use_panel_toast";

import "./QueueTrack.css";

interface QueueTrackProps {
  readonly track: TrackWithAlbum;
  readonly isCurrent?: boolean;
  readonly isPlaying?: boolean;
  readonly onClickPlay?: () => void;
}

export function QueueTrack(props: QueueTrackProps) {
  const addToQueue = useSetAtom(addToQueueAtom);
  const setToast = usePanelToast();

  const [addTracksToPlaylist] = useMutation(ADD_TRACKS_TO_PLAYLIST_MUTATION);

  const showPlayIcon = !props.isCurrent || !props.isPlaying;

  const trackName = props.track.name;

  const menuItems = [
    {
      type: "button",
      icon: <LuListPlus className="size-4" />,
      label: t`Add to queue`,
      onClick: () => {
        addToQueue([props.track]);
      },
    },
    {
      type: "router-link",
      icon: <LuDisc3 className="size-4" />,
      label: t`Go to album`,
      to: `/album/${props.track.album.id}`,
    },
    {
      type: "submenu",
      component: (
        <SubmenuPlaylistsSearch
          onClick={async (playlistId: string) => {
            try {
              await addTracksToPlaylist({
                variables: { id: playlistId, trackIds: [props.track.id] },
                refetchQueries: [
                  { query: PLAYLIST_QUERY, variables: { id: playlistId } },
                ],
                awaitRefetchQueries: true,
              });
              setToast({ message: t`Added to playlist`, type: "success" });
            } catch (err) {
              console.error(err);
              setToast({
                message: t`Failed to add track`,
                type: "error",
              });
            }
          }}
        />
      ),
    },
  ] as const satisfies OktoMenuItem[];

  return (
    <li
      className="queue-track group gap-3 rounded p-2 hover:bg-white/10"
      draggable
    >
      <Button
        className="group relative size-12 shrink-0 appearance-none rounded"
        onClick={props.onClickPlay}
        aria-label={
          props.isCurrent
            ? props.isPlaying
              ? "Pause"
              : "Resume playback"
            : `Play ${props.track.name}`
        }
      >
        <img
          className="size-12 shrink-0 rounded"
          fetchPriority="low"
          loading="lazy"
          draggable={false}
          src={`/api/album/${props.track.album.id}/cover/96`}
          alt={`${props.track.album.name} cover`}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-zinc-950/60 opacity-0 transition duration-150 group-hover:opacity-100">
          {showPlayIcon ? (
            <HiPlay aria-hidden="true" className="size-8 text-white/90" />
          ) : (
            <HiPause aria-hidden="true" className="size-8 text-white/90" />
          )}
        </span>
      </Button>
      <div className="flex h-12 w-full grow flex-col content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        <span>{props.track.name}</span>
        <span className="text-sm text-zinc-400">
          {props.track.artists.map((artist, index) => (
            <span key={artist.id ?? index}>
              <Link to={`/artist/${artist.id}`} className="hover:underline">
                {artist.name}
              </Link>
              {index < (props.track.artists.length ?? 0) - 1 && ", "}
            </span>
          ))}
        </span>
      </div>
      <div className="flex flex-row items-center">
        <OktoMenu
          button={
            <HiEllipsisHorizontal className="size-6 opacity-0 group-hover:opacity-100" />
          }
          items={menuItems}
          buttonAriaLabel={t`More options for ${trackName}`}
        />
      </div>
    </li>
  );
}
