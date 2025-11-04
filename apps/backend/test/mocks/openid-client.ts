import { vi } from "vitest"

// Minimal mock of openid-client used in tests
export type Configuration = {
  serverMetadata: () => { supportsPKCE: () => boolean }
}

export type TokenEndpointResponse = {
  access_token?: string
  refresh_token?: string
  id_token?: string
}

export const discovery = vi.fn(() => {
  return {
    serverMetadata: () => ({ supportsPKCE: () => true }),
  } as Configuration
})

export const randomPKCECodeVerifier = vi.fn(() => "verifier")
export const calculatePKCECodeChallenge = vi.fn(() =>
  Promise.resolve("challenge"),
)
export const randomState = vi.fn(() => "state")

export const buildAuthorizationUrl = vi.fn(() => {
  return new URL("https://issuer.example/authorize")
})

export const authorizationCodeGrant = vi.fn(() =>
  Promise.resolve({ access_token: "at" } as TokenEndpointResponse),
)

export const fetchUserInfo = vi.fn(() =>
  Promise.resolve({ sub: "mock-user" }),
)

export const refreshTokenGrant = vi.fn(() =>
  Promise.resolve({ access_token: "at2" }),
)

export const buildEndSessionUrl = vi.fn(() => {
  return new URL("https://issuer.example/logout")
})
