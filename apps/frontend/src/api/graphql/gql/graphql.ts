/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type IndexingErrorMetaflacParsing = {
  __typename?: 'IndexingErrorMetaflacParsing';
  errorMessage: Scalars['String']['output'];
  filePath: Scalars['String']['output'];
  type: IndexingReportType;
};

export type IndexingJob = {
  __typename?: 'IndexingJob';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  jobId: Scalars['String']['output'];
  progress?: Maybe<Scalars['Float']['output']>;
  status: IndexingJobStatus;
  warnings?: Maybe<Array<IndexingWarning>>;
};

export enum IndexingJobStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Queued = 'QUEUED'
}

export enum IndexingReportType {
  ErrorMetaflacParsing = 'ERROR_METAFLAC_PARSING',
  WarningFolderMetadata = 'WARNING_FOLDER_METADATA',
  WarningSubdirectories = 'WARNING_SUBDIRECTORIES'
}

export type IndexingWarning = IndexingErrorMetaflacParsing | IndexingWarningFolderMetadata | IndexingWarningSubdirectories;

export type IndexingWarningFolderMetadata = {
  __typename?: 'IndexingWarningFolderMetadata';
  folderPath: Scalars['String']['output'];
  messages: Array<Scalars['String']['output']>;
  type: IndexingReportType;
};

export type IndexingWarningSubdirectories = {
  __typename?: 'IndexingWarningSubdirectories';
  dirPath: Scalars['String']['output'];
  type: IndexingReportType;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Update a user profile as an administrator */
  adminUpdateUserProfile: User;
  /** Trigger a new library indexing job */
  triggerIndexing: IndexingJob;
  /** Update the current user's profile */
  updateMyProfile: User;
};


export type MutationAdminUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
  userId: Scalars['String']['input'];
};


export type MutationUpdateMyProfileArgs = {
  input: UpdateUserProfileInput;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String']['output'];
  /** Get the status of an indexing job */
  indexingJobStatus: IndexingJob;
  /** Current logged-in user */
  me: User;
  /** User profile by identifier (admin access only) */
  userProfile: User;
};


export type QueryIndexingJobStatusArgs = {
  jobId: Scalars['String']['input'];
};


export type QueryUserProfileArgs = {
  userId: Scalars['String']['input'];
};

export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}

export enum Sex {
  Xx = 'XX',
  Xy = 'XY'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to indexing job status updates */
  indexingJobUpdated: IndexingJob;
};


export type SubscriptionIndexingJobUpdatedArgs = {
  jobId: Scalars['String']['input'];
};

export type UpdateUserProfileInput = {
  /** User sex chosen during profile setup */
  sex?: InputMaybe<Sex>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  oidcSub: Scalars['String']['output'];
  role: Role;
  sex?: Maybe<Sex>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type AdminUpdateUserProfileMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  input: UpdateUserProfileInput;
}>;


export type AdminUpdateUserProfileMutation = { __typename?: 'Mutation', adminUpdateUserProfile: { __typename?: 'User', id: string, username: string, role: Role, sex?: Sex | null, updatedAt: any } };

export type TriggerIndexingMutationVariables = Exact<{ [key: string]: never; }>;


export type TriggerIndexingMutation = { __typename?: 'Mutation', triggerIndexing: { __typename?: 'IndexingJob', jobId: string, status: IndexingJobStatus } };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateMyProfileMutation = { __typename?: 'Mutation', updateMyProfile: { __typename?: 'User', id: string, username: string, sex?: Sex | null } };

export type IndexingJobStatusQueryVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type IndexingJobStatusQuery = { __typename?: 'Query', indexingJobStatus: { __typename?: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress?: number | null, error?: string | null, completedAt?: any | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username: string, role: Role, sex?: Sex | null, createdAt: any, updatedAt: any } };

export type UserProfileQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type UserProfileQuery = { __typename?: 'Query', userProfile: { __typename?: 'User', id: string, username: string, role: Role, sex?: Sex | null, createdAt: any, updatedAt: any } };

export type IndexingJobUpdatedSubscriptionVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type IndexingJobUpdatedSubscription = { __typename?: 'Subscription', indexingJobUpdated: { __typename?: 'IndexingJob', jobId: string, status: IndexingJobStatus, progress?: number | null, error?: string | null, completedAt?: any | null, warnings?: Array<
      | { __typename: 'IndexingErrorMetaflacParsing', type: IndexingReportType, filePath: string, errorMessage: string }
      | { __typename: 'IndexingWarningFolderMetadata', type: IndexingReportType, folderPath: string, messages: Array<string> }
      | { __typename: 'IndexingWarningSubdirectories', type: IndexingReportType, dirPath: string }
    > | null } };


export const AdminUpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUpdateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserProfileMutation, AdminUpdateUserProfileMutationVariables>;
export const TriggerIndexingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TriggerIndexing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"triggerIndexing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<TriggerIndexingMutation, TriggerIndexingMutationVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}}]}}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const IndexingJobStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndexingJobStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexingJobStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<IndexingJobStatusQuery, IndexingJobStatusQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const IndexingJobUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"IndexingJobUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexingJobUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingErrorMetaflacParsing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingWarningSubdirectories"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"dirPath"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IndexingWarningFolderMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"folderPath"}},{"kind":"Field","name":{"kind":"Name","value":"messages"}}]}}]}}]}}]}}]} as unknown as DocumentNode<IndexingJobUpdatedSubscription, IndexingJobUpdatedSubscriptionVariables>;