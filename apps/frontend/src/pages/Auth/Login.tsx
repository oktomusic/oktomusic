import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { Navigate, useSearchParams } from "react-router";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { pwaDeferredPromptAtom } from "../../atoms/app/atoms";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const authSession = useAtomValue(authSessionAtom);
  const pwaDeferedPrompt = useAtomValue(pwaDeferredPromptAtom);

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
    <div className="min-h-app-shell flex w-full items-center justify-center px-4">
      <div className="min-w-md rounded-md bg-sky-950 p-6 select-none">
        <h1 className="mb-4 w-full text-center text-2xl">{"Login"}</h1>
        <a
          role="button"
          className="align-center flex justify-center rounded-md bg-sky-900 p-4 text-center select-none hover:bg-sky-800"
          href="/api/auth/login"
        >
          {"Login with OIDC"}
        </a>
        <button
          id="login-install-button"
          className="align-center mt-4 flex w-full justify-center rounded-md bg-sky-900 p-4 text-center select-none hover:bg-sky-800"
          disabled={!pwaDeferedPrompt}
          onClick={() => {
            if (pwaDeferedPrompt) {
              void pwaDeferedPrompt.prompt();
            }
          }}
        >
          Install Application
        </button>
      </div>
    </div>
  );
}
