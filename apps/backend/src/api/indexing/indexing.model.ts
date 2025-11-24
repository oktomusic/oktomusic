import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

export enum IndexingJobStatus {
  QUEUED = "queued",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(IndexingJobStatus, { name: "IndexingJobStatus" });

@ObjectType("IndexingJob")
export class IndexingJobModel {
  @Field()
  jobId!: string;

  @Field(() => IndexingJobStatus)
  status!: IndexingJobStatus;

  @Field({ nullable: true })
  progress?: number;

  @Field({ nullable: true })
  error?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt?: string;
}
