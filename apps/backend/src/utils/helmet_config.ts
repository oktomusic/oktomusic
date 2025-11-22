import type { HelmetOptions } from "helmet";

export function getHelmetConfig(isDev: boolean): Readonly<HelmetOptions> {
  const contentSecurityPolicy: HelmetOptions["contentSecurityPolicy"] = isDev
    ? false
    : {
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          blockAllMixedContent: [],
          childSrc: ["'none'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          frameSrc: ["'none'"],
          imgSrc: ["'self'", "data:", "blob:"],
          manifestSrc: ["'self'"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          requireTrustedTypesFor: ["'script'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          upgradeInsecureRequests: [],
          workerSrc: ["'self'"],
        },
      };

  return {
    contentSecurityPolicy,
    strictTransportSecurity: {
      maxAge: 63072000, // 2 years in seconds
      includeSubDomains: true,
      preload: true,
    },
    xPoweredBy: false,
  };
}
