/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

import "./sw-db";
import { fetchMediaHandler } from "./sw-flac";
import { registerAlbumCoverRoute } from "./sw-covers";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

void self.skipWaiting();
clientsClaim();

self.addEventListener("fetch", fetchMediaHandler);

registerAlbumCoverRoute();
