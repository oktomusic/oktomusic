import { CombinedGraphQLErrors } from "@apollo/client/errors";

export function getErrorCode(error: unknown): string | null {
  if (CombinedGraphQLErrors.is(error) && error.errors[0]) {
    return (error.errors[0].extensions?.code as string | undefined) ?? null;
  }

  return null;
}

export function isNotFoundError(error: unknown): boolean {
  return getErrorCode(error) === "NOT_FOUND";
}

export function isUnauthenticatedError(error: unknown): boolean {
  return getErrorCode(error) === "UNAUTHENTICATED";
}

export function isForbiddenError(error: unknown): boolean {
  return getErrorCode(error) === "FORBIDDEN";
}

export function getErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0]) {
    return error.errors[0].message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}
