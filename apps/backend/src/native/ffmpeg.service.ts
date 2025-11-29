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
  index: number;
  sample_rate: string;
  bits_per_raw_sample: string;
  [key: string]: unknown;
}

interface FFProbeFormat {
  streams: FFProbeStream[];
  format: unknown;
}

// Extracted FFProbe information

export interface FFProbeOutput {
  sampleRate: number;
  bitsPerRawSample: number;
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

      return {
        sampleRate,
        bitsPerRawSample,
      };
    } catch (error) {
      throw new Error(
        `Unable to execute ffprobe: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
