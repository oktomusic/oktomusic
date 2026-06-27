export enum IndexingReportType {
  INFO_INDEXING_STARTED = "INFO_INDEXING_STARTED",
  INFO_INDEXING_COMPLETED = "INFO_INDEXING_COMPLETED",
  INFO_STAGE_STARTED = "INFO_STAGE_STARTED",
  INFO_STAGE_COMPLETED = "INFO_STAGE_COMPLETED",
  INFO_STAGE_SKIPPED = "INFO_STAGE_SKIPPED",
  INFO_INDEXING_SUMMARY = "INFO_INDEXING_SUMMARY",
  ERROR_INDEXING_FAILED = "ERROR_INDEXING_FAILED",
  ERROR_METAFLAC_PARSING = "ERROR_METAFLAC_PARSING",
  ERROR_LYRICS_PARSING = "ERROR_LYRICS_PARSING",
  WARNING_SUBDIRECTORIES = "WARNING_SUBDIRECTORIES",
  WARNING_FOLDER_METADATA = "WARNING_FOLDER_METADATA",
}

export enum IndexingReportLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export enum IndexingProgressStepKey {
  DISCOVER_FLAC_FOLDERS = "DISCOVER_FLAC_FOLDERS",
  EXTRACT_METADATA = "EXTRACT_METADATA",
  VALIDATE_METADATA = "VALIDATE_METADATA",
  ANALYZE_COVERS = "ANALYZE_COVERS",
  SYNC_ARTISTS = "SYNC_ARTISTS",
  SYNC_ALBUMS = "SYNC_ALBUMS",
  SYNC_TRACKS = "SYNC_TRACKS",
}

export enum IndexingProgressStepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  FAILED = "FAILED",
}

export interface IndexingProgressStep {
  readonly key: IndexingProgressStepKey;
  readonly label: string;
  readonly status: IndexingProgressStepStatus;
  readonly current?: number;
  readonly total?: number;
  readonly detail?: string;
}

export interface IndexingReportItem {
  readonly id: string;
  readonly level: IndexingReportLevel;
  readonly type: IndexingReportType;
  readonly message: string;
  readonly path?: string;
  readonly details?: readonly string[];
  readonly emittedAt: string;
}

export interface IndexingErrorMetaflacParsing {
  readonly type: IndexingReportType.ERROR_METAFLAC_PARSING;
  /**
   * Path to the file affected by the error, relative to the library root.
   */
  readonly filePath: string;
  readonly errorMessage: string;
}

export interface IndexingErrorLyricsParsing {
  readonly type: IndexingReportType.ERROR_LYRICS_PARSING;
  /**
   * Path to the lyrics file affected by the error, relative to the library root.
   */
  readonly filePath: string;
  readonly errorMessage: string;
}

export interface IndexingWarningSubdirectories {
  readonly type: IndexingReportType.WARNING_SUBDIRECTORIES;
  readonly dirPath: string;
}

export interface IndexingWarningFolderMetadata {
  readonly type: IndexingReportType.WARNING_FOLDER_METADATA;
  readonly folderPath: string;
  readonly messages: readonly string[];
}

export type IndexingWarning =
  | IndexingErrorMetaflacParsing
  | IndexingErrorLyricsParsing
  | IndexingWarningSubdirectories
  | IndexingWarningFolderMetadata;

export interface IndexingJobData {
  readonly warnings: IndexingWarning[];
  readonly reports?: IndexingReportItem[];
  readonly steps?: IndexingProgressStep[];
  readonly startedAt?: string;
  readonly updatedAt?: string;
}
