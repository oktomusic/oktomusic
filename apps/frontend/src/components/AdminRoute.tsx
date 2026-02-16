import { useAtomValue } from "jotai";
import { Navigate, Outlet } from "react-router";

import { authSessionAtom } from "../atoms/auth/atoms";
import { Role } from "../api/graphql/gql/graphql";

export default function AdminRoute() {
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
