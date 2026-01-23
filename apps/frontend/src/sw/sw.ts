/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

import "./sw-db";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

void self.skipWaiting();
clientsClaim();

// const MEDIA_URL_PATTERN = /^\/api\/media\/([^/]+)$/;

/* ------------------------------------------------------------------ */
/* FETCH HANDLER (FLAC STREAMING) */
/* ------------------------------------------------------------------ */

/*self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Match: /api/media/{cuid}
  const match = url.pathname.match(MEDIA_URL_PATTERN);
  if (!match) return;

  const cuid = match[1];

  event.respondWith(handleMediaRequest(event.request, cuid));
});

async function handleMediaRequest(
  request: Request,
  cuid: string,
): Promise<Response> {
  const rangeHeader = request.headers.get("range");

  // OPFS filename convention
  // const filename = `${cuid}.flac`;

  // 1. OPFS first (authoritative)
  //let response =
  //   (await getOPFSFileResponse(cuid)) ?? (await getCachedResponse(request));

  // 2. Network fallback
  if (!response) {
    const netResponse = await fetch(request);

    if (netResponse.ok) {
      await cacheWithRetention(request, netResponse);
    }

    response = netResponse;
  }

  // 3. Proper Range support (206)
  if (rangeHeader) {
    return createPartialResponse(request, response);
  }

  return response;
}*/
