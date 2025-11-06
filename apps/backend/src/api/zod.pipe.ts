import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from "@nestjs/common";

import z, { type ZodType } from "zod";

export class ZodValidationPipe<T extends ZodType>
  implements PipeTransform<unknown, z.output<T>>
{
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: T) {}

  transform(value: unknown, metadata: ArgumentMetadata): z.output<T> {
    const result = this.schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const err = result.error;
    const issues = err.issues.map((e) => ({
      path: e.path.map(String).join("."),
      message: e.message,
      code: e.code,
    }));

    this.logger.warn(
      `Validation failed for ${metadata.type}${metadata.data ? `:${metadata.data}` : ""}: ${JSON.stringify(issues)}`,
    );

    throw new BadRequestException("Validation failed");
  }
}
