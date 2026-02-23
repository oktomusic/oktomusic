import { Link } from "react-router";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { LuDisc3, LuListPlus } from "react-icons/lu";
import { useSetAtom } from "jotai";
import { t } from "@lingui/core/macro";

import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";
import { formatDuration } from "../../utils/format_duration";
import { TrackWithAlbum } from "../../atoms/player/machine";
import { addToQueueAtom } from "../../atoms/player/machine";

interface TrackElementProps {
  readonly track: TrackWithAlbum;
  readonly index: number;
  readonly displayCover: boolean;
}

export function TrackElement(props: TrackElementProps) {
  const addToQueue = useSetAtom(addToQueueAtom);

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
      className="track-list__track group grid h-14 w-full items-center rounded-lg hover:bg-white/10"
    >
      <span>{props.index + 1}</span>
      <div className="flex flex-row content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        {props.displayCover && (
          <div className="track-list__track__cover mr-3 flex shrink-0 items-center justify-center">
            <img
              className="block size-10 rounded"
              fetchPriority="low"
              loading="lazy"
              draggable={false}
              src={`/api/album/${props.track.album.id}/cover/96`}
              alt={`${props.track.album.name} cover`}
            />
          </div>
        )}
        <div className="track-list__track_info">
          <span className="text-base">{props.track.name}</span>
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
          anchor="bottom end"
          items={menuItems}
          buttonAriaLabel={t`More options for ${trackName}`}
        />
      </div>
    </li>
  );
}
