import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import z from "zod";

/**
 * Zod transformer to validate a binary path
 *
 * @param name Display name of the binary for error logging purposes
 * @param shouldRun Array of parameters to run the binary with as an additional check (should return exit code 0)
 */
function zBinaryPath(name: string, shouldRun?: string[]) {
  return z.string().transform((arg, ctx) => {
    if (!arg) {
      return undefined;
    }

    const exePath = path.resolve(arg);
    const exist = fs.existsSync(exePath);

    if (!exist) {
      ctx.issues.push({
        code: "custom",
        message: `${name} path specified, but doesn't exist`,
        input: exePath,
      });
      return z.NEVER;
    }

    const isExecutable =
      fs.accessSync(exePath, fs.constants.X_OK) === undefined;

    if (!isExecutable) {
      ctx.issues.push({
        code: "custom",
        message: `${name} path specified, but is not executable`,
        input: exePath,
      });
      return z.NEVER;
    }

    if (shouldRun) {
      const result = spawnSync(exePath, shouldRun, {
        encoding: "utf-8",
      });

      if (result.error || result.status !== 0) {
        ctx.issues.push({
          code: "custom",
          message: `${name} path specified, but failed to run`,
          input: exePath,
        });
        return z.NEVER;
      }
    }

    return exePath;
  });
}

/**
 * Zod transformer to validate a folder path
 *
 * @param name Display name of the directory for error logging purposes
 * @param writable Whether to check if the directory is writable
 * @returns
 */
function zFolderPath(name: string, writable?: boolean) {
  return z.string().transform((arg, ctx) => {
    const libPath = path.resolve(arg);
    const exist = fs.existsSync(libPath);
    const isDir = exist && fs.lstatSync(libPath).isDirectory();

    if (!isDir) {
      ctx.issues.push({
        code: "custom",
        message: `${name} path must exist and be a directory`,
        input: libPath,
      });
      return z.NEVER;
    }

    if (writable) {
      const isWritable =
        fs.accessSync(libPath, fs.constants.W_OK) === undefined;

      if (!isWritable) {
        ctx.issues.push({
          code: "custom",
          message: `${name} path is not writable`,
          input: libPath,
        });
        return z.NEVER;
      }
    }

    return libPath;
  });
}

export { zBinaryPath, zFolderPath };
