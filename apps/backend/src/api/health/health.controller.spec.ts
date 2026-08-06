import { HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { Test, TestingModule } from "@nestjs/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { PrismaService } from "../../db/prisma.service";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: vi.fn().mockResolvedValue({ status: "ok" }) },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: { pingCheck: vi.fn() },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
