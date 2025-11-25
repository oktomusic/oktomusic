import { Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";

import { PUB_SUB } from "../../common/pubsub/pubsub.module";
import { GraphqlAdminGuard } from "../../common/guards/graphql-admin.guard";
import { IndexingJobModel } from "./indexing.model";
import { IndexingService } from "./indexing.service";
import { INDEXING_JOB_UPDATED } from "./indexing.constants";

interface IndexingJobPayload {
  indexingJobUpdated: IndexingJobModel;
}

interface SubscriptionVariables {
  jobId: string;
}

@Resolver(() => IndexingJobModel)
export class IndexingResolver {
  constructor(
    private readonly indexingService: IndexingService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  @Subscription(() => IndexingJobModel, {
    description: "Subscribe to indexing job status updates",
    filter: (
      payload: IndexingJobPayload,
      variables: SubscriptionVariables,
    ) => {
      return payload.indexingJobUpdated.jobId === variables.jobId;
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  indexingJobUpdated(@Args("jobId") jobId: string) {
    return this.pubSub.asyncIterableIterator(INDEXING_JOB_UPDATED);
  }
}
