import { Link } from "react-router";
import { HiEllipsisHorizontal, HiPlay, HiPause } from "react-icons/hi2";
import { LuAudioLines, LuDisc3, LuListPlus } from "react-icons/lu";
import { useSetAtom, useAtomValue } from "jotai";
import { Button } from "@headlessui/react";
import { t } from "@lingui/core/macro";

import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";
import { formatDuration } from "../../utils/format_duration";
import {
  TrackWithAlbum,
  addToQueueAtom,
  playerQueueCurrentTrack,
  playerShouldPlayAtom,
  requestPlaybackToggleAtom,
} from "../../atoms/player/machine";

interface TrackElementProps {
  readonly track: TrackWithAlbum;
  readonly index: number;
  readonly displayCover: boolean;
  readonly onPlay: () => void;
}

export function TrackElement(props: TrackElementProps) {
  const addToQueue = useSetAtom(addToQueueAtom);
  const currentTrack = useAtomValue(playerQueueCurrentTrack);
  const shouldPlay = useAtomValue(playerShouldPlayAtom);
  const togglePlayback = useSetAtom(requestPlaybackToggleAtom);

  const isCurrentTrack = currentTrack?.id === props.track.id;
  const showPauseIcon = isCurrentTrack && shouldPlay;

  const handleButtonClick = () => {
    if (isCurrentTrack) {
      togglePlayback();
    } else {
      props.onPlay();
    }
  };

  const menuItems: OktoMenuItem[] = [
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
  ];

  const trackName = props.track.name;

  return (
    <li
      key={props.index}
      className="track-list__track group h-14 w-full rounded-lg hover:bg-white/10"
    >
      <div className="relative flex items-center justify-center">
        <span
          className={
            "select-none group-hover:opacity-0" +
            (isCurrentTrack ? " text-blue-500" : "")
          }
        >
          {isCurrentTrack && shouldPlay ? (
            <LuAudioLines className="size-4" />
          ) : (
            props.index + 1
          )}
        </span>
        <Button
          className="absolute inset-0 flex items-center justify-center opacity-0 select-none group-hover:opacity-100"
          aria-label={
            isCurrentTrack
              ? shouldPlay
                ? t`Pause ${trackName}`
                : t`Resume ${trackName}`
              : t`Play ${trackName}`
          }
          onClick={handleButtonClick}
        >
          {showPauseIcon ? (
            <HiPause className="size-4" />
          ) : (
            <HiPlay className="size-4" />
          )}
        </Button>
      </div>
      <div className="flex flex-row content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        {props.displayCover && (
          <div className="track-list__track__cover mr-3 items-center justify-center">
            <img
              className="block size-10 rounded select-none"
              fetchPriority="low"
              loading="lazy"
              draggable={false}
              src={`/api/album/${props.track.album.id}/cover/96`}
              alt={`${props.track.album.name} cover`}
            />
          </div>
        )}
        <div className="track-list__track_info">
          <span
            className={"text-base" + (isCurrentTrack ? " text-blue-500" : "")}
          >
            {props.track.name}
          </span>
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
      </div>
      <span className="text-end">{formatDuration(props.track.durationMs)}</span>
      <div className="flex items-center justify-center">
        <OktoMenu
          button={
            <HiEllipsisHorizontal className="size-6 opacity-0 group-hover:opacity-100" />
          }
          positionAlign="end"
          positionSide="bottom"
          items={menuItems}
          buttonAriaLabel={t`More options for ${trackName}`}
        />
      </div>
    </li>
  );
}
