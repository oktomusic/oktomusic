import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest"
import { Logger } from "@nestjs/common"
import { OidcService } from "./oidc.service"
import type { OidcConfig } from "src/config/definitions/oidc.config"
import oidcConfig from "src/config/definitions/oidc.config"
import { Test, TestingModule } from "@nestjs/testing"

// Mock openid-client module
vi.mock("openid-client", () => {
  return {
    discovery: vi.fn(),
    randomPKCECodeVerifier: vi.fn(),
    calculatePKCECodeChallenge: vi.fn(),
    randomState: vi.fn(),
    buildAuthorizationUrl: vi.fn(),
    authorizationCodeGrant: vi.fn(),
    fetchUserInfo: vi.fn(),
    refreshTokenGrant: vi.fn(),
    buildEndSessionUrl: vi.fn(),
  }
})

import * as client from "openid-client"

// Silence Nest logger output during tests
beforeAll(() => {
  vi.spyOn(Logger.prototype, "log").mockImplementation(() => {})
  vi.spyOn(Logger.prototype, "debug").mockImplementation(() => {})
})

describe("OidcService", () => {
  const baseConf: OidcConfig = {
    issuer: "https://issuer.example/realm",
    clientId: "client-123",
    clientSecret: "secret-456",
    redirectUri: "https://app.example/callback",
    logoutRedirectUri: "https://app.example/post-logout",
    scopes: "openid profile",
    responseType: "code",
    autoDiscovery: true,
    jwksCacheTtl: 3600,
  }

  const makeConfig = (supportsPKCE: boolean) =>
    ({
      serverMetadata: () => ({
        supportsPKCE: () => supportsPKCE,
      }),
    }) as unknown as client.Configuration

  beforeEach(() => {
    vi.resetAllMocks()
  })

  async function makeService(conf: OidcConfig): Promise<OidcService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcService, { provide: oidcConfig.KEY, useValue: conf }],
    }).compile()
    return module.get(OidcService)
  }

  it("discovers configuration on init", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    expect(client.discovery).toHaveBeenCalledWith(
      new URL(baseConf.issuer + "/.well-known/openid-configuration"),
      baseConf.clientId,
      baseConf.clientSecret,
    )
  })

  it("generateAuthUrl with PKCE support does not include state", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    vi.mocked(client.randomPKCECodeVerifier).mockReturnValue("verifier-123")
    vi.mocked(client.calculatePKCECodeChallenge).mockResolvedValue(
      "challenge-abc",
    )

    const buildSpy = vi.mocked(client.buildAuthorizationUrl)
    buildSpy.mockImplementation((_cfg, params: Record<string, string>) => {
      // Assert parameters here
      expect(params).toEqual({
        redirect_uri: baseConf.redirectUri,
        scope: baseConf.scopes,
        code_challenge: "challenge-abc",
        code_challenge_method: "S256",
      })
      return new URL("https://issuer.example/authorize?ok=1")
    })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const res = await svc.generateAuthUrl()
    expect(res).toEqual({
      url: "https://issuer.example/authorize?ok=1",
      state: undefined,
      codeVerifier: "verifier-123",
    })
    expect(client.randomPKCECodeVerifier).toHaveBeenCalled()
    expect(client.calculatePKCECodeChallenge).toHaveBeenCalledWith(
      "verifier-123",
    )
  })

  it("generateAuthUrl without PKCE support includes state", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(false))
    vi.mocked(client.randomPKCECodeVerifier).mockReturnValue("verifier-xyz")
    vi.mocked(client.calculatePKCECodeChallenge).mockResolvedValue(
      "challenge-xyz",
    )
    vi.mocked(client.randomState).mockReturnValue("state-789")

    const buildSpy = vi.mocked(client.buildAuthorizationUrl)
    buildSpy.mockImplementation((_cfg, params: Record<string, string>) => {
      expect(params).toEqual({
        redirect_uri: baseConf.redirectUri,
        scope: baseConf.scopes,
        code_challenge: "challenge-xyz",
        code_challenge_method: "S256",
        state: "state-789",
      })
      return new URL("https://issuer.example/authorize?ok=2")
    })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const res = await svc.generateAuthUrl()
    expect(res.url).toBe("https://issuer.example/authorize?ok=2")
    expect(res.state).toBe("state-789")
    expect(res.codeVerifier).toBe("verifier-xyz")
  })

  it("buildAuthUrl builds with provided state and verifier", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    vi.mocked(client.calculatePKCECodeChallenge).mockResolvedValue(
      "challenge-123",
    )
    const buildSpy = vi.mocked(client.buildAuthorizationUrl)
    buildSpy.mockImplementation((_cfg, params: Record<string, string>) => {
      expect(params).toEqual({
        redirect_uri: baseConf.redirectUri,
        scope: baseConf.scopes,
        code_challenge: "challenge-123",
        code_challenge_method: "S256",
        state: "given-state",
      })
      return new URL("https://issuer.example/authorize?ok=3")
    })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const url = await svc.buildAuthUrl("given-state", "my-verifier")
    expect(client.calculatePKCECodeChallenge).toHaveBeenCalledWith(
      "my-verifier",
    )
    expect(url).toBe("https://issuer.example/authorize?ok=3")
  })

  it("handleCallback exchanges code using authorizationCodeGrant", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    const grantSpy = vi.mocked(client.authorizationCodeGrant)
    grantSpy.mockResolvedValue({ access_token: "at", refresh_token: "rt" })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const getCurrentUrl = () =>
      new URL("https://app.example/callback?code=abc")
    const tokens = await svc.handleCallback(getCurrentUrl, "verifier", "st")
    expect(client.authorizationCodeGrant).toHaveBeenCalled()
    expect(tokens).toEqual({ access_token: "at", refresh_token: "rt" })
  })

  it("getUserInfo returns user claims", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    vi.mocked(client.fetchUserInfo).mockResolvedValue({ sub: "123" })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const info = await svc.getUserInfo("at")
    expect(client.fetchUserInfo).toHaveBeenCalled()
    expect(info).toEqual({ sub: "123" })
  })

  it("refreshTokens exchanges refresh token", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    vi.mocked(client.refreshTokenGrant).mockResolvedValue({
      access_token: "new-at",
      refresh_token: "new-rt",
    })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const tokens = await svc.refreshTokens("rt")
    expect(client.refreshTokenGrant).toHaveBeenCalledWith(
      expect.anything(),
      "rt",
    )
    expect(tokens.access_token).toBe("new-at")
  })

  it("buildLogoutUrl includes optional post_logout_redirect_uri when provided", async () => {
    vi.mocked(client.discovery).mockResolvedValueOnce(makeConfig(true))
    const endSessionSpy = vi.mocked(client.buildEndSessionUrl)
    endSessionSpy.mockImplementation((_cfg, params: Record<string, string>) => {
      expect(params).toEqual({
        id_token_hint: "id-token",
        post_logout_redirect_uri: baseConf.logoutRedirectUri,
      })
      return new URL("https://issuer.example/logout?ok=1")
    })

    const svc = await makeService(baseConf)
    await svc.onModuleInit()

    const url = svc.buildLogoutUrl("id-token")
    expect(url).toBe("https://issuer.example/logout?ok=1")
  })
})
