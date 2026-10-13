/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreatePlaylistInput = {
  /** Optional playlist description */
  description?: string | null | undefined;
  /** Playlist name */
  name: string;
  /** Target user ID (admin only, defaults to current user) */
  userId?: string | null | undefined;
  /** Visibility level of the playlist */
  visibility?: PlaylistVisibility | null | undefined;
};

export const IndexingJobStatus = {
  Active: 'ACTIVE',
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Queued: 'QUEUED'
} as const;

export type IndexingJobStatus = typeof IndexingJobStatus[keyof typeof IndexingJobStatus];
export const IndexingProgressStepKey = {
  AnalyzeCovers: 'ANALYZE_COVERS',
  DiscoverFlacFolders: 'DISCOVER_FLAC_FOLDERS',
  ExtractMetadata: 'EXTRACT_METADATA',
  SyncAlbums: 'SYNC_ALBUMS',
  SyncArtists: 'SYNC_ARTISTS',
  SyncTracks: 'SYNC_TRACKS',
  ValidateMetadata: 'VALIDATE_METADATA'
} as const;

export type IndexingProgressStepKey = typeof IndexingProgressStepKey[keyof typeof IndexingProgressStepKey];
export const IndexingProgressStepStatus = {
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Running: 'RUNNING',
  Skipped: 'SKIPPED'
} as const;

export type IndexingProgressStepStatus = typeof IndexingProgressStepStatus[keyof typeof IndexingProgressStepStatus];
export const IndexingReportLevel = {
  Error: 'ERROR',
  Info: 'INFO',
  Warning: 'WARNING'
} as const;

export type IndexingReportLevel = typeof IndexingReportLevel[keyof typeof IndexingReportLevel];
export const IndexingReportType = {
  ErrorIndexingFailed: 'ERROR_INDEXING_FAILED',
  ErrorLyricsParsing: 'ERROR_LYRICS_PARSING',
  ErrorMetaflacParsing: 'ERROR_METAFLAC_PARSING',
  InfoIndexingCompleted: 'INFO_INDEXING_COMPLETED',
  InfoIndexingStarted: 'INFO_INDEXING_STARTED',
  InfoIndexingSummary: 'INFO_INDEXING_SUMMARY',
  InfoStageCompleted: 'INFO_STAGE_COMPLETED',
  InfoStageSkipped: 'INFO_STAGE_SKIPPED',
  InfoStageStarted: 'INFO_STAGE_STARTED',
  WarningFolderMetadata: 'WARNING_FOLDER_METADATA',
  WarningSubdirectories: 'WARNING_SUBDIRECTORIES'
} as const;

export type IndexingReportType = typeof IndexingReportType[keyof typeof IndexingReportType];
export type LibraryItemRefInput = {
  itemId: string;
  itemType: LibraryItemType;
};

export const LibraryItemType = {
  Album: 'ALBUM',
  Playlist: 'PLAYLIST'
} as const;

export type LibraryItemType = typeof LibraryItemType[keyof typeof LibraryItemType];
/** Visibility level of a playlist */
export const PlaylistVisibility = {
  Private: 'PRIVATE',
  Public: 'PUBLIC',
  Unlisted: 'UNLISTED'
} as const;

export type PlaylistVisibility = typeof PlaylistVisibility[keyof typeof PlaylistVisibility];
export const Role = {
  Admin: 'ADMIN',
  User: 'USER'
} as const;

export type Role = typeof Role[keyof typeof Role];
export type SearchAlbumsInput = {
  /** Filter by artist ID */
  artistId?: string | null | undefined;
  /** Maximum number of results. Omit to return all matches. */
  limit?: number | null | undefined;
  /** Filter by album name (case-insensitive partial match) */
  name?: string | null | undefined;
  /** Number of results to skip */
  offset?: number | null | undefined;
};

