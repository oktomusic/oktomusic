import { useAtomValue } from "jotai";
import { Navigate } from "react-router";

import { authSessionAtom } from "../../atoms/auth/atoms";

export default function Login() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status === "authenticated" && authSession.user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Login</h1>
      <p>Click the button below to login with your OIDC provider</p>
      <a href="/api/auth/login">Login with OIDC</a>
    </div>
  );
}
