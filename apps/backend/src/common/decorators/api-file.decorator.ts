import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiProduces, ApiResponse, ApiResponseOptions } from "@nestjs/swagger";

export interface ApiFileOptions {
  /** Content type (MIME type) of the served file */
  readonly contentType: string;
  /** Example file size for documentation */
  readonly fileSizeExample: string;
  /** Example filename for documentation */
  readonly filenameExample: string;
  /** Success response description */
  readonly successDescription: string;
}

/**
 * Composite decorator for file serving endpoints
 * Includes all necessary Swagger documentation and headers
 */
export function ApiFile(options: ApiFileOptions) {
  const commonHeaders = {
    "Content-Type": {
      description: "MIME type of the file",
      schema: { type: "string", example: options.contentType },
    },
    "Content-Disposition": {
      description: "Provides the filename for download",
      schema: {
        type: "string",
        example: `attachment; filename="${options.filenameExample}"`,
      },
    },
  };

  const fullResponseOptions: ApiResponseOptions = {
    status: HttpStatus.OK,
    description: options.successDescription,
    headers: {
      "Content-Length": {
        description: "Size of the file in bytes",
        schema: { type: "string", example: options.fileSizeExample },
      },
      ...commonHeaders,
    },
  };

  return applyDecorators(
    ApiProduces(options.contentType),
    ApiResponse(fullResponseOptions),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: "File not found or not accessible",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 404 },
          message: { type: "string", example: "File not found" },
          error: { type: "string", example: "Not Found" },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: "Authentication required. User is not authenticated.",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: { type: "string", example: "Unauthorized" },
        },
      },
    }),
  );
}
