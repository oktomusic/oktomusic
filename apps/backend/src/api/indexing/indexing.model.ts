import {
  Field,
  ObjectType,
  createUnionType,
  registerEnumType,
} from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

import {
  type IndexingErrorMetaflacParsing,
  IndexingReportType,
  type IndexingWarning,
  type IndexingWarningFolderMetadata,
  type IndexingWarningSubdirectories,
} from "../../bullmq/processors/errors";

export enum IndexingJobStatus {
  QUEUED = "queued",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(IndexingJobStatus, { name: "IndexingJobStatus" });
registerEnumType(IndexingReportType, { name: "IndexingReportType" });

@ObjectType("IndexingErrorMetaflacParsing")
export class IndexingErrorMetaflacParsingModel
  implements IndexingErrorMetaflacParsing
{
  @Field(() => IndexingReportType)
  type!: IndexingReportType.ERROR_METAFLAC_PARSING;

  @Field()
  filePath!: string;

  @Field()
  errorMessage!: string;
}

@ObjectType("IndexingWarningSubdirectories")
export class IndexingWarningSubdirectoriesModel
  implements IndexingWarningSubdirectories
{
  @Field(() => IndexingReportType)
  type!: IndexingReportType.WARNING_SUBDIRECTORIES;

  @Field()
  dirPath!: string;
}

@ObjectType("IndexingWarningFolderMetadata")
export class IndexingWarningFolderMetadataModel
  implements IndexingWarningFolderMetadata
{
  @Field(() => IndexingReportType)
  type!: IndexingReportType.WARNING_FOLDER_METADATA;

  @Field()
  folderPath!: string;

  @Field(() => [String])
  messages!: string[];
}

export const IndexingWarningUnion = createUnionType({
  name: "IndexingWarning",
  types: () =>
    [
      IndexingErrorMetaflacParsingModel,
      IndexingWarningSubdirectoriesModel,
      IndexingWarningFolderMetadataModel,
    ] as const,
  resolveType(value: IndexingWarning) {
    switch (value.type) {
      case IndexingReportType.ERROR_METAFLAC_PARSING:
        return IndexingErrorMetaflacParsingModel;
      case IndexingReportType.WARNING_SUBDIRECTORIES:
        return IndexingWarningSubdirectoriesModel;
      case IndexingReportType.WARNING_FOLDER_METADATA:
        return IndexingWarningFolderMetadataModel;
      default:
        return null;
    }
  },
});

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

  @Field(() => [IndexingWarningUnion], { nullable: true })
  warnings?: IndexingWarning[];
}
