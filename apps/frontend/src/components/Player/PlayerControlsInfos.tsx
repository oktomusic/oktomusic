import { useAtomValue } from "jotai";
import { Link } from "react-router";
import { useLingui } from "@lingui/react/macro";

import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { playerQueueCurrentTrack } from "../../atoms/player/machine";

export function PlayerControlsInfos() {
  const { t } = useLingui();

  const currentTrack = useAtomValue(playerQueueCurrentTrack);

  return (
    <div id="oktomusic:player:title" className="flex w-full flex-row gap-2">
      <img
        className="m-2 aspect-square size-16 rounded-sm"
        loading="eager"
        fetchPriority="high"
        src={
          currentTrack
            ? `/api/album/${currentTrack.album.id}/cover/256`
            : coverPlaceHolder
        }
        draggable={false}
        alt={currentTrack ? "Album Cover" : t`No track playing`}
      />
      <div className="flex h-full flex-col justify-center">
        <span className="font-semibold">{currentTrack?.name}</span>
        <span className="">
          {currentTrack?.artists.map((artist, index) => (
            <span key={artist.id ?? index}>
              <Link to={`/artist/${artist.id}`} className="hover:underline">
                {artist.name}
              </Link>
              {index < (currentTrack?.artists.length ?? 0) - 1 && ", "}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
