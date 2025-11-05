import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";

import {
  getSession,
  logout as apiLogout,
  refreshToken,
} from "../../api/axios/endpoints/auth";
import { authSessionAtom, isRefreshingAtom } from "../../atoms/auth/atoms";

export default function Dashboard() {
  const navigate = useNavigate();
  const [authSession, setAuthSession] = useAtom(authSessionAtom);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        setAuthSession(session);

        if (!session.authenticated) {
          navigate("/login");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to check session",
        );
      }
    };

    void checkSession();
  }, [setAuthSession, navigate]);

  // Auto-refresh token every 50 minutes
  useEffect(() => {
    if (!authSession.authenticated) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          setIsRefreshing(true);
          await refreshToken();
          const session = await getSession();
          setAuthSession(session);
        } catch (err) {
          console.error("Token refresh failed:", err);
          // If refresh fails, redirect to login
          navigate("/login");
        } finally {
          setIsRefreshing(false);
        }
      },
      50 * 60 * 1000,
    ); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [authSession.authenticated, setAuthSession, setIsRefreshing, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      await refreshToken();
      const session = await getSession();
      setAuthSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh token");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await apiLogout();

      // Clear session state
      setAuthSession({ authenticated: false });

      // Redirect to OIDC provider logout if URL provided
      if (result.logoutUrl) {
        window.location.href = result.logoutUrl;
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    }
  };

  if (!authSession.authenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <p>Checking authentication...</p>
      </div>
    );
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
      <h1>Dashboard</h1>
      <p style={{ color: "green", fontWeight: "bold" }}>
        ✓ You are logged in!
      </p>

      {isRefreshing && (
        <p style={{ fontStyle: "italic" }}>Refreshing token...</p>
      )}

      <div style={{ marginTop: "20px", maxWidth: "600px" }}>
        <h2>User Information</h2>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            textAlign: "left",
            overflow: "auto",
          }}
        >
          {JSON.stringify(authSession.userInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? "Refreshing..." : "Refresh Token"}
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>Error: {error}</p>
      )}
    </div>
  );
}
