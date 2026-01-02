import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

// https://github.com/paralleldrive/cuid2
// https://www.prisma.io/docs/orm/reference/prisma-schema-reference#cuid

const CUID2_REGEX = /^[a-z0-9]+$/;

@Injectable()
export class ParseCuid2Pipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string") {
      throw new BadRequestException("Invalid CUID");
    }

    if (value.length === 0 || value.length > 30) {
      throw new BadRequestException("Invalid CUID");
    }

    if (!CUID2_REGEX.test(value)) {
      throw new BadRequestException("Invalid CUID");
    }

    return value;
  }
}

export { CUID2_REGEX };
