import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import {
  IndexingTriggerResJSONSchema,
  IndexingStatusResJSONSchema,
} from "@oktomusic/api-schemas";
import type {
  IndexingTriggerRes,
  IndexingStatusRes,
} from "@oktomusic/api-schemas";

import { AdminGuard } from "../../common/guards/admin.guard";
import { IndexingService } from "./indexing.service";

@Controller("api/indexing")
@ApiTags("Indexing")
export class IndexingController {
  constructor(private readonly indexingService: IndexingService) {}

  @Post("trigger")
  @UseGuards(AdminGuard)
  @ApiSecurity("session")
  @ApiOkResponse({
    schema: IndexingTriggerResJSONSchema as SchemaObject,
    description: "Trigger a new indexing job",
  })
  @ApiUnauthorizedResponse({ description: "Not authenticated or not admin" })
  async triggerIndexing(): Promise<IndexingTriggerRes> {
    return this.indexingService.triggerIndexing();
  }

  @Get("status/:jobId")
  @UseGuards(AdminGuard)
  @ApiSecurity("session")
  @ApiOkResponse({
    schema: IndexingStatusResJSONSchema as SchemaObject,
    description: "Get the status of an indexing job",
  })
  @ApiUnauthorizedResponse({ description: "Not authenticated or not admin" })
  @ApiNotFoundResponse({ description: "Job not found" })
  async getJobStatus(
    @Param("jobId") jobId: string,
  ): Promise<IndexingStatusRes> {
    return this.indexingService.getJobStatus(jobId);
  }
}
