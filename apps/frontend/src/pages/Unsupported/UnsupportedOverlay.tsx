type Props = {
  missing: string[];
};

export function UnsupportedOverlay({ missing }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0b1020",
        color: "#fff",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 720, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Your browser isn’t supported
        </h1>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          This app requires modern web features.
          <br />
          Please update your browser or try a different one (Chrome, Edge,
          Firefox, Safari).
          <br />
          Only Chromium based browsers are officially supported.
          <br />
          The following capabilities are missing:
        </p>
        {missing.length > 0 ? (
          <ul
            style={{
              listStyle: "disc",
              textAlign: "left",
              margin: "1rem auto",
              maxWidth: 480,
            }}
          >
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
        <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
          If you believe this is a mistake, ensure JavaScript is enabled and try
          clearing your cache.
        </p>
      </div>
    </div>
  );
}

export default UnsupportedOverlay;
