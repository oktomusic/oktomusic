import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import type { Request, Response, NextFunction } from "express";

import { ViewsController } from "./views.controller";
import { OpenGraphService } from "../common/opengraph/opengraph.service";

describe("ViewsController", () => {
  let controller: ViewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewsController],
      providers: [OpenGraphService],
    }).compile();

    controller = module.get<ViewsController>(ViewsController);
  });

  describe("spa route handler - API path handling", () => {
    it("should call next() for /api/info path", () => {
      const req = { path: "/api/info" } as Request;
      const res = { locals: { viteManifest: null } } as Response;
      const next = vi.fn() as unknown as NextFunction;

      const result = controller.spa(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it("should call next() for /api/graphql path", () => {
      const req = { path: "/api/graphql" } as Request;
      const res = { locals: { viteManifest: null } } as Response;
      const next = vi.fn() as unknown as NextFunction;

      const result = controller.spa(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it("should call next() for any /api/* path", () => {
      const req = { path: "/api/unknown/endpoint" } as Request;
      const res = { locals: { viteManifest: null } } as Response;
      const next = vi.fn() as unknown as NextFunction;

      const result = controller.spa(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
