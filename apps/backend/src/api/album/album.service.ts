import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../../config/definitions/app.config";
import { AlbumCoverSizeString } from "../../common/utils/sharp-utils";

@Injectable()
export class AlbumService {
  private albumCoverPath: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    this.albumCoverPath = path.resolve(this.appConf.intermediatePath, "albums");
  }

  findAlbumCoverPath(cuid: string, size: AlbumCoverSizeString) {
    const albumDir = path.resolve(this.albumCoverPath, cuid);

    if (!fs.existsSync(albumDir)) {
      return null;
    }

    const coverPath = path.resolve(albumDir, `cover_${size}.avif`);
    if (!fs.existsSync(coverPath)) {
      return null;
    }

    return coverPath;
  }
}
