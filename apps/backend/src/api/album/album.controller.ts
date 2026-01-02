import fs from "node:fs";
import path from "node:path";

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../../common/guards/auth.guard";
import { ApiFile } from "src/common/decorators/api-file.decorator";
import { AlbumService } from "./album.service";
import {
  albumCoverSizes,
  type AlbumCoverSizeString,
} from "../../common/utils/sharp-utils";

@ApiTags("Media")
@Controller("api/album")
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(":cuid/cover/:size")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an album cover image",
    description: "",
  })
  @ApiParam({
    name: "cuid",
    type: "string",
    schema: { maxLength: 30 },
    description: "Album CUID",
    example: "tz4a98xxat96iws9zmbrgj3a",
  })
  @ApiParam({
    name: "size",
    type: "integer",
    enum: albumCoverSizes.map((s) => s.toString()),
    enumName: "AlbumCoverSize",
    description: "Requested cover image size",
    example: "1280",
  })
  @ApiFile({
    contentType: "image/avif",
    filenameExample: "cover.avif",
    fileSizeExample: "123456",
    successDescription:
      "Album cover image file returned successfully. Response includes Content-Length, Content-Type, and Content-Disposition headers.",
  })
  getCover(
    @Param("cuid") cuid: string,
    @Param("size", new ParseEnumPipe(albumCoverSizes.map((s) => s.toString())))
    size: AlbumCoverSizeString,
  ): StreamableFile {
    const coverPath = this.albumService.findAlbumCoverPath(cuid, size);

    if (!coverPath) {
      throw new NotFoundException("No album cover file found in media library");
    }

    const stats = fs.statSync(coverPath);
    const filename = path.basename(coverPath);

    const stream = fs.createReadStream(coverPath);
    return new StreamableFile(stream, {
      type: "image/avif",
      disposition: `attachment; filename="${filename}"`,
      length: stats.size,
    });
  }
}
