import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { Navigate, useSearchParams } from "react-router";

import { authSessionAtom } from "../../atoms/auth/atoms";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const authSession = useAtomValue(authSessionAtom);

  useEffect(() => {
    if (searchParams.get("auto_redirect") === "true") {
      setSearchParams({});
      window.location.href = "/api/auth/login";
    }
  }, [searchParams, setSearchParams]);

  if (authSession.status === "authenticated" && authSession.user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-full min-h-screen w-full sm:items-center sm:justify-center">
      <div className="min-w-md rounded-md bg-sky-950 p-6">
        <h1 className="mb-4 w-full text-center text-2xl">{"Login"}</h1>
        <a
          role="button"
          className="align-center flex justify-center rounded-md bg-sky-900 p-4 text-center select-none hover:bg-sky-800"
          href="/api/auth/login"
        >
          {"Login with OIDC"}
        </a>
      </div>
    </div>
  );
}
