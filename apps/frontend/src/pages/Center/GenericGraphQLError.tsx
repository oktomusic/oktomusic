import { ErrorLike } from "@apollo/client";

import { Generic404 } from "./Generic404";
import { isNotFoundError } from "../../utils/graphql_errors";

interface GenericGraphQLErrorProps {
  readonly error: ErrorLike;
}

export function GenericGraphQLError(props: GenericGraphQLErrorProps) {
  if (isNotFoundError(props.error)) {
    return <Generic404 />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <span className="text-4xl font-bold">Something went wrong</span>
    </div>
  );
}
