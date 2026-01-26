/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
};

export type Album = {
  __typename?: "Album";
  artists: Array<Artist>;
  date?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  /** Tracks grouped by disc number, ordered by track number */
  tracksByDisc: Array<Array<Track>>;
};

export type AlbumBasic = {
  __typename?: "AlbumBasic";
  artists: Array<Artist>;
  date?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type Artist = {
  __typename?: "Artist";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type IndexingErrorMetaflacParsing = {
  __typename?: "IndexingErrorMetaflacParsing";
  errorMessage: Scalars["String"]["output"];
  filePath: Scalars["String"]["output"];
  type: IndexingReportType;
};

export type IndexingJob = {
  __typename?: "IndexingJob";
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  error?: Maybe<Scalars["String"]["output"]>;
  jobId: Scalars["String"]["output"];
  progress?: Maybe<Scalars["Float"]["output"]>;
  status: IndexingJobStatus;
  warnings?: Maybe<Array<IndexingWarning>>;
};

export enum IndexingJobStatus {
  Active = "ACTIVE",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Queued = "QUEUED",
}

export enum IndexingReportType {
  ErrorLyricsParsing = "ERROR_LYRICS_PARSING",
  ErrorMetaflacParsing = "ERROR_METAFLAC_PARSING",
  WarningFolderMetadata = "WARNING_FOLDER_METADATA",
  WarningSubdirectories = "WARNING_SUBDIRECTORIES",
}

export type IndexingWarning =
  | IndexingErrorMetaflacParsing
  | IndexingWarningFolderMetadata
  | IndexingWarningSubdirectories;

export type IndexingWarningFolderMetadata = {
  __typename?: "IndexingWarningFolderMetadata";
  folderPath: Scalars["String"]["output"];
  messages: Array<Scalars["String"]["output"]>;
  type: IndexingReportType;
};

export type IndexingWarningSubdirectories = {
  __typename?: "IndexingWarningSubdirectories";
  dirPath: Scalars["String"]["output"];
  type: IndexingReportType;
};

export type LyricsChunk = {
  __typename?: "LyricsChunk";
  /** Word or character */
  c: Scalars["String"]["output"];
  /** Duration in milliseconds since the start of the line */
  d: Scalars["Int"]["output"];
};

export type LyricsLine = {
  __typename?: "LyricsLine";
  /** Tokenized line content (word/character + duration) */
  l: Array<LyricsChunk>;
  /** Full text of the line */
  t: Scalars["String"]["output"];
  /** Timestamp end in milliseconds */
  te: Scalars["Int"]["output"];
  /** Timestamp start in milliseconds */
  ts: Scalars["Int"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  /** Update a user profile as an administrator */
  adminUpdateUserProfile: User;
  /** Trigger a new library indexing job */
  triggerIndexing: IndexingJob;
  /** Update the current user's profile */
  updateMyProfile: User;
};

export type MutationAdminUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
  userId: Scalars["String"]["input"];
};

export type MutationUpdateMyProfileArgs = {
  input: UpdateUserProfileInput;
};

export type Query = {
  __typename?: "Query";
  /** Get a single album by ID with tracks grouped by disc number */
  album: Album;
  /** Get a single artist by ID */
  artist: Artist;
  hello: Scalars["String"]["output"];
  /** Get the status of an indexing job */
  indexingJobStatus: IndexingJob;
  /** Current logged-in user */
  me: User;
  /** Search across tracks, albums, and artists with flexible filtering. Returns matching results for all entity types. Note: limit applies to each entity type separately. */
  search: SearchMusicResult;
  /** Search for albums with optional filters. Use this to get all albums by an artist. */
  searchAlbums: Array<Album>;
  /** Search for artists with optional filters */
  searchArtists: Array<Artist>;
  /** Search for tracks with optional filters */
  searchTracks: Array<Track>;
  /** Get a single track by ID */
  track: Track;
  /** User profile by identifier (admin access only) */
  userProfile: User;
};

export type QueryAlbumArgs = {
  id: Scalars["String"]["input"];
};

export type QueryArtistArgs = {
  id: Scalars["String"]["input"];
};

export type QueryIndexingJobStatusArgs = {
  jobId: Scalars["String"]["input"];
};

export type QuerySearchArgs = {
  input: SearchMusicInput;
};

export type QuerySearchAlbumsArgs = {
  input: SearchAlbumsInput;
};

export type QuerySearchArtistsArgs = {
  input: SearchArtistsInput;
};

export type QuerySearchTracksArgs = {
  input: SearchTracksInput;
};

export type QueryTrackArgs = {
  id: Scalars["String"]["input"];
};

export type QueryUserProfileArgs = {
  userId: Scalars["String"]["input"];
};

export enum Role {
  Admin = "ADMIN",
  User = "USER",
}

export type SearchAlbumsInput = {
  /** Filter by artist ID */
  artistId?: InputMaybe<Scalars["String"]["input"]>;
  /** Maximum number of results */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Filter by album name (case-insensitive partial match) */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Number of results to skip */
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SearchArtistsInput = {
  /** Maximum number of results */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Filter by artist name (case-insensitive partial match) */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Number of results to skip */
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SearchMusicInput = {
  /** Filter by exact album ID */
  albumId?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by album name (case-insensitive partial match) */
  albumName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by exact artist ID */
  artistId?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by artist name (case-insensitive partial match) */
  artistName?: InputMaybe<Scalars["String"]["input"]>;
  /** Include albums in search results */
  includeAlbums?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Include artists in search results */
  includeArtists?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Include tracks in search results */
  includeTracks?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Maximum number of results to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of results to skip */
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  /** Filter by track name (case-insensitive partial match) */
  trackName?: InputMaybe<Scalars["String"]["input"]>;
};

export type SearchMusicResult = {
  __typename?: "SearchMusicResult";
  albums: Array<Album>;
  artists: Array<Artist>;
  tracks: Array<Track>;
};

export type SearchTracksInput = {
  /** Filter by album ID */
  albumId?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by artist ID */
  artistId?: InputMaybe<Scalars["String"]["input"]>;
  /** Maximum number of results */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Filter by track name (case-insensitive partial match) */
  name?: InputMaybe<Scalars["String"]["input"]>;
  /** Number of results to skip */
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum Sex {
  Xx = "XX",
  Xy = "XY",
}

export type Subscription = {
  __typename?: "Subscription";
  /** Subscribe to indexing job status updates */
  indexingJobUpdated: IndexingJob;
};

export type SubscriptionIndexingJobUpdatedArgs = {
  jobId: Scalars["String"]["input"];
};

export type Track = {
  __typename?: "Track";
  /** Album metadata */
  album?: Maybe<AlbumBasic>;
  albumId?: Maybe<Scalars["String"]["output"]>;
  artists: Array<Artist>;
  date?: Maybe<Scalars["DateTime"]["output"]>;
  discNumber: Scalars["Int"]["output"];
  /** Duration in milliseconds */
  durationMs: Scalars["Int"]["output"];
  /** Linked FLAC file id if present */
  flacFileId?: Maybe<Scalars["String"]["output"]>;
  /** Whether the track has lyrics indexed */
  hasLyrics: Scalars["Boolean"]["output"];
  id: Scalars["String"]["output"];
  isrc?: Maybe<Scalars["String"]["output"]>;
  /** Optional lyrics data associated with the track */
  lyrics?: Maybe<Array<LyricsLine>>;
  name: Scalars["String"]["output"];
  trackNumber: Scalars["Int"]["output"];
};

export type UpdateUserProfileInput = {
  /** User sex chosen during profile setup */
  sex?: InputMaybe<Sex>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["String"]["output"];
  oidcSub: Scalars["String"]["output"];
  role: Role;
  sex?: Maybe<Sex>;
  updatedAt: Scalars["DateTime"]["output"];
  username: Scalars["String"]["output"];
};

export type AdminUpdateUserProfileMutationVariables = Exact<{
  userId: Scalars["String"]["input"];
  input: UpdateUserProfileInput;
}>;

export type AdminUpdateUserProfileMutation = {
  __typename?: "Mutation";
  adminUpdateUserProfile: {
    __typename?: "User";
    id: string;
    username: string;
    role: Role;
    sex?: Sex | null;
    updatedAt: any;
  };
};

export type TriggerIndexingMutationVariables = Exact<{ [key: string]: never }>;

export type TriggerIndexingMutation = {
  __typename?: "Mutation";
  triggerIndexing: {
    __typename?: "IndexingJob";
    jobId: string;
    status: IndexingJobStatus;
  };
};

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;

export type UpdateMyProfileMutation = {
  __typename?: "Mutation";
  updateMyProfile: {
    __typename?: "User";
    id: string;
    username: string;
    sex?: Sex | null;
  };
};

export type AlbumQueryVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type AlbumQuery = {
  __typename?: "Query";
  album: {
    __typename?: "Album";
    id: string;
    name: string;
    date?: any | null;
    artists: Array<{ __typename?: "Artist"; id: string; name: string }>;
    tracksByDisc: Array<
      Array<{
        __typename?: "Track";
        id: string;
        flacFileId?: string | null;
        name: string;
        trackNumber: number;
        discNumber: number;
        durationMs: number;
        artists: Array<{ __typename?: "Artist"; id: string; name: string }>;
      }>
    >;
  };
};

export type IndexingJobStatusQueryVariables = Exact<{
  jobId: Scalars["String"]["input"];
}>;

export type IndexingJobStatusQuery = {
  __typename?: "Query";
  indexingJobStatus: {
    __typename?: "IndexingJob";
    jobId: string;
    status: IndexingJobStatus;
    progress?: number | null;
    error?: string | null;
    completedAt?: any | null;
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: "Query";
  me: {
    __typename?: "User";
    id: string;
    username: string;
    role: Role;
    sex?: Sex | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type UserProfileQueryVariables = Exact<{
  userId: Scalars["String"]["input"];
}>;

export type UserProfileQuery = {
  __typename?: "Query";
  userProfile: {
    __typename?: "User";
    id: string;
    username: string;
    role: Role;
    sex?: Sex | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type IndexingJobUpdatedSubscriptionVariables = Exact<{
  jobId: Scalars["String"]["input"];
}>;

export type IndexingJobUpdatedSubscription = {
  __typename?: "Subscription";
  indexingJobUpdated: {
    __typename?: "IndexingJob";
    jobId: string;
    status: IndexingJobStatus;
    progress?: number | null;
    error?: string | null;
    completedAt?: any | null;
    warnings?: Array<
      | {
          __typename: "IndexingErrorMetaflacParsing";
          type: IndexingReportType;
          filePath: string;
          errorMessage: string;
        }
      | {
          __typename: "IndexingWarningFolderMetadata";
          type: IndexingReportType;
          folderPath: string;
          messages: Array<string>;
        }
      | {
          __typename: "IndexingWarningSubdirectories";
          type: IndexingReportType;
          dirPath: string;
        }
    > | null;
  };
};

export const AdminUpdateUserProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AdminUpdateUserProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "userId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateUserProfileInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminUpdateUserProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "userId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "sex" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AdminUpdateUserProfileMutation,
  AdminUpdateUserProfileMutationVariables
>;
export const TriggerIndexingDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TriggerIndexing" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "triggerIndexing" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TriggerIndexingMutation,
  TriggerIndexingMutationVariables
>;
export const UpdateMyProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMyProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateUserProfileInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateMyProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "sex" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateMyProfileMutation,
  UpdateMyProfileMutationVariables
>;
export const AlbumDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Album" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "album" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "date" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "artists" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tracksByDisc" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "flacFileId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "trackNumber" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "discNumber" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "durationMs" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "artists" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AlbumQuery, AlbumQueryVariables>;
export const IndexingJobStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "IndexingJobStatus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "indexingJobStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "progress" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "completedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IndexingJobStatusQuery,
  IndexingJobStatusQueryVariables
>;
export const MeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Me" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "sex" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UserProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "userId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "userId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "sex" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const IndexingJobUpdatedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "IndexingJobUpdated" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "indexingJobUpdated" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "progress" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "completedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "warnings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "__typename" },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: {
                            kind: "Name",
                            value: "IndexingErrorMetaflacParsing",
                          },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "filePath" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "errorMessage" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: {
                            kind: "Name",
                            value: "IndexingWarningSubdirectories",
                          },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "dirPath" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: {
                            kind: "Name",
                            value: "IndexingWarningFolderMetadata",
                          },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "folderPath" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messages" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IndexingJobUpdatedSubscription,
  IndexingJobUpdatedSubscriptionVariables
>;
