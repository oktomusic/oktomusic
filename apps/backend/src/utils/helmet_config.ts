import { HelmetOptions } from "helmet";

export function getHelmetConfig(
  isDev: boolean,
  viteOrigin?: string,
): Readonly<HelmetOptions> {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          ...(isDev ? ["'unsafe-inline'"] : []),
          ...(isDev && viteOrigin ? [viteOrigin] : []),
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          ...(isDev && viteOrigin ? [viteOrigin] : []),
        ],
        connectSrc: [
          "'self'",
          ...(isDev && viteOrigin
            ? [viteOrigin, viteOrigin.replace("http://", "ws://")]
            : []),
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          ...(isDev && viteOrigin ? [viteOrigin] : []),
        ],
        fontSrc: ["'self'", ...(isDev ? ["data:"] : [])],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: isDev ? [] : null,
      },
    },
    strictTransportSecurity: {
      maxAge: 63072000, // 2 years in seconds
      includeSubDomains: true,
      preload: true,
    },
    xPoweredBy: false,
  };
}
