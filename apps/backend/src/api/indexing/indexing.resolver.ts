import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { GraphqlAdminGuard } from "../../common/guards/graphql-admin.guard";
import { IndexingJobModel } from "./indexing.model";
import { IndexingService } from "./indexing.service";

@Resolver(() => IndexingJobModel)
export class IndexingResolver {
  constructor(private readonly indexingService: IndexingService) {}

  @UseGuards(GraphqlAdminGuard)
  @Mutation(() => IndexingJobModel, {
    description: "Trigger a new library indexing job",
  })
  async triggerIndexing(): Promise<IndexingJobModel> {
    return this.indexingService.triggerIndexing();
  }

  @UseGuards(GraphqlAdminGuard)
  @Query(() => IndexingJobModel, {
    description: "Get the status of an indexing job",
  })
  async indexingJobStatus(
    @Args("jobId") jobId: string,
  ): Promise<IndexingJobModel> {
    return this.indexingService.getJobStatus(jobId);
  }
}
