import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from "@nestjs/swagger";

import { generateXspf, generateM3U } from "@oktomusic/playlists";

import { AuthGuard } from "../../common/guards/auth.guard";
import { ApiFile } from "../../common/decorators/api-file.decorator";
import { ParseCuid2Pipe } from "../../common/pipes/parse-cuid2.pipe";
import { PlaylistService } from "./playlist.service";

@ApiTags("Media")
@Controller("api/playlist")
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  private toFileSafeName(value: string): string {
    const normalized = value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_");

    return normalized.length > 0 ? normalized : "playlist";
  }

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
  async getXSPF(
    @Param("cuid", ParseCuid2Pipe) cuid: string,
  ): Promise<StreamableFile> {
    const playlistJspf = await this.playlistService.getPlaylistJspf(cuid);
    const playlistXspf = generateXspf(playlistJspf);

    const fileTitle = this.toFileSafeName(playlistJspf.playlist.title ?? cuid);
    const fileName = `${fileTitle}.xspf`;
    const fileContent = Buffer.from(playlistXspf, "utf8");

    return new StreamableFile(fileContent, {
      type: "application/xspf+xml",
      disposition: `attachment; filename="${fileName}"`,
      length: fileContent.length,
    });
  }

  @Get(":cuid/jspf")
  @UseGuards(AuthGuard)
  @ApiSecurity("session")
  @ApiOperation({
    summary: "Fetch an playlist in JSPF format (refering to the libary root)",
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
    contentType: "application/jspf+json",
    filenameExample: "Playlist_Name.jspf",
    fileSizeExample: "123456",
    successDescription:
      "Playlist file returned successfully. Response includes Content-Length, Content-Type, and Content-Disposition headers.",
  })
  async getJSPF(
    @Param("cuid", ParseCuid2Pipe) cuid: string,
  ): Promise<StreamableFile> {
    const playlistJspf = await this.playlistService.getPlaylistJspf(cuid);

    const fileTitle = this.toFileSafeName(playlistJspf.playlist.title ?? cuid);
    const fileName = `${fileTitle}.jspf`;
    const fileContent = Buffer.from(
      JSON.stringify(playlistJspf, undefined, 2),
      "utf8",
    );

    return new StreamableFile(fileContent, {
      type: "application/jspf+json",
      disposition: `attachment; filename="${fileName}"`,
      length: fileContent.length,
    });
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
  @ApiFile({
    contentType: "application/x-mpegurl",
    filenameExample: "Playlist_Name.m3u",
    fileSizeExample: "123456",
    successDescription:
      "Playlist file returned successfully. Response includes Content-Length, Content-Type, and Content-Disposition headers.",
  })
  async getM3U(
    @Param("cuid", ParseCuid2Pipe) cuid: string,
  ): Promise<StreamableFile> {
    const playlistJspf = await this.playlistService.getPlaylistJspf(cuid);
    const playlistM3U = generateM3U(playlistJspf);

    const fileTitle = this.toFileSafeName(playlistJspf.playlist.title ?? cuid);
    const fileName = `${fileTitle}.m3u`;
    const fileContent = Buffer.from(playlistM3U, "utf8");

    return new StreamableFile(fileContent, {
      type: "application/x-mpegurl",
      disposition: `attachment; filename="${fileName}"`,
      length: fileContent.length,
    });
  }
}
