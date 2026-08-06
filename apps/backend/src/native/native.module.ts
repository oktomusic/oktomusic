import { Module } from "@nestjs/common";

import { FFmpegService } from "./ffmpeg.service";
import { MetaflacService } from "./metaflac.service";

@Module({
  exports: [MetaflacService, FFmpegService],
  providers: [MetaflacService, FFmpegService],
})
export class NativeModule {}
