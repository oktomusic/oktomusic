import {
  Controller,
  Get,
  NotImplementedException,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from "@nestjs/swagger";

import { AuthGuard } from "../../common/guards/auth.guard";

import { PlaylistService } from "./playlist.service";
import { ApiFile } from "../../common/decorators/api-file.decorator";

@ApiTags("Media")
@Controller("api/playlist")
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get(":cuid/xspf")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an playlist in XSPF format (refering to the libary root)",
    description: "",
  })
  @ApiParam({
    name: "cuid",
    type: "string",
    schema: { maxLength: 30 },
    description: "Playlist CUID",
    example: "tz4a98xxat96iws9zmbrgj3a",
  })
  @ApiFile({
    contentType: "application/xspf+xml",
    filenameExample: "Playlist_Name.xspf",
    fileSizeExample: "123456",
    successDescription:
      "Playlist file returned successfully. Response includes Content-Length, Content-Type, and Content-Disposition headers.",
  })
  getXSPF() {
    throw new NotImplementedException(
      "XSPF playlist export not implemented yet",
    );
  }

  @Get(":cuid/m3u")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an playlist in M3U format (refering to the libary root)",
    description: "",
  })
  @ApiParam({
    name: "cuid",
    type: "string",
    schema: { maxLength: 30 },
    description: "Playlist CUID",
    example: "tz4a98xxat96iws9zmbrgj3a",
  })
  getM3U() {
    throw new NotImplementedException(
      "M3U playlist export not implemented yet",
    );
  }

  @Get(":cuid/pls")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an playlist in PLS format (refering to the libary root)",
    description: "",
  })
  @ApiParam({
    name: "cuid",
    type: "string",
    schema: { maxLength: 30 },
    description: "Playlist CUID",
    example: "tz4a98xxat96iws9zmbrgj3a",
  })
  getPLS() {
    throw new NotImplementedException(
      "PLS playlist export not implemented yet",
    );
  }
}
