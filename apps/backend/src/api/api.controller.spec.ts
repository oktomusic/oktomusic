import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ConfigType } from "@nestjs/config";

import { ApiController } from "./api.controller";
import type { ApiService } from "./api.service";
import oidcConfig from "../config/definitions/oidc.config";

// Mock ESM package
vi.mock("@oktomusic/api-schemas", () => ({
  ApiInfoResJSONSchema: {},
}));

describe("ApiController", () => {
  let apiController: ApiController;

  beforeEach(() => {
    const oidcValue = {
      issuer: "https://issuer.example.com",
      clientId: "client-123",
    } as ConfigType<typeof oidcConfig>;

    const apiServiceMock = {
      listUsers: vi.fn(),
    } as unknown as ApiService;

    apiController = new ApiController(oidcValue, apiServiceMock);
  });

  describe("info", () => {
    it("should return backend info", () => {
      expect(apiController.getInfo()).toEqual({
        version: "0.0.1",
        oidc: {
          issuer: "https://issuer.example.com",
          client_id: "client-123",
        },
      });
    });
  });
});
