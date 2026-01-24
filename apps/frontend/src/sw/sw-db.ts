/// <reference lib="webworker" />

import {
  DB_CONFIG_KEY,
  DB_NAME,
  DB_STORE,
  DB_VERSION,
  DEFAULT_SW_CONFIG,
  ServiceWorkerConfig,
} from "./sw-db-common";

declare let self: ServiceWorkerGlobalScope;

/**
 * Persist Service Worker configuration in IndexedDB
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * @see https://web.dev/articles/indexeddb
 */

/**
 * Cached config in memory (SW can be killed anytime, so treat as ephemeral)
 */
let cachedConfig: ServiceWorkerConfig | null = null;

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error!);
  });
}

/**
 * Persist config to IndexedDB
 */
export async function saveSWConfig(config: ServiceWorkerConfig): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readwrite");
  tx.objectStore(DB_STORE).put(config, DB_CONFIG_KEY);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error!);
  });
}

/**
 * Load config from IndexedDB
 */
export async function loadSWConfig(): Promise<ServiceWorkerConfig | null> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, "readonly");
  const req = tx.objectStore(DB_STORE).get(DB_CONFIG_KEY);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      resolve((req.result as ServiceWorkerConfig) ?? null);
    };
    req.onerror = () => reject(req.error!);
  });
}

export async function getSWConfig(): Promise<ServiceWorkerConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const stored = await loadSWConfig();
  cachedConfig = {
    ...DEFAULT_SW_CONFIG,
    ...stored,
  };

  return cachedConfig;
}

/**
 * Register activation handler to load config into memory
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(getSWConfig());
});
