import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";

import { ViewsController } from "./views.controller";
import type { MetaTagsService } from "../common/metatags/metatags.service";
import type { AppConfig } from "../config/definitions/app.config";
import type { ViteConfig } from "../config/definitions/vite.config";

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
