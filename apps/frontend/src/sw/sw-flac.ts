/// <reference lib="webworker" />

/**
 * FLAC Streaming handling
 *
 * The strategy is the following:
 * - Try to get the file from OPFS /files/{cuid}.flac
 * - If found, serve it with range requests support
 * - If not found, fallback to cache with a retention policy
 * - If not in cache, fetch from network and cache it
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
 * @see https://web.dev/articles/origin-private-file-system
 */

/**
 * URL pattern to match FLAC media requests:
 *
 * `/api/media/{cuid}`
 */
export const MEDIA_URL_PATTERN = /^\/api\/media\/([^/]+)$/;

/**
 * Cache key for FLAC streaming cache
 */
export const MEDIA_CACHE_KEY = "flac-stream-cache";

/**
 * Retrieves a file from OPFS under `/files/{cuid}.flac`
 * and wraps it in a `Response` suitable for returning from a Service Worker fetch handler.
 *
 * The returned `Response` includes basic audio and byte-range related headers:
 * - `Content-Type: audio/flac`
 * - `Accept-Ranges: bytes`
 * - `Content-Length: <file size>`
 *
 * If the directory or file does not exist, OPFS is unavailable, or any storage access fails,
 * this function returns `null`.
 *
 * @param cuid CUID used to locate the FLAC file
 * @returns A `Response` containing the FLAC `File`, or `null` if it cannot be retrieved
 */
export async function getOPFSFileResponse(
  cuid: string,
): Promise<Response | null> {
  try {
    const root = await navigator.storage.getDirectory();

    // /files directory
    const filesDir = await root.getDirectoryHandle("files");

    // /files/{cuid}.flac
    const fileHandle = await filesDir.getFileHandle(`${cuid}.flac`);
    const file = await fileHandle.getFile();

    return new Response(file, {
      headers: {
        "Content-Type": "audio/flac",
        "Accept-Ranges": "bytes",
        "Content-Length": file.size.toString(),
      },
    });
  } catch {
    return null;
  }
}
