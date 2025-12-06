import fs from "node:fs";
import path from "node:path";

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../../common/guards/auth.guard";
import { ApiFile } from "src/common/decorators/api-file.decorator";
import { AlbumService } from "./album.service";

@ApiTags("Media")
@Controller("api/album")
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(":uuid/cover")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an album cover image",
    description: "",
  })
  @ApiParam({
    name: "uuid",
    type: "string",
    format: "uuid",
    description:
      "Album UUID (currently ignored, serves first cover file found in library)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiFile({
    contentType: "image/avif",
    filenameExample: "cover.avif",
    fileSizeExample: "123456",
    successDescription:
      "Album cover image file returned successfully. Response includes Content-Length, Content-Type, and Content-Disposition headers.",
  })
  getCover(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param("uuid", new ParseUUIDPipe({ version: "4" })) _id: string,
  ): StreamableFile {
    // Find first cover image in library (ignoring UUID for now)
    const coverPath = this.albumService.findFirstCoverFile();

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