export type SearchMusicInput = {
  /** Filter by exact album ID */
  albumId?: string | null | undefined;
  /** Maximum number of album results to return */
  albumLimit?: number | null | undefined;
  /** Filter by album name (case-insensitive partial match) */
  albumName?: string | null | undefined;
  /** Filter by exact artist ID */
  artistId?: string | null | undefined;
  /** Maximum number of artist results to return */
  artistLimit?: number | null | undefined;
  /** Filter by artist name (case-insensitive partial match) */
  artistName?: string | null | undefined;
  /** Include albums in search results */
  includeAlbums?: boolean | null | undefined;
  /** Include artists in search results */
  includeArtists?: boolean | null | undefined;
  /** Include playlists in search results */
  includePlaylists?: boolean | null | undefined;
  /** Include tracks in search results */
  includeTracks?: boolean | null | undefined;
  /** Maximum number of results to return */
  limit?: number | null | undefined;
  /** Number of results to skip */
  offset?: number | null | undefined;
  /** Maximum number of playlist results to return */
  playlistLimit?: number | null | undefined;
  /** Filter by playlist name (case-insensitive partial match) */
  playlistName?: string | null | undefined;
  /** Maximum number of track results to return */
  trackLimit?: number | null | undefined;
  /** Filter by track name (case-insensitive partial match) */
  trackName?: string | null | undefined;
};

export const Sex = {
  Xx: 'XX',
  Xy: 'XY'
} as const;

export type Sex = typeof Sex[keyof typeof Sex];
export type UpdatePlaylistInput = {
  /** Optional playlist description, or null to clear */
  description?: string | null | undefined;
  /** Playlist name */
  name?: string | null | undefined;
  /** Visibility level of the playlist */
  visibility?: PlaylistVisibility | null | undefined;
};

export type UpdateUserProfileInput = {
  /** User sex chosen during profile setup */
  sex?: Sex | null | undefined;
};

export const UserLibraryItemSource = {
  OwnedPlaylist: 'OWNED_PLAYLIST',
  Saved: 'SAVED'
} as const;

export type UserLibraryItemSource = typeof UserLibraryItemSource[keyof typeof UserLibraryItemSource];
export type AddLibraryItemMutationVariables = Exact<{
  input: LibraryItemRefInput;
}>;


export type AddLibraryItemMutation = { __typename: 'Mutation', addLibraryItem: { __typename: 'UserLibraryEntry', id: string, itemType: LibraryItemType, itemId: string, source: UserLibraryItemSource } };

export type AdminUpdateUserProfileMutationVariables = Exact<{
  userId: string;
  input: UpdateUserProfileInput;
}>;


export type AdminUpdateUserProfileMutation = { __typename: 'Mutation', adminUpdateUserProfile: { __typename: 'User', id: string, username: string, role: Role, sex: Sex | null, updatedAt: Date } };

export type CleanItemPlayMutationVariables = Exact<{ [key: string]: never; }>;


export type CleanItemPlayMutation = { __typename: 'Mutation', cleanItemPlay: boolean };

export type AddTracksToPlaylistMutationVariables = Exact<{
  id: string;
  trackIds: Array<string> | string;
  position?: number | null | undefined;
}>;


export type AddTracksToPlaylistMutation = { __typename: 'Mutation', addTracksToPlaylist: boolean };

export type CreatePlaylistMutationVariables = Exact<{
  input: CreatePlaylistInput;
}>;


export type CreatePlaylistMutation = { __typename: 'Mutation', createPlaylist: { __typename: 'Playlist', id: string, name: string, description: string | null, visibility: PlaylistVisibility, createdAt: Date, updatedAt: Date, tracks: Array<{ __typename: 'PlaylistTrack', position: number, addedAt: Date, track: { __typename: 'Track', id: string, name: string, durationMs: number } }> } };

export type DeletePlaylistMutationVariables = Exact<{
  id: string;
}>;


export type DeletePlaylistMutation = { __typename: 'Mutation', deletePlaylist: boolean };

export type RemoveTracksFromPlaylistMutationVariables = Exact<{
  id: string;
  positions: Array<number> | number;
}>;


export type RemoveTracksFromPlaylistMutation = { __typename: 'Mutation', removeTracksFromPlaylist: boolean };

