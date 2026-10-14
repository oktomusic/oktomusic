/// <reference types="@types/node" />

import process from "node:process";

try {
  const response = await fetch(
    `http://localhost:${process.env.PORT ?? "3000"}/api/health`,
    { signal: AbortSignal.timeout(4_000) },
  );

  await response.body?.cancel();

  process.exitCode = response.ok ? 0 : 1;
} catch {
  process.exitCode = 1;
}
