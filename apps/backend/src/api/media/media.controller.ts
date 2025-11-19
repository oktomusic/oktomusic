import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
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

@ApiTags("Media")
@Controller("api/media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(":uuid")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Stream FLAC audio file",
    description:
      "Streams a FLAC audio file with full HTTP range header support for seeking and partial content delivery. Currently serves the first FLAC file found in the media library, ignoring the UUID parameter. Supports both full file requests and partial content (range) requests.",
  })
  @ApiParam({
    name: "uuid",
    type: "string",
    format: "uuid",
    description:
      "Media file UUID (currently ignored, serves first FLAC file found in library)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiRangeStream({
    contentType: "audio/flac",
    filenameExample: "song.flac",
    successDescription:
      "Full FLAC audio file stream returned successfully. Response includes Accept-Ranges, Content-Length, Content-Type, and Content-Disposition headers.",
    partialDescription:
      "Partial FLAC audio content returned for range request. Response includes Content-Range, Content-Length, Content-Type, and Content-Disposition headers.",
  })
  getMediaSourceQuality(
    @Param("uuid", new ParseUUIDPipe({ version: "4" })) _id: string,
    @Headers("range") range: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    // Find first FLAC file in library (ignoring UUID for now)
    const flacPath = this.mediaService.findFirstFlacFile();

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
