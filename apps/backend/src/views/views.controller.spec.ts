import fs from "node:fs/promises";
import path from "node:path";

import { HttpStatus, NotFoundException } from "@nestjs/common";
import type { Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MetaTagsService } from "../common/metatags/metatags.service";
import type { AppConfig } from "../config/definitions/app.config";
import type { ViteConfig } from "../config/definitions/vite.config";
import { ViewsController } from "./views.controller";

vi.mock("node:fs/promises", () => ({ default: { readFile: vi.fn() } }));

const appConfig = (publicUrl?: string): AppConfig => ({
  env: "test",
  appName: "Oktomusic",
  appShortName: "Okto",
  publicUrl,
  databaseUrl: "postgresql://unused",
  isDev: false,
  isProd: false,
  isTest: true,
  sessionSecret: "unused",
  libraryPath: "/tmp/oktomusic-library",
  intermediatePath: "/tmp/oktomusic-intermediate",
  ffmpegPath: undefined,
  ffprobePath: undefined,
  metaflacPath: undefined,
});

const viteConfig: ViteConfig = {
  origin: "http://localhost:5173",
  base: "/",
};

const responseMock = () => {
  const render = vi.fn();
  const sendStatus = vi.fn();
  const type = vi.fn();
  const setHeader = vi.fn();

  return {
    res: { render, sendStatus, type, setHeader } as unknown as Response,
    render,
    sendStatus,
    type,
    setHeader,
  };
};

const controller = (publicUrl?: string) =>
  new ViewsController({} as MetaTagsService, appConfig(publicUrl), viteConfig);

describe("ViewsController", () => {
  describe("sbom", () => {
    afterEach(() => vi.mocked(fs.readFile).mockReset());

    it("serves the generated BOM with the CycloneDX media type", async () => {
      const file = Buffer.from('{"bomFormat":"CycloneDX"}');
      vi.mocked(fs.readFile).mockResolvedValue(file);

      const response = await controller().sbom();

      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(__dirname, "../sbom.cdx.json"),
      );
      expect(response.getHeaders()).toEqual({
        type: "application/vnd.cyclonedx+json",
        disposition: 'inline; filename="sbom.cdx.json"',
        length: file.length,
      });
      const chunks = [];
      for await (const chunk of response.getStream()) chunks.push(chunk);
      expect(Buffer.concat(chunks)).toEqual(file);
    });

    it("returns 404 when the BOM has not been generated", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error("missing"), { code: "ENOENT" }),
      );

      const error = await controller()
        .sbom()
        .catch((error: unknown) => error);
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).getStatus()).toBe(
        HttpStatus.NOT_FOUND,
      );
    });

    it("propagates read failures other than missing files", async () => {
      const error = Object.assign(new Error("denied"), { code: "EACCES" });
      vi.mocked(fs.readFile).mockRejectedValue(error);

      await expect(controller().sbom()).rejects.toBe(error);
    });
  });

  describe("opensearch", () => {
    it("returns 404 when no public URL is configured", () => {
      const { res, render, sendStatus, setHeader, type } = responseMock();

      controller().opensearch(res);

      expect(sendStatus).toHaveBeenCalledWith(404);
      expect(render).not.toHaveBeenCalled();
      expect(type).not.toHaveBeenCalled();
      expect(setHeader).not.toHaveBeenCalled();
    });

    it("renders the OpenSearch description with the configured public URL", () => {
      const { res, render, sendStatus, setHeader, type } = responseMock();

      controller("https://music.example.com").opensearch(res);

      expect(sendStatus).not.toHaveBeenCalled();
      expect(type).toHaveBeenCalledWith(
        "application/opensearchdescription+xml",
      );
      expect(setHeader).toHaveBeenCalledWith("Content-Disposition", "inline");
      expect(setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "public, max-age=0, s-maxage=0, must-revalidate",
      );
      expect(render).toHaveBeenCalledWith("opensearch", {
        appName: "Oktomusic",
        appShortName: "Okto",
        baseUrl: "https://music.example.com",
      });
    });
  });
});
