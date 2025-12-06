import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../../config/definitions/app.config";

@Injectable()
export class AlbumService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {}

  findFirstCoverFile(): string | null {
    const findCover = (dir: string): string | null => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (
            entry.isFile() &&
            entry.name.toLowerCase().endsWith("_1280x.avif")
          ) {
            return path.join(dir, entry.name);
          }
        }

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const result = findCover(path.join(dir, entry.name));
            if (result) return result;
          }
        }
      } catch {
        return null;
      }

      return null;
    };

    return findCover(this.appConf.libraryPath);
  }
}
