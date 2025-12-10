#!/usr/bin/env tsx

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type FFMpegFlag = [string, string?];
type FFMpegFlagSet = FFMpegFlag[];

interface OpusQualityPreset {
  readonly name: string;
  readonly bitrateKbps: number;
  readonly additionalFlags?: FFMpegFlagSet;
}

const defaultFFMpegFlags: FFMpegFlagSet = [
  ["-c:a", "libopus"],
  ["-vbr", "on"],
  ["-application", "audio"],
  ["-compression_level", "10"],
  ["-mapping_family", "0"],
  ["-max_delay", "0"],
  // -opus_header gain=0
] as const;

const qualities: OpusQualityPreset[] = [
  {
    name: "Low",
    bitrateKbps: 24,
    additionalFlags: [["-frame_duration", "60"]],
  },
  {
    name: "Normal",
    bitrateKbps: 96,
  },
  {
    name: "High",
    bitrateKbps: 160,
  },
  {
    name: "Very High",
    bitrateKbps: 320,
  },
] as const;

enum OpusQualityPresetsDef {
  Low = "low",
  Normal = "normal",
  High = "high",
  VeryHigh = "veryhigh",
}

function getFFmpegFlagsForQuality(quality: OpusQualityPreset): FFMpegFlagSet {
  const flags: FFMpegFlagSet = [...defaultFFMpegFlags];
  flags.push(["-b:a", `${quality.bitrateKbps}k`]);
  return flags;
}

function flatFFmpegFlags(flags: FFMpegFlagSet): string[] {
  const out: string[] = [];
  for (const [k, v] of flags) {
    out.push(k);
    if (typeof v !== "undefined") out.push(v);
  }
  return out;
}
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: ffmpeg_quality.ts <input.flac>");
    process.exit(1);
  }

  const input = args[0];
  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(2);
  }

  const ext = path.extname(input);
  const base = path.basename(input, ext);
  const dir = path.dirname(input);

  const slugs = [
    OpusQualityPresetsDef.Low,
    OpusQualityPresetsDef.Normal,
    OpusQualityPresetsDef.High,
    OpusQualityPresetsDef.VeryHigh,
  ];

  for (let i = 0; i < qualities.length; i++) {
    const preset = qualities[i];
    const slug = slugs[i] ?? `${preset.bitrateKbps}`;
    const outName = `${base}_${slug}.opus`;
    const outPath = path.join(dir, outName);

    const flags = getFFmpegFlagsForQuality(preset);
    const ffArgs = ["-y", "-i", input, ...flatFFmpegFlags(flags), outPath];

    console.log(`Encoding ${slug} -> ${outPath} (${preset.bitrateKbps} kbps)`);
    const res = spawnSync("ffmpeg", ffArgs, { stdio: "inherit" });
    if (res.error) {
      console.error("Failed to start ffmpeg:", res.error);
      process.exit(3);
    }
    if ((res.status ?? 1) !== 0) {
      console.error(`ffmpeg exited with code ${res.status ?? 1}`);
      process.exit(res.status ?? 1);
    }
  }

  console.log("All encodes finished");
}

void main();
