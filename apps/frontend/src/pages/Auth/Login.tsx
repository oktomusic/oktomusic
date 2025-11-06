export default function Login() {
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
