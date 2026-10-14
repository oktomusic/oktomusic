/// <reference types="@types/node" />

import { spawn } from "node:child_process";
import { constants } from "node:os";
import process from "node:process";

if (!process.execve) {
  console.error("execve is not available");
  process.exit(1);
}

console.log("Running Prisma migrations...");

const migration = spawn(
  process.execPath,
  ["./node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit" },
);

let shutdownSignal: NodeJS.Signals | undefined;
const forwardSignal = (signal: NodeJS.Signals) => {
  shutdownSignal = signal;
  migration.kill(signal);
};
process.on("SIGINT", forwardSignal);
process.on("SIGTERM", forwardSignal);

const { code, signal } = await new Promise<{
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}>((resolve, reject) => {
  migration.once("error", reject);
  migration.once("exit", (code, signal) => resolve({ code, signal }));
});

process.off("SIGINT", forwardSignal);
process.off("SIGTERM", forwardSignal);

const exitSignal = shutdownSignal ?? signal;
if (exitSignal) {
  process.exit(128 + constants.signals[exitSignal]);
}
if (code !== 0) {
  process.exit(code ?? 1);
}

console.log("Migrations completed successfully");

process.execve(
  process.execPath,
  [process.execPath, "dist/main.js"],
  process.env,
);
