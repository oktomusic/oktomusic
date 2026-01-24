export const DB_NAME = "oktomusic-sw-config";
export const DB_STORE = "config";
export const DB_CONFIG_KEY = "user-config";
export const DB_VERSION = 1;

/**
 * Persisted Service Worker configuration
 */
export interface ServiceWorkerConfig {
  mediaMaxEntries: number;
  mediaMaxAge: number; // seconds
}

const DAY = 24 * 60 * 60; // seconds

/**
 * Default config (used when nothing is persisted yet)
 */
export const DEFAULT_SW_CONFIG: ServiceWorkerConfig = {
  mediaMaxEntries: 200,
  mediaMaxAge: 30 * DAY,
};
