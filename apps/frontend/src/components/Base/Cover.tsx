import { AlbumCoverSize } from "../../utils/images";
import type { CoverImages } from "./CoverImages";

interface CoverProps {
  /**
   * - [string] single album CUID
   * - [string, string, string, string] array of 4 unique album CUIDs
   * - string URL of the cover image (for playlists with custom covers)
   */
  readonly imgs: CoverImages;
  readonly size: AlbumCoverSize;
  readonly alt: string;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly loading?: "lazy" | "eager";
  readonly fetchPriority?: "low" | "high" | "auto";
}

function cuidToAlbumCoverUrl(cuid: string, size: AlbumCoverSize): string {
  return `/api/album/${cuid}/cover/${size}`;
}

/**
 * Playlist/Album cover component.
 */
export function Cover(props: CoverProps) {
  const coverAlt = props.alt;
  const loading = props.loading ?? "lazy";
  const fetchPriority = props.fetchPriority ?? "low";
  const isAlbumIdList = typeof props.imgs !== "string";

  const imageUrls = isAlbumIdList
    ? props.imgs.map((cuid) => cuidToAlbumCoverUrl(cuid, props.size))
    : [props.imgs];

  const isGrid = imageUrls.length === 4;
  const isClickable = props.onClick !== undefined;
  const wrapperRole = isGrid ? "img" : undefined;
  const wrapperAriaLabel = isClickable || isGrid ? coverAlt : undefined;
  const imageAlt = isGrid || isClickable ? "" : coverAlt;
  const imageAriaHidden = isGrid || isClickable ? true : undefined;

  const wrapperClassName = [
    "aspect-square",
    "overflow-hidden",
    isGrid ? "grid grid-cols-2 grid-rows-2" : "flex",
    isClickable
      ? "cursor-pointer border-0 bg-transparent p-0 focus:outline-none"
      : "",
    props.className ?? "",
  ]
    .filter((value) => value.length > 0)
    .join(" ");
  const imageClassName = "h-full w-full object-cover";

  if (isClickable) {
    return (
      <button
        type="button"
        className={wrapperClassName}
        aria-label={wrapperAriaLabel}
        onClick={props.onClick}
      >
        {imageUrls.map((url) => (
          <img
            key={url}
            src={url}
            alt={imageAlt}
            aria-hidden={imageAriaHidden}
            className={imageClassName}
            loading={loading}
            fetchPriority={fetchPriority}
          />
        ))}
      </button>
    );
  }

  return (
    <div
      className={wrapperClassName}
      role={wrapperRole}
      aria-label={wrapperAriaLabel}
    >
      {imageUrls.map((url) => (
        <img
          key={url}
          src={url}
          alt={imageAlt}
          aria-hidden={imageAriaHidden}
          className={imageClassName}
          loading={loading}
          fetchPriority={fetchPriority}
        />
      ))}
    </div>
  );
}
