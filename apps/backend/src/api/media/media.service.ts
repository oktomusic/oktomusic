import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../../config/definitions/app.config";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class MediaService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * @todo Valkey cache integration to prevent spamming DB
   */
  async findFlacFile(cuid: string): Promise<string | null> {
    const flacFile = await this.prismaService.flacFile.findUnique({
      where: { id: cuid },
    });

    if (!flacFile) {
      return null;
    }

    const fullPath = path.resolve(
      this.appConf.libraryPath,
      flacFile.relativePath,
    );

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    return fullPath;
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
