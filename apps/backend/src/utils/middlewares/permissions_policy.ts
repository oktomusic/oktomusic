import { NextFunction, Request, Response } from "express";

/**
 * Allowed values for a Permissions-Policy directive:
 *
 * - `*` — allow for all origins
 * - `self` — allow only same origin
 * - `src` — allow the embedding document's origin
 * - `[]` — disable for all origins
 * - `string[]` — list of allowed origins (URLs)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy#allowlist
 */
type PermissionsPolicyWhitelist = "*" | "self" | "src" | [] | string[];

/**
 * Commented-out directives appears on MDN but trigger a warning in latest Chrome
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy#directives
 */
type PermissionsPolicyDirective =
  | "accelerometer"
  // | "ambient-light-sensor"
  | "aria-notify"
  | "autoplay"
  // | "bluetooth"
  | "camera"
  | "captured-surface-control"
  | "compute-pressure"
  | "cross-origin-isolated"
  | "deferred-fetch"
  | "deferred-fetch-minimal"
  | "display-capture"
  | "encrypted-media"
  | "fullscreen"
  | "gamepad"
  | "geolocation"
  | "gyroscope"
  | "hid"
  | "identity-credentials-get"
  | "idle-detection"
  | "language-detector"
  | "local-fonts"
  | "magnetometer"
  | "microphone"
  | "midi"
  | "on-device-speech-recognition"
  | "otp-credentials"
  | "payment"
  | "picture-in-picture"
  | "private-state-token-issuance"
  | "private-state-token-redemption"
  | "publickey-credentials-create"
  | "publickey-credentials-get"
  | "screen-wake-lock"
  | "serial"
  // | "speaker-selection"
  | "storage-access"
  | "translator"
  | "summarizer"
  | "usb"
  // | "web-share"
  | "window-management"
  | "xr-spatial-tracking";

export type PermissionsPolicyMap = Record<
  PermissionsPolicyDirective,
  PermissionsPolicyWhitelist
>;

export const permissionsPolicy: PermissionsPolicyMap = {
  accelerometer: [],
  // "ambient-light-sensor": [],
  "aria-notify": [],
  autoplay: "self",
  // bluetooth: [],
  camera: [],
  "captured-surface-control": [],
  "compute-pressure": [],
  "cross-origin-isolated": [],
  "deferred-fetch": [],
  "deferred-fetch-minimal": [],
  "display-capture": [],
  "encrypted-media": [],
  fullscreen: [],
  gamepad: [],
  geolocation: [],
  gyroscope: [],
  hid: [],
  "identity-credentials-get": [],
  "idle-detection": [],
  "language-detector": "self",
  "local-fonts": [],
  magnetometer: [],
  microphone: [],
  midi: [],
  "on-device-speech-recognition": [],
  "otp-credentials": [],
  payment: [],
  "picture-in-picture": [], // TODO: check for document PiP
  "private-state-token-issuance": [],
  "private-state-token-redemption": [],
  "publickey-credentials-create": [],
  "publickey-credentials-get": [],
  "screen-wake-lock": "self",
  serial: [],
  // "speaker-selection": [],
  "storage-access": [],
  translator: "self",
  summarizer: [],
  usb: [],
  // "web-share": "self",
  "window-management": [],
  "xr-spatial-tracking": [],
} as const;

export function getPermissionsPolicyString(
  policy: PermissionsPolicyMap,
): string {
  return Object.entries(policy)
    .map(([directive, value]) => {
      // Disabled directive
      if (Array.isArray(value) && value.length === 0) return `${directive}=()`;
      // Allow all
      if (value === "*") return `${directive}=*`;

      const list = Array.isArray(value) ? value : [value];

      return `${directive}=(${list
        .map((v) => {
          // Keywords: self/src are emitted verbatim
          if (v === "self" || v === "src") return v;
          // URLs: wrap in quotes
          return `"${v}"`;
        })
        .join(" ")})`;
    })
    .join(", ");
}

export function permissionsPolicyMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader(
    "Permissions-Policy",
    getPermissionsPolicyString(permissionsPolicy),
  );
  next();
}
