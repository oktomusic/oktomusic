/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

import { registerAlbumCoverRoute } from "./sw-covers";
import "./sw-db";
import { fetchMediaHandler } from "./sw-flac";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

void self.skipWaiting();
clientsClaim();

self.addEventListener("fetch", fetchMediaHandler);

registerAlbumCoverRoute();
