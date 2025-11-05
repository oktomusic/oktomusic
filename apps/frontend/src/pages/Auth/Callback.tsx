import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";

import { callback, getSession } from "../../api/axios/endpoints/auth";
import { authSessionAtom } from "../../atoms/auth/atoms";

export default function Callback() {
  const navigate = useNavigate();
  const setAuthSession = useSetAtom(authSessionAtom);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code) {
        setError("No authorization code found");
        setLoading(false);
        return;
      }

      try {
        // Exchange the code for tokens
        await callback(code, state || undefined);

        // Get the session to update state
        const session = await getSession();
        setAuthSession(session);

        // Redirect to home page
        navigate("/");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete authentication",
        );
        setLoading(false);
      }
    };

    void handleCallback();
  }, [navigate, setAuthSession]);

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
      {loading && (
        <>
          <h1>Completing Login...</h1>
          <p>Please wait while we authenticate you</p>
        </>
      )}
      {error && (
        <>
          <h1>Authentication Failed</h1>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => navigate("/login")}>Try Again</button>
        </>
      )}
    </div>
  );
}
