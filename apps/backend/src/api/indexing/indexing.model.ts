import {
  Field,
  Int,
  ObjectType,
  createUnionType,
  registerEnumType,
} from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

import {
  type IndexingErrorLyricsParsing,
  type IndexingErrorMetaflacParsing,
  type IndexingProgressStep,
  IndexingProgressStepKey,
  IndexingProgressStepStatus,
  IndexingReportLevel,
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
registerEnumType(IndexingReportLevel, { name: "IndexingReportLevel" });
registerEnumType(IndexingProgressStepKey, {
  name: "IndexingProgressStepKey",
});
registerEnumType(IndexingProgressStepStatus, {
  name: "IndexingProgressStepStatus",
});

@ObjectType("IndexingProgressStep")
export class IndexingProgressStepModel implements IndexingProgressStep {
  @Field(() => IndexingProgressStepKey)
  key!: IndexingProgressStepKey;

  @Field()
  label!: string;

  @Field(() => IndexingProgressStepStatus)
  status!: IndexingProgressStepStatus;

  @Field(() => Int, { nullable: true })
  current?: number;

  @Field(() => Int, { nullable: true })
  total?: number;

  @Field({ nullable: true })
  detail?: string;
}

@ObjectType("IndexingReportItem")
export class IndexingReportItemModel {
  @Field()
  id!: string;

  @Field(() => IndexingReportLevel)
  level!: IndexingReportLevel;

  @Field(() => IndexingReportType)
  type!: IndexingReportType;

  @Field()
  message!: string;

  @Field({ nullable: true })
  path?: string;

  @Field(() => [String], { nullable: true })
  details?: readonly string[];

  @Field(() => GraphQLISODateTime)
  emittedAt!: Date;
}

@ObjectType("IndexingErrorMetaflacParsing")
export class IndexingErrorMetaflacParsingModel implements IndexingErrorMetaflacParsing {
  @Field(() => IndexingReportType)
  type!: IndexingReportType.ERROR_METAFLAC_PARSING;

  @Field()
  filePath!: string;

  @Field()
  errorMessage!: string;
}

@ObjectType("IndexingErrorLyricsParsing")
export class IndexingErrorLyricsParsingModel implements IndexingErrorLyricsParsing {
  @Field(() => IndexingReportType)
  type!: IndexingReportType.ERROR_LYRICS_PARSING;

  @Field()
  filePath!: string;

  @Field()
  errorMessage!: string;
}

@ObjectType("IndexingWarningSubdirectories")
export class IndexingWarningSubdirectoriesModel implements IndexingWarningSubdirectories {
  @Field(() => IndexingReportType)
  type!: IndexingReportType.WARNING_SUBDIRECTORIES;

  @Field()
  dirPath!: string;
}

@ObjectType("IndexingWarningFolderMetadata")
export class IndexingWarningFolderMetadataModel implements IndexingWarningFolderMetadata {
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
      IndexingErrorLyricsParsingModel,
      IndexingWarningSubdirectoriesModel,
      IndexingWarningFolderMetadataModel,
    ] as const,
  resolveType(value: IndexingWarning) {
    switch (value.type) {
      case IndexingReportType.ERROR_METAFLAC_PARSING:
        return IndexingErrorMetaflacParsingModel;
      case IndexingReportType.ERROR_LYRICS_PARSING:
        return IndexingErrorLyricsParsingModel;
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

  @Field(() => GraphQLISODateTime, { nullable: true })
  startedAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  error?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt?: Date;

  @Field(() => [IndexingProgressStepModel])
  steps!: IndexingProgressStep[];

  @Field(() => [IndexingReportItemModel])
  reports!: IndexingReportItemModel[];

  @Field(() => [IndexingWarningUnion], { nullable: true })
  warnings?: IndexingWarning[];
}

@ObjectType("IndexingLibraryStats")
export class IndexingLibraryStatsModel {
  @Field(() => GraphQLISODateTime)
  generatedAt!: Date;

  @Field(() => Int)
  usersCount!: number;

  @Field(() => Int)
  artistsCount!: number;

  @Field(() => Int)
  albumsCount!: number;

  @Field(() => Int)
  tracksCount!: number;

  @Field(() => Int)
  flacFilesCount!: number;

  @Field(() => Int)
  tracksWithLyricsCount!: number;

  @Field(() => Int)
  playlistsCount!: number;

  @Field(() => Int)
  playlistTracksCount!: number;

  @Field(() => Int)
  savedLibraryItemsCount!: number;

  @Field(() => Int)
  playHistoryItemsCount!: number;
}

@ObjectType("IndexingOverview")
export class IndexingOverviewModel {
  @Field(() => IndexingJobModel, { nullable: true })
  latestJob?: IndexingJobModel;

  @Field(() => IndexingLibraryStatsModel)
  libraryStats!: IndexingLibraryStatsModel;
}
