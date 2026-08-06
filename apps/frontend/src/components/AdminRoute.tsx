import { Navigate, Outlet } from "react-router";
import { useAtomValue } from "jotai";

import { Role } from "../api/graphql/gql/graphql";
import { authSessionAtom } from "../atoms/auth/atoms";

export function AdminRoute() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status === "unknown") {
    return (
      <section role="status" aria-live="polite" className="p-4">
        Checking your session...
      </section>
    );
  }

  if (authSession.user?.role !== Role.Admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
