import type { TrackWithAlbum } from "../atoms/player/machine";
import { getMediaImages } from "./media_images";

/**
 * Build the [MediaMetadata](https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata) object for the given track.
 *
 * @see https://web.dev/articles/media-session
 */
export function buildMediaMetadata(track: TrackWithAlbum) {
  return new MediaMetadata({
    title: track.name,
    artist: track.artists[0]?.name || "Unknown", // shouldn't happen
    album: track.album.name,
    artwork: getMediaImages(track.album.id),
  });
}
