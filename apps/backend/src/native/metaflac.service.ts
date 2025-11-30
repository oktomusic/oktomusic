import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { parseMetaflacTags, MetaflacTags } from "@oktomusic/metaflac-parser";
import { MetaflacError } from "./metaflac-error";

import appConfig from "../config/definitions/app.config";

const execFileAsync = promisify(execFile);

@Injectable()
export class MetaflacService {
  private readonly metaflacBinary: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    this.metaflacBinary = this.appConf.metaflacPath ?? "metaflac";
  }

  async extractTags(filePath: string): Promise<MetaflacTags> {
    try {
      const { stdout, stderr } = await execFileAsync(this.metaflacBinary, [
        "--export-tags-to=-",
        filePath,
      ]);

      const trimmedStderr = stderr?.toString().trim();
      if (trimmedStderr) {
        throw new MetaflacError(`metaflac reported warnings: ${trimmedStderr}`);
      }

      return parseMetaflacTags(stdout.toString());
    } catch (error) {
      throw new MetaflacError(
        `Unable to parse FLAC metadata: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }
}
