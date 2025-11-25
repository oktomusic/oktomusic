import { useAtomValue } from "jotai";
import { Navigate, Outlet, useLocation } from "react-router";

import { authSessionAtom } from "../atoms/auth/atoms";

export default function ProtectedRoutes() {
  const location = useLocation();
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status === "unknown") {
    return (
      <section role="status" aria-live="polite" className="p-4">
        Checking your session...
      </section>
    );
  }

  if (authSession.status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
