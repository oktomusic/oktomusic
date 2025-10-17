import { Test, TestingModule } from "@nestjs/testing";
import { ApiController } from "./api/api.controller";
import { ApiService } from "./api/api.service";
import type { HelloWorld } from "./generated/prisma";

describe("ApiController", () => {
  let apiController: ApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: {
            listHelloWorld: jest
              .fn()
              .mockResolvedValue([
                {
                  id: 1,
                  createdAt: new Date("2020-01-01"),
                  text: "Hello World",
                },
              ]) as unknown as () => Promise<HelloWorld[]>,
          },
        },
      ],
    }).compile();

    apiController = app.get<ApiController>(ApiController);
  });

  describe("root", () => {
    it("should return HelloWorld list", async () => {
      await expect(apiController.getInfo()).resolves.toEqual([
        { id: 1, createdAt: new Date("2020-01-01"), text: "Hello World" },
      ]);
    });
  });
});
