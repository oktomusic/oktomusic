/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation AdminUpdateUserProfile(\n    $userId: String!\n    $input: UpdateUserProfileInput!\n  ) {\n    adminUpdateUserProfile(userId: $userId, input: $input) {\n      id\n      username\n      role\n      sex\n      updatedAt\n    }\n  }\n": typeof types.AdminUpdateUserProfileDocument,
    "\n  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      username\n      sex\n    }\n  }\n": typeof types.UpdateMyProfileDocument,
    "\n  query Me {\n    me {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.MeDocument,
    "\n  query UserProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UserProfileDocument,
};
const documents: Documents = {
    "\n  mutation AdminUpdateUserProfile(\n    $userId: String!\n    $input: UpdateUserProfileInput!\n  ) {\n    adminUpdateUserProfile(userId: $userId, input: $input) {\n      id\n      username\n      role\n      sex\n      updatedAt\n    }\n  }\n": types.AdminUpdateUserProfileDocument,
    "\n  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      username\n      sex\n    }\n  }\n": types.UpdateMyProfileDocument,
    "\n  query Me {\n    me {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n": types.MeDocument,
    "\n  query UserProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n": types.UserProfileDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdminUpdateUserProfile(\n    $userId: String!\n    $input: UpdateUserProfileInput!\n  ) {\n    adminUpdateUserProfile(userId: $userId, input: $input) {\n      id\n      username\n      role\n      sex\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation AdminUpdateUserProfile(\n    $userId: String!\n    $input: UpdateUserProfileInput!\n  ) {\n    adminUpdateUserProfile(userId: $userId, input: $input) {\n      id\n      username\n      role\n      sex\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      username\n      sex\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      username\n      sex\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query UserProfile($userId: String!) {\n    userProfile(userId: $userId) {\n      id\n      username\n      role\n      sex\n      createdAt\n      updatedAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;