export type ReorderPlaylistTracksMutationVariables = Exact<{
  id: string;
  fromPosition: number;
  toPosition: number;
  count?: number | null | undefined;
}>;


export type ReorderPlaylistTracksMutation = { __typename: 'Mutation', reorderPlaylistTracks: boolean };

export type UpdatePlaylistMutationVariables = Exact<{
  id: string;
  input: UpdatePlaylistInput;
}>;


export type UpdatePlaylistMutation = { __typename: 'Mutation', updatePlaylist: { __typename: 'Playlist', id: string, name: string, description: string | null, visibility: PlaylistVisibility, createdAt: Date, updatedAt: Date, tracks: Array<{ __typename: 'PlaylistTrack', position: number, addedAt: Date, track: { __typename: 'Track', id: string, name: string, durationMs: number } }> } };

export type RecordItemPlayMutationVariables = Exact<{
  itemType: LibraryItemType;
  itemId: string;
}>;


export type RecordItemPlayMutation = { __typename: 'Mutation', recordItemPlay: boolean };

export type RemoveLibraryItemMutationVariables = Exact<{
  input: LibraryItemRefInput;
}>;


export type RemoveLibraryItemMutation = { __typename: 'Mutation', removeLibraryItem: boolean };

export type TriggerIndexingMutationVariables = Exact<{ [key: string]: never; }>;


export type TriggerIndexingMutation = { __typename: 'Mutation', triggerIndexing: { __typename: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress: number | null, startedAt: Date | null, updatedAt: Date | null, error: string | null, completedAt: Date | null, steps: Array<{ __typename: 'IndexingProgressStep', key: IndexingProgressStepKey, label: string, status: IndexingProgressStepStatus, current: number | null, total: number | null, detail: string | null }>, reports: Array<{ __typename: 'IndexingReportItem', id: string, level: IndexingReportLevel, type: IndexingReportType, message: string, path: string | null, details: Array<string> | null, emittedAt: Date }> } };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateMyProfileMutation = { __typename: 'Mutation', updateMyProfile: { __typename: 'User', id: string, username: string, sex: Sex | null } };

export type AlbumQueryVariables = Exact<{
  id: string;
}>;


export type AlbumQuery = { __typename: 'Query', album: { __typename: 'Album', id: string, name: string, isInLibrary: boolean, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }>, tracksByDisc: Array<Array<{ __typename: 'Track', id: string, flacFileId: string | null, hasLyrics: boolean, name: string, trackNumber: number, discNumber: number, durationMs: number, artists: Array<{ __typename: 'Artist', id: string, name: string }> }>> } };

export type ArtistQueryVariables = Exact<{
  id: string;
}>;


export type ArtistQuery = { __typename: 'Query', artist: { __typename: 'ArtistDetail', id: string, name: string, albums: Array<{ __typename: 'AlbumBasic', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> }>, featuredOnAlbums: Array<{ __typename: 'AlbumBasic', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> }> } };

export type IndexingJobStatusQueryVariables = Exact<{
  jobId: string;
}>;


export type IndexingJobStatusQuery = { __typename: 'Query', indexingJobStatus: { __typename: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress: number | null, error: string | null, completedAt: Date | null } };

