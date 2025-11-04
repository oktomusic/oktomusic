import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/api/info (GET)", async () => {
    const res = await request(app.getHttpServer()).get("/api/info").expect(200);
    const body = res.body as unknown as {
      version: string;
      oidc: { issuer: string; client_id: string };
    };
    expect(typeof body.version).toBe("string");
    expect(typeof body.oidc.issuer).toBe("string");
    expect(typeof body.oidc.client_id).toBe("string");
  });
});
