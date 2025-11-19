import { applyDecorators, Header, HttpStatus } from "@nestjs/common";
import {
  ApiHeader,
  ApiProduces,
  ApiResponse,
  ApiResponseOptions,
} from "@nestjs/swagger";

export interface ApiRangeStreamOptions {
  /** Content type (MIME type) of the streamed file */
  contentType: string;
  /** Example content type for documentation */
  contentTypeExample?: string;
  /** Example file size for documentation */
  fileSizeExample?: string;
  /** Example filename for documentation */
  filenameExample?: string;
  /** Success response description */
  successDescription?: string;
  /** Partial content response description */
  partialDescription?: string;
}

/**
 * Composite decorator for streaming endpoints with range support
 * Includes all necessary Swagger documentation and headers
 */
export function ApiRangeStream(options: ApiRangeStreamOptions) {
  const {
    contentType,
    contentTypeExample = contentType,
    fileSizeExample = "45678901",
    filenameExample = "file.ext",
    successDescription = "Full file stream returned successfully. Response includes Accept-Ranges, Content-Length, Content-Type, and Content-Disposition headers.",
    partialDescription = "Partial content returned for range request. Response includes Content-Range, Content-Length, Content-Type, and Content-Disposition headers.",
  } = options;

  const commonHeaders = {
    "Content-Type": {
      description: "MIME type of the file",
      schema: { type: "string", example: contentTypeExample },
    },
    "Content-Disposition": {
      description: "Provides the filename for download",
      schema: {
        type: "string",
        example: `attachment; filename="${filenameExample}"`,
      },
    },
  };

  const fullResponseOptions: ApiResponseOptions = {
    status: HttpStatus.OK,
    description: successDescription,
    headers: {
      "Accept-Ranges": {
        description: "Indicates that the server supports range requests",
        schema: { type: "string", example: "bytes" },
      },
      "Content-Length": {
        description: "Size of the file in bytes",
        schema: { type: "string", example: fileSizeExample },
      },
      ...commonHeaders,
    },
  };

  const partialResponseOptions: ApiResponseOptions = {
    status: HttpStatus.PARTIAL_CONTENT,
    description: partialDescription,
    headers: {
      "Content-Range": {
        description: "Indicates the range of bytes being returned",
        schema: {
          type: "string",
          example: `bytes 0-1023/${fileSizeExample}`,
        },
      },
      "Content-Length": {
        description: "Size of the partial content in bytes",
        schema: { type: "string", example: "1024" },
      },
      "Accept-Ranges": {
        description: "Indicates that the server supports range requests",
        schema: { type: "string", example: "bytes" },
      },
      ...commonHeaders,
    },
  };

  return applyDecorators(
    Header("Accept-Ranges", "bytes"),
    ApiProduces(contentType),
    ApiHeader({
      name: "Range",
      description:
        "HTTP Range header for partial content requests (e.g., 'bytes=0-1023' or 'bytes=1024-')",
      required: false,
      schema: {
        type: "string",
        example: "bytes=0-1023",
      },
    }),
    ApiResponse(fullResponseOptions),
    ApiResponse(partialResponseOptions),
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