export type IndexingOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type IndexingOverviewQuery = { __typename: 'Query', indexingOverview: { __typename: 'IndexingOverview', libraryStats: { __typename: 'IndexingLibraryStats', generatedAt: Date, usersCount: number, artistsCount: number, albumsCount: number, tracksCount: number, flacFilesCount: number, tracksWithLyricsCount: number, playlistsCount: number, playlistTracksCount: number, savedLibraryItemsCount: number, playHistoryItemsCount: number }, latestJob: { __typename: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress: number | null, startedAt: Date | null, updatedAt: Date | null, error: string | null, completedAt: Date | null, steps: Array<{ __typename: 'IndexingProgressStep', key: IndexingProgressStepKey, label: string, status: IndexingProgressStepStatus, current: number | null, total: number | null, detail: string | null }>, reports: Array<{ __typename: 'IndexingReportItem', id: string, level: IndexingReportLevel, type: IndexingReportType, message: string, path: string | null, details: Array<string> | null, emittedAt: Date }> } | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename: 'Query', me: { __typename: 'User', id: string, username: string, role: Role, sex: Sex | null, createdAt: Date, updatedAt: Date } };

export type MyLibraryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyLibraryQuery = { __typename: 'Query', myLibrary: { __typename: 'UserLibrary', items: Array<{ __typename: 'UserLibraryEntry', id: string, itemType: LibraryItemType, itemId: string, source: UserLibraryItemSource, addedAt: Date, lastPlayedAt: Date | null, item:
        | { __typename: 'AlbumBasic', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> }
        | { __typename: 'PlaylistBasic', id: string, name: string, description: string | null, visibility: PlaylistVisibility, coverAlbumIds: Array<string>, creator: { __typename: 'PlaylistCreator', id: string, username: string } }
       }> } };

export type PlaylistQueryVariables = Exact<{
  id: string;
}>;


export type PlaylistQuery = { __typename: 'Query', playlist: { __typename: 'Playlist', id: string, name: string, isInLibrary: boolean, description: string | null, visibility: PlaylistVisibility, coverAlbumIds: Array<string>, creator: { __typename: 'PlaylistCreator', id: string, username: string }, tracks: Array<{ __typename: 'PlaylistTrack', position: number, addedAt: Date, track: { __typename: 'Track', id: string, flacFileId: string | null, hasLyrics: boolean, name: string, trackNumber: number, discNumber: number, durationMs: number, artists: Array<{ __typename: 'Artist', id: string, name: string }>, album: { __typename: 'AlbumBasic', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> } | null } }> } };

export type SearchAlbumsQueryVariables = Exact<{
  input: SearchAlbumsInput;
}>;


export type SearchAlbumsQuery = { __typename: 'Query', searchAlbums: Array<{ __typename: 'Album', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> }> };

export type SearchMusicQueryVariables = Exact<{
  input: SearchMusicInput;
}>;


export type SearchMusicQuery = { __typename: 'Query', search: { __typename: 'SearchMusicResult', tracks: Array<{ __typename: 'Track', id: string, name: string, flacFileId: string | null, hasLyrics: boolean, trackNumber: number, discNumber: number, durationMs: number, artists: Array<{ __typename: 'Artist', id: string, name: string }>, album: { __typename: 'AlbumBasic', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> } | null }>, albums: Array<{ __typename: 'Album', id: string, name: string, date: Date | null, coverColorVibrant: string, coverColorDarkVibrant: string, coverColorLightVibrant: string, coverColorMuted: string, coverColorDarkMuted: string, coverColorLightMuted: string, artists: Array<{ __typename: 'Artist', id: string, name: string }> }>, artists: Array<{ __typename: 'Artist', id: string, name: string }>, playlists: Array<{ __typename: 'PlaylistBasic', id: string, name: string, description: string | null, visibility: PlaylistVisibility, coverAlbumIds: Array<string>, creator: { __typename: 'PlaylistCreator', id: string, username: string } }> } };

export type SearchMyPlaylistsQueryVariables = Exact<{
  name: string;
  limit?: number | null | undefined;
}>;


export type SearchMyPlaylistsQuery = { __typename: 'Query', searchMyPlaylists: Array<{ __typename: 'PlaylistBasic', id: string, name: string, description: string | null, visibility: PlaylistVisibility, coverAlbumIds: Array<string>, creator: { __typename: 'PlaylistCreator', id: string, username: string } }> };

export type TrackLyricsQueryVariables = Exact<{
  id: string;
}>;


export type TrackLyricsQuery = { __typename: 'Query', track: { __typename: 'Track', id: string, hasLyrics: boolean, lyrics: Array<{ __typename: 'LyricsLine', t: string, te: number, ts: number, l: Array<{ __typename: 'LyricsChunk', c: string, d: number }> }> | null } };

export type UserProfileQueryVariables = Exact<{
  userId: string;
}>;


export type UserProfileQuery = { __typename: 'Query', userProfile: { __typename: 'User', id: string, username: string, role: Role, sex: Sex | null, createdAt: Date, updatedAt: Date, playlists: Array<{ __typename: 'PlaylistBasic', id: string, name: string, description: string | null, visibility: PlaylistVisibility, coverAlbumIds: Array<string>, creator: { __typename: 'PlaylistCreator', id: string, username: string } }> | null } };

export type IndexingJobUpdatedSubscriptionVariables = Exact<{
  jobId: string;
}>;


export type IndexingJobUpdatedSubscription = { __typename: 'Subscription', indexingJobUpdated: { __typename: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress: number | null, startedAt: Date | null, updatedAt: Date | null, error: string | null, completedAt: Date | null, steps: Array<{ __typename: 'IndexingProgressStep', key: IndexingProgressStepKey, label: string, status: IndexingProgressStepStatus, current: number | null, total: number | null, detail: string | null }>, reports: Array<{ __typename: 'IndexingReportItem', id: string, level: IndexingReportLevel, type: IndexingReportType, message: string, path: string | null, details: Array<string> | null, emittedAt: Date }>, warnings: Array<
      | { __typename: 'IndexingErrorLyricsParsing', type: IndexingReportType, filePath: string, errorMessage: string }
      | { __typename: 'IndexingErrorMetaflacParsing', type: IndexingReportType, filePath: string, errorMessage: string }
      | { __typename: 'IndexingWarningFolderMetadata', type: IndexingReportType, folderPath: string, messages: Array<string> }
      | { __typename: 'IndexingWarningSubdirectories', type: IndexingReportType, dirPath: string }
    > | null } };


export const AddLibraryItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddLibraryItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryItemRefInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addLibraryItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"itemType"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<AddLibraryItemMutation, AddLibraryItemMutationVariables>;
export const AdminUpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserProfileMutation, AdminUpdateUserProfileMutationVariables>;
export const CleanItemPlayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CleanItemPlay"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cleanItemPlay"}}]}}]} as unknown as DocumentNode<CleanItemPlayMutation, CleanItemPlayMutationVariables>;
export const AddTracksToPlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTracksToPlaylist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"position"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTracksToPlaylist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"trackIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"position"},"value":{"kind":"Variable","name":{"kind":"Name","value":"position"}}}]}]}}]} as unknown as DocumentNode<AddTracksToPlaylistMutation, AddTracksToPlaylistMutationVariables>;
export const CreatePlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePlaylist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePlaylistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPlaylist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"addedAt"}},{"kind":"Field","name":{"kind":"Name","value":"track"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreatePlaylistMutation, CreatePlaylistMutationVariables>;
export const DeletePlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePlaylist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePlaylist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeletePlaylistMutation, DeletePlaylistMutationVariables>;
export const RemoveTracksFromPlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTracksFromPlaylist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"positions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTracksFromPlaylist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"positions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"positions"}}}]}]}}]} as unknown as DocumentNode<RemoveTracksFromPlaylistMutation, RemoveTracksFromPlaylistMutationVariables>;
export const ReorderPlaylistTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderPlaylistTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromPosition"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toPosition"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderPlaylistTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromPosition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromPosition"}}},{"kind":"Argument","name":{"kind":"Name","value":"toPosition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toPosition"}}},{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}}]}]}}]} as unknown as DocumentNode<ReorderPlaylistTracksMutation, ReorderPlaylistTracksMutationVariables>;
export const UpdatePlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePlaylist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePlaylistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePlaylist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"addedAt"}},{"kind":"Field","name":{"kind":"Name","value":"track"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePlaylistMutation, UpdatePlaylistMutationVariables>;
export const RecordItemPlayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordItemPlay"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryItemType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordItemPlay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemType"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}]}]}}]} as unknown as DocumentNode<RecordItemPlayMutation, RecordItemPlayMutationVariables>;
export const RemoveLibraryItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveLibraryItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryItemRefInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeLibraryItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveLibraryItemMutation, RemoveLibraryItemMutationVariables>;
export const TriggerIndexingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TriggerIndexing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"triggerIndexing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"emittedAt"}}]}}]}}]}}]} as unknown as DocumentNode<TriggerIndexingMutation, TriggerIndexingMutationVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}}]}}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const AlbumDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Album"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"album"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isInLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracksByDisc"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"flacFileId"}},{"kind":"Field","name":{"kind":"Name","value":"hasLyrics"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AlbumQuery, AlbumQueryVariables>;
export const ArtistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Artist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"artist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredOnAlbums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ArtistQuery, ArtistQueryVariables>;
export const IndexingJobStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndexingJobStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexingJobStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<IndexingJobStatusQuery, IndexingJobStatusQueryVariables>;
export const IndexingOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndexingOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexingOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"usersCount"}},{"kind":"Field","name":{"kind":"Name","value":"artistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"albumsCount"}},{"kind":"Field","name":{"kind":"Name","value":"tracksCount"}},{"kind":"Field","name":{"kind":"Name","value":"flacFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"tracksWithLyricsCount"}},{"kind":"Field","name":{"kind":"Name","value":"playlistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"playlistTracksCount"}},{"kind":"Field","name":{"kind":"Name","value":"savedLibraryItemsCount"}},{"kind":"Field","name":{"kind":"Name","value":"playHistoryItemsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestJob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"emittedAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<IndexingOverviewQuery, IndexingOverviewQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MyLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLibrary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLibrary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"itemType"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"addedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastPlayedAt"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AlbumBasic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaylistBasic"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coverAlbumIds"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyLibraryQuery, MyLibraryQueryVariables>;
export const PlaylistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Playlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isInLibrary"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coverAlbumIds"}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"addedAt"}},{"kind":"Field","name":{"kind":"Name","value":"track"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"flacFileId"}},{"kind":"Field","name":{"kind":"Name","value":"hasLyrics"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"album"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PlaylistQuery, PlaylistQueryVariables>;
export const SearchAlbumsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchAlbums"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchAlbumsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SearchAlbumsQuery, SearchAlbumsQueryVariables>;
export const SearchMusicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchMusic"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchMusicInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"flacFileId"}},{"kind":"Field","name":{"kind":"Name","value":"hasLyrics"}},{"kind":"Field","name":{"kind":"Name","value":"trackNumber"}},{"kind":"Field","name":{"kind":"Name","value":"discNumber"}},{"kind":"Field","name":{"kind":"Name","value":"durationMs"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"album"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"albums"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightVibrant"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorDarkMuted"}},{"kind":"Field","name":{"kind":"Name","value":"coverColorLightMuted"}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"playlists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coverAlbumIds"}}]}}]}}]}}]} as unknown as DocumentNode<SearchMusicQuery, SearchMusicQueryVariables>;
export const SearchMyPlaylistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchMyPlaylists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchMyPlaylists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coverAlbumIds"}}]}}]}}]} as unknown as DocumentNode<SearchMyPlaylistsQuery, SearchMyPlaylistsQueryVariables>;
export const TrackLyricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrackLyrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"track"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hasLyrics"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"l"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"c"}},{"kind":"Field","name":{"kind":"Name","value":"d"}}]}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"te"}},{"kind":"Field","name":{"kind":"Name","value":"ts"}}]}}]}}]}}]} as unknown as DocumentNode<TrackLyricsQuery, TrackLyricsQueryVariables>;
export const UserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"playlists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coverAlbumIds"}}]}}]}}]}}]} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const IndexingJobUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"IndexingJobUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexingJobUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"emittedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"warnings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingErrorMetaflacParsing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingErrorLyricsParsing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingWarningSubdirectories"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"dirPath"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingWarningFolderMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"folderPath"}},{"kind":"Field","name":{"kind":"Name","value":"messages"}}]}}]}}]}}]}}]} as unknown as DocumentNode<IndexingJobUpdatedSubscription, IndexingJobUpdatedSubscriptionVariables>;