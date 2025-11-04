import { describe, it, expect, beforeEach, vi } from "vitest"
import { Test, TestingModule } from "@nestjs/testing"
import { ApiController } from "./api.controller"
import { ApiService } from "./api.service"
import oidcConfig from "../config/definitions/oidc.config"

// Mock ESM package
vi.mock("@oktomusic/api-schemas", () => ({
  ApiInfoResJSONSchema: {},
}))

describe("ApiController", () => {
  let apiController: ApiController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: oidcConfig.KEY,
          useValue: {
            issuer: "https://issuer.example.com",
            clientId: "client-123",
          },
        },
        {
          provide: ApiService,
          useValue: {
            listUsers: vi.fn(),
          },
        },
      ],
    }).compile()

    apiController = app.get<ApiController>(ApiController)
  })

  describe("info", () => {
    it("should return backend info", () => {
      expect(apiController.getInfo()).toEqual({
        version: "0.0.1",
        oidc: {
          issuer: "https://issuer.example.com",
          client_id: "client-123",
        },
      })
    })
  })
})
