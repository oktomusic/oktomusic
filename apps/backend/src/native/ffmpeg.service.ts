import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Inject, Injectable } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";

import appConfig from "../config/definitions/app.config";

const execFileAsync = promisify(execFile);

const ffprobeArgs = [
  "-v",
  "quiet",
  "-print_format",
  "json",
  "-show_format",
  "-show_streams",
] as const;

// Partial FFProbe output types

interface FFProbeStream {
  readonly index: number;
  readonly sample_rate: string;
  readonly bits_per_raw_sample: string;
  readonly [key: string]: unknown;
}

interface FFProbeFormat {
  readonly duration: string;
  readonly size: string;
  readonly bit_rate: string;
  readonly [key: string]: unknown;
}

interface FFProbeFormat {
  readonly streams: FFProbeStream[];
  readonly format: FFProbeFormat;
}

// Extracted FFProbe information

export interface FFProbeOutput {
  readonly sampleRate: number;
  readonly bitsPerRawSample: number;
  readonly durationMs: number;
  readonly fileSize: number;
  readonly bitRate: number;
}

@Injectable()
export class FFmpegService {
  private readonly ffmpegBinary: string;
  private readonly ffprobeBinary: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    this.ffmpegBinary = this.appConf.ffmpegPath ?? "ffmpeg";
    this.ffprobeBinary = this.appConf.ffprobePath ?? "ffprobe";
  }

  public async ffprobeInformations(filePath: string): Promise<FFProbeOutput> {
    try {
      const { stdout } = await execFileAsync(this.ffprobeBinary, [
        ...ffprobeArgs,
        filePath,
      ]);

      const parsed: FFProbeFormat = JSON.parse(
        stdout,
      ) as unknown as FFProbeFormat;

      const audioStream = parsed.streams[0];

      const sampleRate = parseInt(audioStream.sample_rate, 10);
      const bitsPerRawSample = parseInt(audioStream.bits_per_raw_sample, 10);
      const durationMs = Math.floor(parseFloat(parsed.format.duration) * 1000);
      const fileSize = parseInt(parsed.format.size, 10);
      const bitRate = parseInt(parsed.format.bit_rate, 10);

      return {
        sampleRate,
        bitsPerRawSample,
        durationMs,
        fileSize,
        bitRate,
      };
    } catch (error) {
      throw new Error(
        `Unable to execute ffprobe: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
