import { useRef } from "react";

import type { AlbumBasic, PlaylistBasic } from "../../api/graphql/types";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import type {
  VibrantColors,
  VibrantColorsPartial,
} from "../../atoms/player/machine";
import { useVibrantColors } from "../../hooks/vibrant_colors";
import { Cover } from "../Base/Cover";
import { getCoverImagesFromAlbumIds } from "../Base/CoverImages";

import "./DialogPrintViewport.css";

interface DialogPrintViewportProps {
  readonly subject: AlbumBasic | PlaylistBasic;
  readonly colors?: VibrantColors;
}

const fallbackColors = {
  muted: "#777787",
  darkMuted: "#474751",
} as const satisfies VibrantColorsPartial;

export function DialogPrintViewport(props: DialogPrintViewportProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useVibrantColors(divRef, props.colors, fallbackColors);

  const covers = getCoverImagesFromAlbumIds(
    props.subject.__typename === "AlbumBasic"
      ? [props.subject.id]
      : props.subject.coverAlbumIds,
    coverPlaceHolder,
  );
  const subtitle =
    props.subject.__typename === "AlbumBasic"
      ? props.subject.artists.map((artist) => artist.name).join(", ")
      : props.subject.creator.username;

  return (
    <div ref={divRef} className="dialog-print-viewport">
      <figure className="dialog-print-viewport__collection">
        <Cover
          imgs={covers}
          size={1280}
          alt={props.subject.name}
          className="dialog-print-viewport__cover"
          loading="eager"
          fetchPriority="high"
        />
        <figcaption className="dialog-print-viewport__caption">
          <h1 className="dialog-print-viewport__title">{props.subject.name}</h1>
          {subtitle && (
            <p className="dialog-print-viewport__subtitle">{subtitle}</p>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
