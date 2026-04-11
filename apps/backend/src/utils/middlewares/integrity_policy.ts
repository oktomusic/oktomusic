import { NextFunction, Request, Response } from "express";

/**
 * Force all script resources to provide SRI hashes in production.
 *
 * @todo Also block styles when supported by browsers
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy
 */
export function integrityPolicyMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader("Integrity-Policy", "blocked-destinations=(script)");
  next();
}
