import { useState } from "react";
import { login } from "../../api/axios/endpoints/auth";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await login();
      // Redirect to the OIDC provider
      window.location.href = result.authUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate login",
      );
      setLoading(false);
    }
  };

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
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Redirecting..." : "Login with OIDC"}
      </button>
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>Error: {error}</p>
      )}
    </div>
  );
}
