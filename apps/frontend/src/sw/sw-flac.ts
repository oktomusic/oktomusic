/// <reference lib="webworker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  RangeRequestsPlugin,
  createPartialResponse,
} from "workbox-range-requests";
import { CacheFirst } from "workbox-strategies";

import { DEFAULT_SW_CONFIG } from "./sw-db-common";

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
 * CacheFirst strategy for FLAC media with custom plugins
 */
const mediaCacheStrategy = new CacheFirst({
  cacheName: MEDIA_CACHE_KEY,
  plugins: [
    new CacheableResponsePlugin({ statuses: [200] }),
    {
      cacheWillUpdate: ({ request, response }) => {
        if (!response) {
          return Promise.resolve(null);
        }

        if (response.status === 206 || request.headers.has("range")) {
          return Promise.resolve(null);
        }

        return Promise.resolve(response);
      },
    },
    new ExpirationPlugin({
      maxEntries: DEFAULT_SW_CONFIG.mediaMaxEntries,
      maxAgeSeconds: DEFAULT_SW_CONFIG.mediaMaxAge,
      purgeOnQuotaError: true,
    }),
    new RangeRequestsPlugin(),
  ],
});

/**
 * Applies byte-range handling to a response when the incoming request
 * includes a `Range` header.
 *
 * If no range is requested, the original response is returned unchanged.
 * If range handling fails, it falls back to the original response.
 *
 * @param request Incoming media request
 * @param response Full response to slice for range requests
 * @returns Range-aware response when applicable
 */
async function applyRangeResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (!request.headers.has("range")) {
    return response;
  }

  if (response.status === 206) {
    return response;
  }

  try {
    return await createPartialResponse(request, response);
  } catch {
    return response;
  }
}

/**
 * Reads the cached full response for a media request.
 *
 * The lookup is done against the media cache without ignoring query strings.
 *
 * @param request Full media request (no `Range` header)
 * @returns Cached response or `null` when missing
 */
async function getCachedFullResponse(
  request: Request,
): Promise<Response | null> {
  const cache = await caches.open(MEDIA_CACHE_KEY);
  const cachedResponse = await cache.match(request, {
    ignoreSearch: false,
    ignoreVary: true,
  });

  return cachedResponse ?? null;
}

/**
 * Persists a full (200) response into the media cache.
 *
 * @param request Full media request (no `Range` header)
 * @param response Full response to cache
 */
async function cacheFullResponse(
  request: Request,
  response: Response,
): Promise<void> {
  if (!response.ok || response.status !== 200) {
    return;
  }

  const cache = await caches.open(MEDIA_CACHE_KEY);
  await cache.put(request, response);
}

/**
 * Builds a cacheable request by stripping the `Range` header
 * and forcing a full GET response from the network.
 *
 * @param request Original media request
 * @returns Request without range header
 */
function createFullRequest(request: Request): Request {
  return new Request(request.url, {
    method: "GET",
    headers: (() => {
      const headers = new Headers(request.headers);
      headers.delete("range");
      return headers;
    })(),
    credentials: request.credentials,
    cache: "no-store",
    redirect: request.redirect,
    integrity: request.integrity,
  });
}

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

/**
 * Handles a media request for FLAC streaming.
 *
 * 1. OPFS first (authoritative)
 * 2. Cache fallback with a custom policy
 * 3. Network fetch and cache
 *
 * Supports Range requests.
 */
export async function handleMediaRequest(
  event: FetchEvent,
  cuid: string,
): Promise<Response> {
  const request = event.request;

  if (request.method !== "GET") {
    return fetch(request);
  }

  // 1. OPFS first (authoritative)
  const opfsResponse = await getOPFSFileResponse(cuid);
  if (opfsResponse) {
    return await applyRangeResponse(request, opfsResponse);
  }

  if (request.headers.has("range")) {
    const fullRequest = createFullRequest(request);
    const cachedFullResponse = await getCachedFullResponse(fullRequest);
    if (cachedFullResponse) {
      return await applyRangeResponse(request, cachedFullResponse);
    }

    const networkResponse = await fetch(fullRequest);
    if (networkResponse.ok && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      await cacheFullResponse(fullRequest, responseClone);
    }

    return await applyRangeResponse(request, networkResponse);
  }

  // 2. Cache fallback with a custom policy (range-aware)
  try {
    const cachedResponse = await mediaCacheStrategy.handle({
      event,
      request,
    });

    if (cachedResponse) {
      return cachedResponse;
    }
  } catch {
    // Fallback to network if Workbox strategy fails
  }

  // 3. Network fallback (last resort)
  return fetch(request);
}

/**
 * Fetch event handler for FLAC media requests
 */
export function fetchMediaHandler(
  this: ServiceWorkerGlobalScope,
  event: FetchEvent,
) {
  const url = new URL(event.request.url);

  // Match: /api/media/{cuid}
  const match = url.pathname.match(MEDIA_URL_PATTERN);
  if (!match) return;

  const cuid = match[1];

  event.respondWith(handleMediaRequest(event, cuid));
}
