import { CombinedGraphQLErrors } from "@apollo/client/errors";
import type { FormattedExecutionResult, GraphQLFormattedError } from "graphql";
import { describe, expect, it } from "vitest";

import {
  getErrorCode,
  getErrorMessage,
  isForbiddenError,
  isNotFoundError,
  isUnauthenticatedError,
} from "./graphql_errors";

const createGraphqlError = (
  overrides: Partial<GraphQLFormattedError> = {},
): GraphQLFormattedError => ({
  message: "Something went wrong",
  ...overrides,
});

const createCombinedErrors = (
  errors: GraphQLFormattedError[],
  data?: FormattedExecutionResult["data"],
): CombinedGraphQLErrors => {
  const result: FormattedExecutionResult = {
    data,
    errors,
  };

  return new CombinedGraphQLErrors(result);
};

describe("graphql_errors", () => {
  it("returns error code from GraphQL extensions", () => {
    const error = createCombinedErrors([
      createGraphqlError({
        message: "Album not found",
        extensions: { code: "NOT_FOUND" },
      }),
    ]);

    expect(getErrorCode(error)).toBe("NOT_FOUND");
    expect(isNotFoundError(error)).toBe(true);
    expect(isUnauthenticatedError(error)).toBe(false);
    expect(isForbiddenError(error)).toBe(false);
  });

  it("returns null when no GraphQL error code is present", () => {
    const error = createCombinedErrors([createGraphqlError()]);

    expect(getErrorCode(error)).toBeNull();
    expect(isNotFoundError(error)).toBe(false);
  });

  it("returns null for non-GraphQL errors", () => {
    expect(getErrorCode(new Error("Nope"))).toBeNull();
  });

  it("returns a message from GraphQL errors when available", () => {
    const error = createCombinedErrors([
      createGraphqlError({ message: "GraphQL failure" }),
    ]);

    expect(getErrorMessage(error)).toBe("GraphQL failure");
  });

  it("returns a message from standard errors", () => {
    expect(getErrorMessage(new Error("Network failure"))).toBe(
      "Network failure",
    );
  });

  it("returns a fallback message for unknown errors", () => {
    expect(getErrorMessage({})).toBe("An unknown error occurred");
  });
});
