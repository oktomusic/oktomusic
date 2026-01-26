export enum IndexingReportType {
  ERROR_METAFLAC_PARSING = "ERROR_METAFLAC_PARSING",
  ERROR_LYRICS_PARSING = "ERROR_LYRICS_PARSING",
  WARNING_SUBDIRECTORIES = "WARNING_SUBDIRECTORIES",
  WARNING_FOLDER_METADATA = "WARNING_FOLDER_METADATA",
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
}
