import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ZodObject } from "zod";
import { $ZodError, $ZodIssue } from "zod/v4/core";

export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private schema: ZodObject) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (err) {
      if (err instanceof $ZodError) {
        const issues = err.issues.map((e: $ZodIssue) => ({
          path: e.path.map(String).join("."),
          message: e.message,
          code: e.code,
        }));
        this.logger.warn(
          `Validation failed for ${metadata.type}${metadata.data ? `:${metadata.data}` : ""}: ${JSON.stringify(issues)}`,
        );
      } else {
        this.logger.error(
          `Unexpected error in validation for ${metadata.type}${metadata.data ? `:${metadata.data}` : ""}`,
          (err as Error)?.stack,
        );
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
