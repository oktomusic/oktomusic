import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../../config/definitions/app.config";

@Injectable()
export class MediaService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {}

  /**
   * Find the first FLAC file in the media library recursively
   */
  findFirstFlacFile(): string | null {
    const findFlac = (dir: string): string | null => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.toLowerCase().endsWith(".flac")) {
            return path.join(dir, entry.name);
          }
        }

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const result = findFlac(path.join(dir, entry.name));
            if (result) return result;
          }
        }
      } catch {
        return null;
      }

      return null;
    };

    return findFlac(this.appConf.libraryPath);
  }

  /**
   * Get file stats for range request handling
   */
  getFileStats(filePath: string): fs.Stats | null {
    try {
      return fs.statSync(filePath);
    } catch {
      return null;
    }
  }
}
