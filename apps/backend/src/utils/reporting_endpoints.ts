import type { NextFunction, Request, Response } from "express";

/**
 * Reporting API endpoint name
 *
 * Used as the reference name in `report-to` CSP directive
 * and `Reporting-Endpoints` header
 */
export const REPORTING_ENDPOINT_NAME = "default";

/**
 * Reporting API endpoint path
 */
export const REPORTING_ENDPOINT_PATH = "/api/reports";

/**
 * Middleware to set the `Reporting-Endpoints` header
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints
 */
export function reportingEndpointsMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader(
    "Reporting-Endpoints",
    `${REPORTING_ENDPOINT_NAME}="${REPORTING_ENDPOINT_PATH}"`,
  );
  next();
}
