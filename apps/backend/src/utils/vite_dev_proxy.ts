import { NextFunction, Request, Response } from "express";

export const vitePrefixes = [
  "/dev-sw.js",
  "/src/sw",
  "/node_modules/",
] as const;

export function proxyMiddleware(baseUrl: string, prefixes: readonly string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!prefixes.some((p) => req.url.startsWith(p))) {
      return next();
    }

    const targetUrl = `${baseUrl}${req.url}`;

    const viteRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // forward minimal safe headers
        accept: req.headers.accept ?? "*/*",
      },
    });

    // Copy status
    res.status(viteRes.status);

    // Forward all headers from Vite
    viteRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.send(await viteRes.text());
  };
}
