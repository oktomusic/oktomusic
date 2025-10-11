import { Test, TestingModule } from "@nestjs/testing"
import { ApiController } from "./api/api.controller"
import { ApiService } from "./api/api.service"

describe("ApiController", () => {
  let apiController: ApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
  controllers: [ApiController],
  providers: [ApiService],
    }).compile();

    apiController = app.get<ApiController>(ApiController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(apiController.getInfo()).toBe("Hello World!")
    });
  });
});
