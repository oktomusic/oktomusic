import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { AuthGuard } from "../../common/guards/auth.guard";
import { ApiRangeStream } from "../../common/decorators/api-range-stream.decorator";
import { createRangeStream } from "../../common/utils/range-stream.util";
import { MediaService } from "./media.service";
import { ParseCuid2Pipe } from "src/common/pipes/parse-cuid2.pipe";

@ApiTags("Media")
@Controller("api/media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(":cuid")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Stream FLAC audio file",
    description:
      "Streams a FLAC audio file with full HTTP range header support for seeking and partial content delivery. Supports both full file requests and partial content (range) requests.",
  })
  @ApiParam({
    name: "cuid",
    type: "string",
    description: "Media file CUID",
    example: "tz4a98xxat96iws9zmbrgj3a",
  })
  @ApiRangeStream({
    contentType: "audio/flac",
    filenameExample: "song.flac",
    successDescription:
      "Full FLAC audio file stream returned successfully. Response includes Accept-Ranges, Content-Length, Content-Type, and Content-Disposition headers.",
    partialDescription:
      "Partial FLAC audio content returned for range request. Response includes Content-Range, Content-Length, Content-Type, and Content-Disposition headers.",
  })
  async getMediaSourceOriginal(
    @Param("cuid", ParseCuid2Pipe) cuid: string,
    @Headers("range") range: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const flacPath = await this.mediaService.findFlacFile(cuid);

    if (!flacPath) {
      throw new NotFoundException("No FLAC file found in media library");
    }

    const stats = this.mediaService.getFileStats(flacPath);
    if (!stats) {
      throw new NotFoundException("FLAC file not accessible");
    }

    return createRangeStream(res, {
      filePath: flacPath,
      fileSize: stats.size,
      range,
      contentType: "audio/flac",
    });
  }
}
