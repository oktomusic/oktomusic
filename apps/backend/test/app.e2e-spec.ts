import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "../src/app.module";

describe("App Routing (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Views Controller - SPA Routes", () => {
    it("/ should return the SPA template", async () => {
      const response = await request(app.getHttpServer()).get("/");
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain("<!DOCTYPE html>");
    });

    it("/random-path should return the SPA template", async () => {
      const response = await request(app.getHttpServer()).get("/tteefef");
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain("<!DOCTYPE html>");
    });
  });

  describe("API Routes", () => {
    it("/api/info should return API info (not the template)", async () => {
      const response = await request(app.getHttpServer()).get("/api/info");
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toHaveProperty("version");
    });

    it("/api/unknown should return 404 (not the template)", async () => {
      const response = await request(app.getHttpServer()).get("/api/unknown");
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("/api/graphql should return GraphiQL (not the template)", async () => {
      const response = await request(app.getHttpServer()).get("/api/graphql");
      // GraphiQL responds with HTML, but not the SPA template
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain("graphiql");
    });
  });
});
