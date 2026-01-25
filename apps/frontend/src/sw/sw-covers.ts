/// <reference lib="webworker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

import { DEFAULT_SW_CONFIG } from "./sw-db-common";

/**
 * URL pattern to match album cover requests:
 *
 * `/api/album/{cuid}/cover/{size}`
 */
export const ALBUM_COVER_URL_PATTERN = /^\/api\/album\/([^/]+)\/cover\/(\d+)$/;

/**
 * Cache key for album covers
 */
export const ALBUM_COVER_CACHE_KEY = "album-cover-cache";

const albumCoverStrategy = new CacheFirst({
  cacheName: ALBUM_COVER_CACHE_KEY,
  plugins: [
    new CacheableResponsePlugin({ statuses: [200] }),
    new ExpirationPlugin({
      maxEntries: DEFAULT_SW_CONFIG.mediaMaxEntries,
      maxAgeSeconds: DEFAULT_SW_CONFIG.mediaMaxAge,
      purgeOnQuotaError: true,
    }),
  ],
});

export function registerAlbumCoverRoute() {
  registerRoute(
    (options) =>
      options.request.method === "GET" &&
      ALBUM_COVER_URL_PATTERN.test(options.url.pathname),
    albumCoverStrategy,
  );
}
