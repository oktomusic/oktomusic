import { Module } from "@nestjs/common";
import { MetaflacService } from "./metaflac.service";
import { FFmpegService } from "./ffmpeg.service";

@Module({
  exports: [MetaflacService, FFmpegService],
  providers: [MetaflacService, FFmpegService],
})
export class NativeModule {}
