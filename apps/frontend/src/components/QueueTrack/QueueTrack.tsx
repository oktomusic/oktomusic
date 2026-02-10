import { HiEllipsisHorizontal, HiPause, HiPlay } from "react-icons/hi2";
import { TrackWithAlbum } from "../../atoms/player/machine";

import "./QueueTrack.css";

interface QueueTrackProps {
  readonly track: TrackWithAlbum;
  readonly isCurrent?: boolean;
  readonly isPlaying?: boolean;
  readonly onClickPlay?: () => void;
}

export function QueueTrack(props: QueueTrackProps) {
  const showPlayIcon = !props.isCurrent || !props.isPlaying;

  return (
    <li className="queue-track gap-3 rounded p-2 hover:bg-white/10" draggable>
      <button
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
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 transition duration-150 group-hover:opacity-100">
          {showPlayIcon ? (
            <HiPlay aria-hidden="true" className="size-8 text-white/90" />
          ) : (
            <HiPause aria-hidden="true" className="size-8 text-white/90" />
          )}
        </span>
      </button>
      <div className="flex h-12 w-full grow flex-col content-between justify-center overflow-hidden align-middle whitespace-nowrap">
        <span>{props.track.name}</span>
        <span className="text-sm text-zinc-400">
          {props.track.artists.map((artist, index) => (
            <span key={artist.id ?? index}>
              <a href="#" className="hover:underline">
                {artist.name}
              </a>
              {index < (props.track.artists.length ?? 0) - 1 && ", "}
            </span>
          ))}
        </span>
      </div>
      <div className="flex flex-row items-center">
        <HiEllipsisHorizontal className="size-6 opacity-0 hover:opacity-100" />
      </div>
    </li>
  );
}
