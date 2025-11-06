import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";

import { SessionService } from "./session.service";

describe("SessionService", () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("storeTempAuthState and retrieveTempAuthState", () => {
    it("should store and retrieve temp auth state", () => {
      service.storeTempAuthState("session123", "verifier123", "state456");

      const result = service.retrieveTempAuthState("session123");

      expect(result).toEqual({
        codeVerifier: "verifier123",
        state: "state456",
      });
    });

    it("should return null for non-existent session", () => {
      const result = service.retrieveTempAuthState("nonexistent");

      expect(result).toBeNull();
    });

    it("should remove temp state after retrieval", () => {
      service.storeTempAuthState("session123", "verifier123");

      service.retrieveTempAuthState("session123");
      const secondRetrieval = service.retrieveTempAuthState("session123");

      expect(secondRetrieval).toBeNull();
    });

    it("should return null for expired temp state", () => {
      // Mock Date.now to control time
      const now = Date.now();
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(now) // During storage
        .mockReturnValueOnce(now + 11 * 60 * 1000); // 11 minutes later (expired)

      service.storeTempAuthState("session123", "verifier123");

      const result = service.retrieveTempAuthState("session123");

      expect(result).toBeNull();
    });
  });

  describe("storeSession and getSession", () => {
    it("should store and retrieve session", () => {
      const sessionData = {
        accessToken: "at123",
        refreshToken: "rt456",
        expiresAt: Date.now() + 3600000,
        userInfo: { sub: "user123" },
      };

      service.storeSession("session123", sessionData);
      const result = service.getSession("session123");

      expect(result).toEqual(sessionData);
    });

    it("should return null for non-existent session", () => {
      const result = service.getSession("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null for expired session", () => {
      const now = Date.now();
      const sessionData = {
        accessToken: "at123",
        expiresAt: now - 1000, // Already expired
      };

      service.storeSession("session123", sessionData);

      const result = service.getSession("session123");

      expect(result).toBeNull();
    });
  });

  describe("updateSession", () => {
    it("should update existing session", () => {
      const initialData = {
        accessToken: "old-at",
        refreshToken: "rt123",
        expiresAt: Date.now() + 3600000,
      };

      service.storeSession("session123", initialData);

      service.updateSession("session123", {
        accessToken: "new-at",
        expiresAt: Date.now() + 7200000,
      });

      const result = service.getSession("session123");

      expect(result).toEqual({
        accessToken: "new-at",
        refreshToken: "rt123",
        // Cast to satisfy TS ESLint: asymmetric matcher is typed as `any`
        expiresAt: expect.any(Number) as unknown as number,
      });
      expect(result!.accessToken).toBe("new-at");
    });

    it("should not crash when updating non-existent session", () => {
      expect(() => {
        service.updateSession("nonexistent", { accessToken: "new-at" });
      }).not.toThrow();
    });
  });

  describe("deleteSession", () => {
    it("should delete session", () => {
      const sessionData = {
        accessToken: "at123",
        expiresAt: Date.now() + 3600000,
      };

      service.storeSession("session123", sessionData);
      service.deleteSession("session123");

      const result = service.getSession("session123");

      expect(result).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("should remove expired sessions", () => {
      const now = Date.now();

      // Store expired session
      service.storeSession("expired-session", {
        accessToken: "at123",
        expiresAt: now - 1000,
      });

      // Store valid session
      service.storeSession("valid-session", {
        accessToken: "at456",
        expiresAt: now + 3600000,
      });

      service.cleanup();

      expect(service.getSession("expired-session")).toBeNull();
      expect(service.getSession("valid-session")).not.toBeNull();
    });

    it("should remove expired temp states", () => {
      const now = Date.now();

      // Mock Date.now
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(now - 11 * 60 * 1000) // During storage (11 minutes ago)
        .mockReturnValueOnce(now); // During cleanup

      service.storeTempAuthState("expired-temp", "verifier123");

      service.cleanup();

      const result = service.retrieveTempAuthState("expired-temp");

      expect(result).toBeNull();
    });
  });
});
