import fs from "node:fs";
import path from "node:path";

import { HttpStatus, StreamableFile } from "@nestjs/common";
import type { Response } from "express";

export interface RangeStreamOptions {
  filePath: string;
  fileSize: number;
  range?: string;
  contentType: string;
}

export interface RangeStreamResult {
  streamableFile: StreamableFile;
  status: HttpStatus;
}

/**
 * Create a streamable file response with range support
 * Handles both full file requests and partial content (range) requests
 */
export function createRangeStream(
  res: Response,
  options: RangeStreamOptions,
): StreamableFile {
  const { filePath, fileSize, range, contentType } = options;
  const fileName = path.basename(filePath);
  const disposition = "attachment";

  // Handle range request
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(parts[0], 10);
    const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.status(HttpStatus.PARTIAL_CONTENT);
    res.set({
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Length": chunkSize.toString(),
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${fileName}"`,
    });

    return new StreamableFile(fileStream);
  }

  // Full file request
  const fileStream = fs.createReadStream(filePath);
  res.set({
    "Content-Length": fileSize.toString(),
    "Content-Type": contentType,
    "Content-Disposition": `${disposition}; filename="${fileName}"`,
  });

  return new StreamableFile(fileStream);
}
