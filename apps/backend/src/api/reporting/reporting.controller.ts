import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import {
  type ReportingBody,
  ReportingBodyJSONSchema,
  ReportingBodySchema,
} from "@oktomusic/api-schemas";

import { ZodValidationPipe } from "../zod.pipe";

/**
 * Handle reports sent by the client using the Reporting API
 *
 * @see https://www.w3.org/TR/reporting-1
 * @see https://developer.chrome.com/docs/capabilities/web-apis/reporting-api
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API
 */
@ApiTags("Reporting")
@Controller("api/reports")
export class ReportingController {
  private readonly logger = new Logger(ReportingController.name);

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes("application/reports+json")
  @ApiOperation({
    summary: "Receive browser reports",
    description:
      "Receives reports from the Reporting API (CSP violations, deprecations, interventions, COEP, COOP)",
  })
  @ApiBody({ schema: ReportingBodyJSONSchema as SchemaObject })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Reports received successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid report body",
  })
  receiveReport(
    @Body(new ZodValidationPipe(ReportingBodySchema)) reports: ReportingBody,
  ) {
    for (const report of reports) {
      this.logger.warn(
        `[${report.type}] ${report.url}\n${JSON.stringify(report.body, null, 2)}`,
      );
    }
  }
}
